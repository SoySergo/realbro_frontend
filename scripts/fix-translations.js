
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../messages');
const SRC_DIR = path.join(__dirname, '../src');

// Function to deeply merge objects
function deepMerge(target, source) {
    if (typeof source !== 'object' || source === null) return source;
    if (typeof target !== 'object' || target === null) target = {};
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                target[key] = deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

// Function to set value at path
function setPath(obj, pathArr, value) {
    let current = obj;
    for (let i = 0; i < pathArr.length - 1; i++) {
        const key = pathArr[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    const lastKey = pathArr[pathArr.length - 1];
    if (current[lastKey] === undefined) {
        current[lastKey] = value;
        return true; // Added
    }
    return false; // Existed
}

// Function to scan files for translation usage
function scanFiles(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanFiles(fullPath, callback);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            callback(content, fullPath);
        }
    }
}

// Main logic
const allKeys = new Set();
const fileContentMap = {};

console.log('Scanning source code...');
scanFiles(SRC_DIR, (content, filePath) => {
    // Regex 1: Find hook usage to get variable name and namespace
    // const t = useTranslations('namespace');
    // const t = useTranslations();
    const hookRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:use|get)Translations\s*\(\s*(?:['"]([^'"]*)['"])?\s*\)/g;
    
    let match;
    const scopes = [];
    
    while ((match = hookRegex.exec(content)) !== null) {
        const varName = match[1];
        const namespace = match[2] || ''; // Empty string if global
        scopes.push({ varName, namespace });
    }

    if (scopes.length > 0) {
      // Find usages for each scope
      for (const scope of scopes) {
          const { varName, namespace } = scope;
          // Regex 2: Find t('key') calls
          // varName('key')
          const usageRegex = new RegExp(`\\b${varName}\\s*\\(\\s*['"]([a-zA-Z0-9_\\-\\.]+)['"]\\s*\\)`, 'g');
          
          let usageMatch;
          while ((usageMatch = usageRegex.exec(content)) !== null) {
              const key = usageMatch[1];
              let fullKey = key;
              if (namespace) {
                  fullKey = `${namespace}.${key}`;
              }
              allKeys.add(fullKey);
          }
      }
    }
    
    // Also naive regex for t('...') without variable tracking just in case (e.g. passed as prop)
    // This is risky but helps catch some edge cases. Let's skip for now to avoid false positives.
});

console.log(`Found ${allKeys.size} unique translation keys in source code.`);

// Read existing translations
const locales = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json'));
const localeData = {};

console.log('Reading existing translation files...');
locales.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf8'));
    localeData[file] = content;
});

// Build content map from highest priority language to lowest
// Priority: en > es > it > fr > de > pt > ru > uk > others
const PRIORITY_ORDER = ['en.json', 'es.json', 'it.json', 'fr.json', 'de.json', 'pt.json', 'ru.json', 'uk.json'];

// Sort locales based on priority
const sortedLocales = [...locales].sort((a, b) => {
    const idxA = PRIORITY_ORDER.indexOf(a);
    const idxB = PRIORITY_ORDER.indexOf(b);
    // If both are in priority list
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    // If only A is in list
    if (idxA !== -1) return -1;
    // If only B is in list
    if (idxB !== -1) return 1;
    // Neither in list, sort alphabetically
    return a.localeCompare(b);
});

// Create master structure by merging in REVERSE priority order
// So higher priority overwrites lower priority
let masterStructure = {};
// We want high priority languages to be the final source of truth for values
// So we merge: low priority -> ... -> high priority
// Wait, deepMerge(target, source) copies source INTO target.
// So if we do deepMerge(master, lowPriority), then deepMerge(master, highPriority),
// highPriority values will overwrite lowPriority values.
// This is what we want for the "master value" to be English if available.

// Reverse the sorted list so we start with low priority and end with high priority
const reverseSortedLocales = [...sortedLocales].reverse();

console.log('Building master structure with priority:', sortedLocales.join(' > '));

reverseSortedLocales.forEach(file => {
   if (localeData[file]) {
       masterStructure = deepMerge(masterStructure, localeData[file]);
   }
});

// Add found source keys to master structure (avoid overwriting existing values)
console.log('Merging source keys into master structure...');
allKeys.forEach(key => {
    const parts = key.split('.');
    // Check if key exists in master structure (deep check)
    let current = masterStructure;
    let exists = true;
    for (const part of parts) {
        if (current[part] === undefined) {
            exists = false;
            break;
        }
        current = current[part];
    }
    
    if (!exists) {
        // Add minimal structure with placeholder
        setPath(masterStructure, parts, `[MISSING] ${key}`); 
    }
});

// Update all locale files
console.log('Updating locale files...');
locales.forEach(file => {
    const currentData = localeData[file];
    // We want to ensure everything in masterStructure exists in currentData
    // We can use deepMerge again, but we iterate masterStructure to fill missing
    
    function fillMissing(target, source, pathPrefix = '') {
        let addedCount = 0;
        for (const key in source) {
            const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            if (typeof source[key] === 'object' && source[key] !== null) {
                if (!target[key]) {
                    target[key] = {}; 
                    addedCount++;
                }
                if (typeof target[key] !== 'object') {
                   // Conflict: source has object, target has string. Should not happen if keys unique.
                   // But if it happens, we prioritize object structure? No, existing string is data.
                   console.warn(`Conflict at ${currentPath}: source is object, target is ${typeof target[key]}`);
                   continue;
                }
                addedCount += fillMissing(target[key], source[key], currentPath);
            } else {
                // Leaf node (string)
                if (target[key] === undefined) {
                    target[key] = source[key]; // Use the value from master (which might be placeholder or from another lang)
                    addedCount++;
                    // If source value is real text (not [MISSING]), maybe append suffix?
                    // User asked to "create these keys".
                    // If we copy value from another language, it's misleading. 
                    // Better to use key name or placeholder.
                    
                    // Actually, if masterStructure got its value from e.g. 'en.json', then 'it.json' gets English text.
                    // This is usually good default behavior (fallback to English/Source).
                    // If masterStructure got value from source code scan (placeholder), then it gets placeholder.
                    
                    // Let's refine:
                    // Only use placeholder if it doesn't exist in master either (source code only). 
                    // But master is merge of all languages. So if 'complaint.title' is in 'it.json', 
                    // master has Italian value. 'pt.json' will get Italian value.
                    // Ideally we want "[MISSING] complaint.title" or similar if we don't have PT value.
                    // But copying IT value is also acceptable for "fixing build".
                    // The user said: "fix keys ... used but missing ... create keys".
                    
                    // Let's stick with copying value from master (which is one of existing languages or placeholder).
                    // But maybe modify it to indicate it's copied? e.g. "[COPY] ..."
                    // For now, raw copy is safest for build stability.
                    
                    // Wait, if IT has "Titolo", PT gets "Titolo". That's confusing.
                    // Maybe better to force placeholder if value comes from another lat?
                    // No, that's complex to track.
                    
                    // The Error `MISSING_MESSAGE` triggers when key is missing entirely.
                    // Providing *any* string fixes the error.
                    // Providing English/Italian string is better than crashing.
                }
            }
        }
        return addedCount;
    }

    const added = fillMissing(currentData, masterStructure);
    if (added > 0) {
        console.log(`Updated ${file}: added ${added} missing keys.`);
        fs.writeFileSync(path.join(MESSAGES_DIR, file), JSON.stringify(currentData, null, 2));
    } else {
        console.log(`Checked ${file}: up to date.`);
    }
});

console.log('Done.');

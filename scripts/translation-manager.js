
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../messages');
const KEYS_DIR = path.join(MESSAGES_DIR, 'keys');
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
    current[lastKey] = value;
}

// Function to get value at path
function getPath(obj, pathArr) {
    let current = obj;
    for (let i = 0; i < pathArr.length; i++) {
        const key = pathArr[i];
        if (current === undefined || current === null || typeof current !== 'object') {
            return undefined;
        }
        current = current[key];
    }
    return current;
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
const command = process.argv[2]; // 'extract' or 'inject'
const referenceLocale = process.argv[3] || 'ru'; // Default to Russian as requested

if (!command) {
    console.error('Usage: node scripts/translation-manager.js <extract|inject> [referenceLocale]');
    console.error('Example: node scripts/translation-manager.js extract ru');
    process.exit(1);
}

// Flatten object to dot notation
function flatten(obj, prefix = '', res = {}) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flatten(obj[key], prefix ? `${prefix}.${key}` : key, res);
        } else {
            res[prefix ? `${prefix}.${key}` : key] = obj[key];
        }
    }
    return res;
}

if (command === 'extract') {
    if (!fs.existsSync(KEYS_DIR)) {
        fs.mkdirSync(KEYS_DIR, { recursive: true });
    }

    console.log(`Scanning source code for translation keys used in project...`);
    const usedKeys = new Set();
    
    scanFiles(SRC_DIR, (content, filePath) => {
        // Strict regex to find 'useTranslations' hook
        const hookRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:use|get)Translations\s*\(\s*(?:['"]([^'"]*)['"])?\s*\)/g;
        
        // We find all scopes in the file
        let match;
        const scopes = [];
        
        while ((match = hookRegex.exec(content)) !== null) {
            scopes.push({ varName: match[1], namespace: match[2] || '' });
        }

        // For each scope, find usages
        if (scopes.length > 0) {
            scopes.forEach(({ varName, namespace }) => {
                // Find t('key') calls
                const usageRegex = new RegExp(`\\b${varName}\\s*\\(\\s*['"]([a-zA-Z0-9_\\-\\.]+)['"]`, 'g');
                let usageMatch;
                while ((usageMatch = usageRegex.exec(content)) !== null) {
                    const key = usageMatch[1];
                    const fullKey = namespace ? `${namespace}.${key}` : key;
                    usedKeys.add(fullKey);
                }
            });
        }
    });

    console.log(`Found ${usedKeys.size} unique keys usage in source code.`);

    // Determine target locales
    let targets = [];
    if (process.argv[3]) {
        targets.push(process.argv[3]);
    } else {
        // All files in messages dir
        targets = fs.readdirSync(MESSAGES_DIR)
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));
    }

    targets.forEach(referenceLocale => {
        // Read Reference Locale
        const refFile = `${referenceLocale}.json`;
        const refPath = path.join(MESSAGES_DIR, refFile);
        
        if (!fs.existsSync(refPath)) {
            console.error(`Reference locale file ${refFile} not found!`);
            return;
        }

        const refContent = JSON.parse(fs.readFileSync(refPath, 'utf8'));
        const refKeys = Object.keys(flatten(refContent));
        const refKeySet = new Set(refKeys);
        
        // Find missing keys
        const missingKeys = [];
        usedKeys.forEach(key => {
            if (!refKeySet.has(key)) {
                missingKeys.push(key);
            }
        });

        if (missingKeys.length > 0) {
            const missingObj = {};
            missingKeys.sort().forEach(key => {
                 const parts = key.split('.');
                 setPath(missingObj, parts, `[MISSING] ${key}`);
            });

            const outputPath = path.join(KEYS_DIR, `${referenceLocale}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(missingObj, null, 2));
            console.log(`[${referenceLocale}] Found ${missingKeys.length} missing keys. Saved to messages/keys/${referenceLocale}.json`);
        } else {
            console.log(`[${referenceLocale}] All code keys present.`);
        }
    });

} else if (command === 'inject') {
    // Inject
    console.log('Injecting translated keys back...');
    if (!fs.existsSync(KEYS_DIR)) {
        console.error('Keys directory messages/keys not found!');
        process.exit(1);
    }
    
    const locales = fs.readdirSync(MESSAGES_DIR).filter(file => file.endsWith('.json') && file !== 'package.json');
    locales.forEach(file => {
        const keysPath = path.join(KEYS_DIR, file);
        if (fs.existsSync(keysPath)) {
            const newKeysData = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
            const localePath = path.join(MESSAGES_DIR, file);
            let localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
            
            // Merge new keys into original locale file
            localeData = deepMerge(localeData, newKeysData);
            
            fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
            console.log(`${file}: Injected keys.`);
        }
    });
} else {
    console.error('Unknown command:', command);
}

console.log('Done.');

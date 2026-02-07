
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../messages');
const locales = fs.readdirSync(MESSAGES_DIR).filter(file => file.endsWith('.json') && file !== 'package.json');

function flatten(obj, prefix = '', res = {}) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flatten(obj[key], prefix ? `${prefix}.${key}` : key, res);
        } else {
            res[prefix ? `${prefix}.${key}` : key] = true;
        }
    }
    return res;
}

const allKeysSets = {};
const allKeysUnion = new Set();

locales.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf8'));
    const flat = flatten(content);
    const keys = Object.keys(flat);
    allKeysSets[file] = new Set(keys);
    keys.forEach(k => allKeysUnion.add(k));
    console.log(`${file}: ${keys.length} keys`);
});

const sortedKeys = Array.from(allKeysUnion).sort();

console.log('\n--- Comparison with Union of all keys ---');
locales.forEach(file => {
    const missing = sortedKeys.filter(k => !allKeysSets[file].has(k));
    console.log(`${file} is missing ${missing.length} keys from the union of all files.`);
    if (missing.length > 0 && missing.length < 10) {
        console.log(`   Missing: ${missing.join(', ')}`);
    } else if (missing.length > 0) {
        console.log(`   Example missing: ${missing.slice(0, 5).join(', ')} ...`);
    }
});

console.log('\n--- Intersection Analysis ---');
// Find keys that are in UK/CA but not in RU
const ukKeys = allKeysSets['uk.json'];
const ruKeys = allKeysSets['ru.json'];

if (ukKeys && ruKeys) {
    const inUkNotRu = [...ukKeys].filter(k => !ruKeys.has(k));
    console.log(`\nKeys in uk.json but NOT in ru.json (${inUkNotRu.length}):`);
    console.log(inUkNotRu.slice(0, 20).join('\n'));
}

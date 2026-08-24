const qr = require('qr-code-styling');
console.log('Import type:', typeof qr);
console.log('Keys:', Object.keys(qr));
console.log('Is constructor:', typeof qr === 'function' || typeof qr.default === 'function');

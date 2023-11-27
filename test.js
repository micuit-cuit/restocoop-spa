const { createHmac } = require('node:crypto');

const secret = 'abcdef';
const hash = createHmac('sha256', secret)
               .digest('hex');
console.log(hash);
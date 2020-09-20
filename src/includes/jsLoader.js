const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

module.exports.getMinifiedJs = async () => {
  const rawJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const { code } = await minify(rawJs);
  return code;
};

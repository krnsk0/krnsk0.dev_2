const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

module.exports.getMinifiedCss = () => {
  const resetCSS = fs.readFileSync(path.join(__dirname, 'reset.css'), 'utf8');
  const mainCSS = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');

  const { styles } = new CleanCSS({}).minify(resetCSS + mainCSS);
  console.log('styles: ', styles);

  return styles;
};

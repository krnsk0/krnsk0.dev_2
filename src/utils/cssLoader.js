const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

module.exports.getMinifiedCss = (cssFilenames) => {
  const rawCss = cssFilenames
    .map((filename) =>
      fs.readFileSync(
        path.join(__dirname, '..', 'css', `${filename}.css`),
        'utf8'
      )
    )
    .join('');

  const { styles } = new CleanCSS({}).minify(rawCss);

  return styles;
};

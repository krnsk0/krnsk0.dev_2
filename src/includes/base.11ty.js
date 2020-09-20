const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

delete require.cache[require.resolve('./navbar')];
const navbar = require('./navbar');

const getMinifiedJs = async () => {
  const rawJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const { code } = await minify(rawJs);
  return code;
};

module.exports.data = {};

module.exports.render = async ({ title, content, page: { url } }) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@200&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/reset.css" type="text/css">
    <link rel="stylesheet" href="/css/styles.css" type="text/css">
    <title>${title}</title>
  </head>
  <body>
    ${navbar(url)}
    ${content}
    <script>
      ${await getMinifiedJs()}
    </script>
  </body>
</html>
  `;
};

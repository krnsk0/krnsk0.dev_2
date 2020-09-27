delete require.cache[require.resolve('./navbar')];
const navbar = require('./navbar');

delete require.cache[require.resolve('../utils/jsLoader')];
const { getMinifiedJs } = require('../utils/jsLoader');

delete require.cache[require.resolve('../utils/cssLoader')];
const { getMinifiedCss } = require('../utils/cssLoader');

module.exports.data = {};

module.exports.render = async ({ title, content, page: { url } }) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preload" href="/fonts/roboto-mono-v12-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/rubik-v10-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
    <style>
      ${getMinifiedCss(['reset', 'code', 'global', 'nav'])}
    </style>
    <title>${title}</title>
  </head>
  <body>
    ${navbar(url)}
    <div class="content--outer">
      <div class="content--inner">
        ${content}
      </div>
    </div>
    <script>
      ${await getMinifiedJs()}
    </script>
  </body>
</html>
  `;
};

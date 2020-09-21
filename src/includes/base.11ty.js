delete require.cache[require.resolve('./navbar')];
const navbar = require('./navbar');

delete require.cache[require.resolve('./jsLoader')];
const { getMinifiedJs } = require('./jsLoader');

delete require.cache[require.resolve('./cssLoader')];
const { getMinifiedCss } = require('./cssLoader');

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
      ${getMinifiedCss(['global', 'fonts', 'nav'])}
    </style>
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

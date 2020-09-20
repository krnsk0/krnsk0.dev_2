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
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
    <style>
      ${getMinifiedCss(['reset', 'fonts', 'styles'])}
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

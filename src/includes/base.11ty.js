delete require.cache[require.resolve('./navbar')];
const navbar = require('./navbar');

module.exports.data = {};

module.exports.render = ({ title, content, page: { url } }) => {
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
      let darkMode = false;
      const light = {
        '--background-color': 'rgb(249, 249, 249)',
        '--text-color': 'rgb(49, 49, 49)',
      }
      const dark = {
        '--background-color': 'rgb(29, 29, 29)',
        '--text-color': 'rgb(249, 249, 249)',
      }
      const toggleMode = () => {
        Object.entries(darkMode ? light : dark).forEach(([key, val]) => {
          document.body.style.setProperty(key, val);
        });
        darkMode = !darkMode;
      }
    </script>
  </body>
</html>
  `;
};

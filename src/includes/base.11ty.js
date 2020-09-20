module.exports.data = {};

const navbar = (url) => {
  // key is path, val is text
  const links = {
    '/about': 'About',
    '/projects': 'Projects',
    '/writing': 'Writing',
    '/contact': 'Contact',
  };

  return `
<nav class="nav--outer">
  <div class="nav--title">KRNSK0</div>
  <div class="nav--inner">
  ${Object.entries(links)
    .map(([path, text]) => {
      const classString = url.startsWith(path) ? 'nav--link-active' : '';
      return `<a href="${path}" class="nav--link ${classString}">${text}</a>`;
    })
    .join('')}
  </div>
</nav>
  `;
};

module.exports.render = ({ title, content, entry, page: { url } }) => {
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
  </body>
</html>
  `;
};

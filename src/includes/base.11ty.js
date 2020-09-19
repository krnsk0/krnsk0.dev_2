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
<nav>
  ${Object.entries(links)
    .map(([path, text]) => {
      const classString = url.startsWith(path) ? 'nav--link-active' : '';
      return `<a href="${path}" class="nav--link ${classString}">${text}</a>`;
    })
    .join('')}
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

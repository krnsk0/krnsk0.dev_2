delete require.cache[require.resolve('./icons')];
const { github, linkedin, medium, dev, darkmode } = require('./icons');

module.exports = (url) => {
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
  <div class="nav--icons_outer">
    <div class="nav--icons_inner">
      <div class="nav--icon">${github()}</div>
      <div class="nav--icon">${linkedin()}</div>
      <div class="nav--icon">${medium()}</div>
      <div class="nav--icon">${dev()}</div>
    </div>
    <div class="nav--icon" onclick="toggleMode()">${darkmode()}</div>
  </div>
  <div class="nav--links">
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

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

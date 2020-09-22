delete require.cache[require.resolve('./icons')];
const {
  github,
  linkedin,
  medium,
  dev,
  darkmode,
  lightmode,
} = require('./icons');

module.exports = (url) => {
  // key is path, val is text
  const links = {
    '/about': 'About',
    '/projects': 'Projects',
    '/writing': 'Writing',
    '/contact': 'Contact',
  };

  return `
<div class="nav--outer">
  <a href="/"><div class="nav--title">KRNSK0</div></a>
  <div class="nav--icons_outer">
    <div class="nav--icons_inner">
      <div class="nav--icon"><a href="https://github.com/krnsk0" aria-label="Github" target="_blank" rel="noopener noreferrer">${github()}</a></div>
      <div class="nav--icon"><a href="https://www.linkedin.com/in/krnsk0/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">${linkedin()}</a></div>
      <div class="nav--icon"><a href="https://medium.com/@krnsk0" aria-label="Medium" target="_blank" rel="noopener noreferrer">${medium()}</a></div>
      <div class="nav--icon"><a href="https://dev.to/krnsk0/" aria-label="Dev.to" target="_blank" rel="noopener noreferrer">${dev()}</a></div>
    </div>
    <div>
      <div class="nav--icon" tabIndex="0" onclick="toggleMode(event)" onkeypress="toggleMode(event)" id="darkmode-toggle">${darkmode()}</div>
      <div class="nav--icon" tabIndex="0" onclick="toggleMode(event)" onkeypress="toggleMode(event)" id="lightmode-toggle">${lightmode()}</div>
    </div>
  </div>
  <nav class="nav--links">
  ${Object.entries(links)
    .map(([path, text]) => {
      const classString = url.startsWith(path) ? 'nav--link-active' : '';
      return `
      <a href="${path}" class="nav--link ${classString}">${text}</a>
      `;
    })
    .join('')}
  </nav>
  <div class="horiz_rule"></div>
</div>
  `;
};

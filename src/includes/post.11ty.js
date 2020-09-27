delete require.cache[require.resolve('../utils/cssLoader')];
const { getMinifiedCss } = require('../utils/cssLoader');

module.exports.data = {
  layout: 'base',
};

module.exports.render = ({ content, title }) => {
  return `
    <style>
      ${getMinifiedCss(['post'])}
    </style>

    <div class="post--container">
      <h1 class="post--title">
      ${title}
      </h1>
      ${content}
    </div>
  `;
};

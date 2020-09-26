delete require.cache[require.resolve('./cssLoader')];
const { getMinifiedCss } = require('./cssLoader');

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

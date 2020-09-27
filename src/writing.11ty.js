delete require.cache[require.resolve('./utils/cssLoader')];
const { getMinifiedCss } = require('./utils/cssLoader');

module.exports.data = {
  layout: 'base',
  title: 'knsk0 - writing',
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const getReadTime = (wordCount) => {
  const wpm = 170;
  return (wordCount / wpm).toFixed(0);
};

module.exports.render = (data) => {
  const { collections } = data;

  return `
    <style>
      ${getMinifiedCss(['writing'])}
    </style>
    <div class="writing--all-posts">
    ${collections.writing
      .map((post) => {
        const readTimeInMinutes = getReadTime(post.word_count);

        return `
        <div class="writing--post-info">
          <div class="writing--info-line">
            <span>${formatDate(post.data.date)}</span>
            <span>${post.word_count} words</span>
            <span>${readTimeInMinutes} minutes</span>
          </div>
          <div>
            <span class="writing--post-title">${post.data.title}</span>
          </div>
          <div class="writing--post-description">
            ${post.data.description}
          <div>
        </div>
      `;
      })
      .join('\n')}
    </div>
  `;
};

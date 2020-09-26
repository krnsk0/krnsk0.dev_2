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
    <div>
    ${collections.writing
      .map((post) => {
        const readTimeInMinutes = getReadTime(post.word_count);

        return `
        <div>
          ${formatDate(post.data.date)}
        </div>
        <div>
          <span>${post.data.title}</span>
          <span>${post.word_count} words</span>
          <span>${readTimeInMinutes} minutes</span>
        </div>
        <div>
          ${post.data.description}
        <div>
      `;
      })
      .join('\n')}
    </div>
  `;
};

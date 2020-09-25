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

module.exports.render = (data) => {
  const { collections } = data;

  return `
    <div>
    ${collections.writing
      .map(
        (post) => `
      <div>
      ${formatDate(post.data.date)}

      </div>
      <div>
      ${post.data.title}
      </div>
      <div>
      ${post.data.description}
      <div>
      `
      )
      .join('\n')}
    </div>
  `;
};

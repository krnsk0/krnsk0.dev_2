module.exports.data = {
  layout: 'base',
  title: 'knsk0 - writing',
};

module.exports.render = (data) => {
  const { collections } = data;

  return `
    <ul>
    ${collections.post.map((post) => `<li>${post.data.title}</li>`).join('\n')}
    </ul>
  `;
};

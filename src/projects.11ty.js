module.exports.data = {
  layout: 'base',
  title: 'krnsk0 - projects',
};

module.exports.render = (data) => {
  const { collections } = data;
  return `

  ${collections.project
    .map((project) => `<div>${project.data.title}</div>`)
    .join('')}

  `;
};

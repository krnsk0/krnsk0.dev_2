const htmlmin = require('html-minifier');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = (eleventyConfig) => {
  // Syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);

  // Layout aliases
  eleventyConfig.addLayoutAlias('base', 'base.11ty.js');
  eleventyConfig.addLayoutAlias('post', 'post.11ty.js');

  // Static assets
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/fonts');

  // HTML minification
  eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Browsersync options
  eleventyConfig.setBrowserSyncConfig({
    browser: 'google chrome',
    open: 'local',
    notify: false,
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      data: 'data',
    },
  };
};

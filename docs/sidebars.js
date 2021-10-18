/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  globalSidebar: [
    'features',
    'quick_start',
    'configuration',
    {
      type: 'category',
      label: 'API',
      collapsed: false,
      items: [
        'api/export',
        'api/performance',
        'api/status',
      ],
    },
  ],
};

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Dreamcatcher',
  tagline: '',
  url: 'https://persado.github.io',
  baseUrl: '/dreamcatcher/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'persado', // Usually your GitHub org/user name.
  projectName: 'dreamcatcher', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Dreamcatcher',
      logo: {
        alt: 'Dreamcatcher',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'features',
          position: 'left',
          label: 'Features',
        },
        {
          type: 'doc',
          docId: 'quick_start',
          position: 'left',
          label: 'Quick Start',
        },
        {
          type: 'doc',
          docId: 'api/export',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://github.com/persado/dreamcatcher',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Persado, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/persado/dreamcatcher/edit/master/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

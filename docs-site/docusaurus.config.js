// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'LangExtract docs',
  tagline:
    'LLM-powered structured extraction from text, grounded to the source.',
  favicon: 'img/logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL. Targets a GitHub Pages project site
  // (https://wordcaster.github.io/langextract/) as the planned deploy default.
  // Nothing is deployed yet; this only sets how links and the build resolve.
  url: 'https://wordcaster.github.io',
  baseUrl: '/langextract/',

  // GitHub Pages deployment config (used only when a deploy is run).
  organizationName: 'wordcaster',
  projectName: 'langextract',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Points "Edit this page" at the docs source on the fork's docs branch.
          editUrl:
            'https://github.com/wordcaster/langextract/tree/docs-site/docs-site/',
        },
        // This is a documentation site, not a blog. The demo blog was removed.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'LangExtract',
        logo: {
          alt: 'LangExtract docs',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/docs/reference/api',
            label: 'API reference',
            position: 'left',
          },
          {
            href: 'https://github.com/google/langextract',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/docs/intro'},
              {label: 'Quickstart', to: '/docs/quickstart'},
              {label: 'How-to guides', to: '/docs/how-to/long-document-workflow'},
              {label: 'API reference', to: '/docs/reference/api'},
            ],
          },
          {
            title: 'Concepts',
            items: [
              {
                label: 'How extraction works',
                to: '/docs/concepts/how-extraction-works',
              },
              {
                label: 'Grounding',
                to: '/docs/concepts/grounding',
              },
              {
                label: 'Model backends',
                to: '/docs/concepts/model-backends',
              },
            ],
          },
          {
            title: 'Project',
            items: [
              {
                label: 'LangExtract on GitHub',
                href: 'https://github.com/google/langextract',
              },
              {
                label: 'langextract on PyPI',
                href: 'https://pypi.org/project/langextract/',
              },
              {
                label: 'Docs source',
                href: 'https://github.com/wordcaster/langextract/tree/docs-site/docs-site',
              },
            ],
          },
        ],
        copyright: `LangExtract is open source under the Apache 2.0 license and is <strong>not an officially supported Google product</strong>. This site is an independent documentation effort and is not official Google documentation.<br/>Built with Docusaurus. © ${new Date().getFullYear()} John Edgar Rojas.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['python', 'bash'],
      },
    }),
};

export default config;

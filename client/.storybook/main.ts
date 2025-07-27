import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  viteFinal: async (config) => {
    config.optimizeDeps ??= {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      'call-bind-apply-helpers',
      'side-channel-weakmap',
    ];

    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'call-bind-apply-helpers': 'call-bind-apply-helpers',
      'side-channel-weakmap': 'side-channel-weakmap',
    };

    return config;
  },
};
export default config;

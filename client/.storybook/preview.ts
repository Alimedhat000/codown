import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        // 👇 Default options
        dark: { name: 'Dark', value: '#18181b' },
        light: { name: 'Light', value: '#F7F9F2' },
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail C I on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  initialGlobals: {
    // 👇 Set the initial background color
    backgrounds: { value: 'light' },
  },
};

export default preview;

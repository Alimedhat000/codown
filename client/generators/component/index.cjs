const fs = require('fs');
const path = require('path');

module.exports = function (plop) {
  // read all folder names inside src/features
  const featuresDir = path.join(__dirname, '../../src/features');
  let features = [];

  const componentDir = path.join(__dirname, '../../src/components');
  let components = [];

  // Check if features directory exists before reading it
  if (fs.existsSync(featuresDir)) {
    features = fs.readdirSync(featuresDir).filter((item) => {
      const itemPath = path.join(featuresDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  }
  if (fs.existsSync(componentDir)) {
    components = fs.readdirSync(componentDir).filter((item) => {
      const itemPath = path.join(componentDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  }

  return {
    description: 'Generate a new component with stories',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase)',
        validate: (input) => {
          if (!input) return 'Component name is required';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return 'Component name must be in PascalCase (e.g., MyComponent)';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'feature',
        message: 'Which feature does this component belong to?',
        choices: ['Components', ...features],
        when: () => features.length > 0,
      },
      {
        type: 'list',
        name: 'folder',
        message: 'Folder in components (leave empty for root)',
        when: ({ feature }) => !feature || feature === 'Components',
        choices: ['Root', ...components],
      },
    ],
    actions: (answers) => {
      let compGeneratePath;

      if (!answers.feature || answers.feature === 'Components') {
        compGeneratePath =
          answers.folder != 'Root'
            ? 'src/components/{{folder}}'
            : 'src/components';
      } else {
        compGeneratePath = 'src/features/{{feature}}/components';
      }

      const titlePath =
        !answers.feature || answers.feature === 'Components'
          ? 'Components'
          : plop.getHelper('pascalCase')(answers.feature);

      return [
        {
          type: 'add',
          path: compGeneratePath + '/{{pascalCase name}}/index.ts',
          templateFile: 'generators/component/index.ts.hbs',
        },
        {
          type: 'add',
          path:
            compGeneratePath +
            '/{{pascalCase name}}/{{kebabCase name}}.stories.tsx',
          templateFile: 'generators/component/component.stories.tsx.hbs',
          data: {
            titlePath,
          },
        },
        {
          type: 'add',
          path:
            compGeneratePath + '/{{pascalCase name}}/{{kebabCase name}}.tsx',
          templateFile: 'generators/component/component.tsx.hbs',
        },
      ];
    },
  };
};

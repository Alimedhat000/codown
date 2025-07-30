const fs = require('fs');
const path = require('path');

module.exports = function (plop) {
  // console.log('Plop function called');

  // read all folder names inside src/features
  const featuresDir = path.join(__dirname, '../../src/features');
  let features = [];

  // console.log('Looking for features directory at:', featuresDir);

  // Check if features directory exists before reading it
  if (fs.existsSync(featuresDir)) {
    // console.log('Features directory exists');
    features = fs.readdirSync(featuresDir).filter((item) => {
      const itemPath = path.join(featuresDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
    // console.log('Found features:', features);
  } else {
    // console.log('Features directory does not exist');
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
        choices: ['components', ...features],
        when: () => features.length > 0,
      },
      {
        type: 'input',
        name: 'folder',
        message: 'Folder in components (leave empty for root)',
        when: ({ feature }) => !feature || feature === 'components',
        default: '',
      },
    ],
    actions: (answers) => {
      // console.log('Actions called with answers:', answers);

      let compGeneratePath;

      if (!answers.feature || answers.feature === 'components') {
        compGeneratePath = answers.folder
          ? 'src/components/{{folder}}'
          : 'src/components';
      } else {
        compGeneratePath = 'src/features/{{feature}}/components';
      }

      const titlePath =
        !answers.feature || answers.feature === 'components'
          ? 'Components'
          : plop.getHelper('pascalCase')(answers.feature);

      // ✅ DEBUG log
      // console.log('Resolved titlePath:', titlePath);
      // console.log('Component generation path:', compGeneratePath);

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

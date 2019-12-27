module.exports =  {
    parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends:  [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parserOptions:  {
        project: "./tsconfig.json",
        ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
        sourceType:  'module',  // Allows for the use of imports
        ecmaFeatures:  {
            jsx:  true,  // Allows for the parsing of JSX
        },
    },
    rules:  {
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
    },
    settings:  {
        react:  {
          version:  'detect',  // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    }
};
import stylistic from "@stylistic/eslint-plugin"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"

export default tseslint.config (
  importPlugin.flatConfigs.recommended,
  {
    ignores: [
      "node_modules/**/*",
      "dist/**/*",
      "eslint.config.js",
    ]
  },
  {
    plugins: {
      "@stylistic": stylistic
    },
    files: [
      "**/*.ts"
    ],
    extends: [
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2024,
      parserOptions: {
        projectService: true,
        createDefaultProgram: true
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "always", // Require ".js" for JavaScript files
          ts: "never",  // Don't require ".ts" extension for TypeScript (optional)
          jsx: "always", // Require ".jsx" for JSX files (optional)
          tsx: "never"  // Don't require ".tsx" for TypeScript with JSX (optional)
        }
      ],
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          "patterns": [
            "src/*"
          ],
        }
      ],
      "import/no-unresolved": [
        "error",
        {
          "ignore": [
            ".ts$",
            ".js$"
          ], // Ignore unresolved imports that end with .ts or .js
        }
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: [
            "classProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
            "enumMember"
          ],
          format: [
            "camelCase",
            "PascalCase"
          ]
        },
        {
          selector: "objectLiteralMethod",
          modifiers: [
            "requiresQuotes"
          ],
          format: null
        },
        {
          selector: "typeProperty",
          format: [
            "camelCase",
            "PascalCase",
            "snake_case"
          ]
        },
      ],
      // "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/member-ordering": "error",
      "@stylistic/member-delimiter-style": [
        "error",
        {
          multiline: {
            delimiter: "none",
            requireLast: true
          },
          singleline: {
            delimiter: "semi",
            requireLast: false
          }
        }
      ],
      "@stylistic/semi": [
        "error",
        "never"
      ],
      "@stylistic/block-spacing": "error",
      "@stylistic/space-before-blocks": [
        "error",
        "always"
      ],
      "@stylistic/space-in-parens": [
        "error",
        "always"
      ],
      "@stylistic/space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "always",
          asyncArrow: "always"
        }
      ],
      "@stylistic/keyword-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],
      "@stylistic/function-call-spacing": [
        "error",
        "always"
      ],
      "@stylistic/array-bracket-spacing": [
        "error",
        "always"
      ],
      "@stylistic/object-curly-spacing": [
        "error",
        "always"
      ],
      "@stylistic/quotes": [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: "always",
        }
      ],
      "@stylistic/indent": [
        "error",
        2,
        {
          SwitchCase: 1,
          FunctionDeclaration: {
            body: 1,
            parameters: "first"
          },
          FunctionExpression: {
            body: 1,
            parameters: "first"
          }
        }
      ],
      "@stylistic/arrow-parens": [
        "error",
        "as-needed"
      ],
      "@stylistic/max-len": [
        "error",
        {
          ignorePattern: "^import [^,]+ from |^export | implements",
          code: 150,
          tabWidth: 2,
          comments: 200,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true
        }
      ],
      "prefer-arrow-callback": [
        "warn",
        {
          allowNamedFunctions: false
        }
      ],
      "func-style": [ "error", "expression" ],
      "no-unused-vars": "off", // Turn standard rule off, use TypeScript version
      "no-unused-labels": "error"
    }
  }
)
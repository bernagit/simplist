import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import drizzlePlugin from 'eslint-plugin-drizzle'
import globals from 'globals'

const config = defineConfig([
  // GLOBAL IGNORES
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
  },

  // JS
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  // TS
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: false
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
      drizzle: drizzlePlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      ...prettierConfig.rules,
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1], // common safe defaults
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false
        }
      ]
    }
  }
])

export default config

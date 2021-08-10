import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';
import analyze from 'rollup-plugin-analyzer';
import dev from 'rollup-plugin-dev';
import livereload from 'rollup-plugin-livereload';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import postcss from 'rollup-plugin-postcss'
import copy from 'rollup-plugin-copy'
import commonJS from 'rollup-plugin-commonjs'
import html from "@rollup/plugin-html";

const isProduction = process.env.NODE_ENV === 'production';
const name = 'reactAuth0';
const input = 'src/index.tsx';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};
const plugins = [
  del({ targets: 'dist/*', runOnce: true }),
  typescript({ useTsconfigDeclarationDir: true }),
  external(),
  resolve(),
  replace({ __VERSION__: `'${pkg.version}'` }),
  analyze({ summaryOnly: true }),
];

function dotEnv(options) {
  const result = dotenv.parse(
    fs.readFileSync(path.join(process.cwd(), options.envFilePath))
  );

  return {
    ...replace(
      Object.keys(result).reduce(
        (acc, curr) => ({
          ...acc,
          [`process.env.${curr}`]: `'${result[curr]}'`,
        }),
        {}
      )
    ),
    name: 'dotenv',
  };
}

export default [
  {
    input,
    output: [
      {
        name,
        file: 'dist/auth0-react.js',
        format: 'umd',
        globals,
        sourcemap: true,
      },
    ],
    plugins: [
      ...plugins,
    ],
  },
  ...(isProduction
    ? [
        {
          input,
          output: [
            {
              name,
              file: 'dist/auth0-react.min.js',
              format: 'umd',
              globals,
              sourcemap: true,
            },
          ],
          plugins: [...plugins, terser()],
        },
        {
          input,
          output: {
            name,
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
          },
          plugins,
        },
        {
          input,
          output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
          },
          plugins,
        },
      ]
    : []),

  ...(isProduction
    ? []
    : [
      {
        input: 'playground/src/index.tsx',
        // preserveSymlinks: true,
        treeshake: false,
        output: {
          file: 'playground/build/bundle.js',
          format: 'iife',
          sourcemap: true,
        },
        plugins: [
          del({ targets: 'playground/build/*', runOnce: true }),
          dotEnv({
            envFilePath: 'playground/.env',
          }),
          resolve(),
          commonJS({
            include: /node_modules/,
            namedExports: {
              'node_modules/react/index.js': ['Children', 'Component', 'PropTypes', 'createElement', 'useState', 'useEffect', 'createContext', 'useReducer', 'useCallback', 'useContext'],
              'node_modules/react-dom/index.js': ['render'],
              'node_modules/prop-types/index.js': ['default'],
              'playground/node_modules/react-is/index.js': ['isValidElementType'],
            }
          }),
          postcss(),
          typescript({tsconfig: './playground/tsconfig.json'}),
          html({alsoInclude: 'auth0-react.js'}),
          dev({
            dirs: ['dist', 'playground/build'],
            open: true,
            port: 3000,
          }),/*
          livereload(),*/
        ],
      },
      ]),
];

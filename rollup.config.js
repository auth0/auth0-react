import del from 'rollup-plugin-delete';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const isProduction = process.env.NODE_ENV === 'production';
const name = 'reactAuth0';
const input = 'src/index.tsx';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@auth0/auth0-spa-js': 'createAuth0Client'
};
const plugins = [
  del({ targets: 'dist/*', runOnce: true }),
  typescript({ useTsconfigDeclarationDir: true }),
  external(),
];

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
      ...(isProduction ? [] : [
        serve({
          contentBase: ['dist', 'static'],
          open: true,
          port: 3000,
        }),
        livereload()
      ]),
    ],
  },
  ...(isProduction ? [
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
      plugins: [ ...plugins, terser() ],
    },
    {
      input,
      output: {
        name,
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      plugins
    },
    {
      input,
      output: {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
      plugins
    }
  ] : [])
];

import del from 'rollup-plugin-delete';
import livereload from 'rollup-plugin-livereload';
import dev from 'rollup-plugin-dev';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };
import analyze from 'rollup-plugin-analyzer';
import { createApp } from './scripts/oidc-provider.mjs';

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
  replace({ __VERSION__: `'${pkg.version}'`, preventAssignment: true }),
  analyze({ summaryOnly: true }),
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
      ...(isProduction
        ? []
        : [
            dev({
              dirs: ['dist', 'static'],
              port: 3000,
              extend(app, modules) {
                app.use(modules.mount(createApp({ port: 3000 })));
              },
            }),
            livereload(),
          ]),
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
];

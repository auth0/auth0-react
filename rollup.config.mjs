import del from 'rollup-plugin-delete';
import livereload from 'rollup-plugin-livereload';
import dev from 'rollup-plugin-dev';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' with { type: 'json' };
import analyze from 'rollup-plugin-analyzer';
import { createApp } from './scripts/oidc-provider.mjs';

const isProduction = process.env.NODE_ENV === 'production';
const name = 'reactAuth0';
const input = 'src/index.tsx';
// Mark the bundle as a client module so it can be imported into a React Server
// Component graph (Next.js App Router). Rollup drops the 'use client' directives
// from the source modules when bundling, so we re-add it at the bundle top via
// output.banner. Applied only to the RSC-consumed CJS + ESM outputs (not UMD).
const useClientBanner = "'use client';";
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};
const plugins = [
  del({ targets: 'dist/*', runOnce: true }),
  typescript({
    useTsconfigDeclarationDir: true,
    include: ['src/**/*.ts', 'src/**/*.tsx'],
  }),
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
            banner: useClientBanner,
          },
          plugins,
        },
        {
          input,
          output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
            banner: useClientBanner,
          },
          plugins,
        },
      ]
    : []),
];

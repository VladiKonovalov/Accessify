import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/accessify.js',
      format: 'umd',
      name: 'Accessify',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  // UMD minified build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/accessify.min.js',
      format: 'umd',
      name: 'Accessify',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  // ES module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/accessify.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/accessify.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
];

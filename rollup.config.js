import pkg from './package.json';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/megapi.js',
    output: [
        { file: pkg.main, format: 'cjs' },
        { file: pkg.module, format: 'es' }
    ],
    plugins: [babel()]
};

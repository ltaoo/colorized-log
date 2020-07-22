const babel = require('@babel/core');

const plugin = require('./src/plugin');

const content = `
console.log('getInitialState');
console.log('patchRoutes');
console.log(color.primary('pathRoute'), routes);
`;
const { code } = babel.transform(content, {
  plugins: [plugin],
});

console.log(code);

const babel = require("@babel/core");
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const customConsole = require('./core');

const { logger } = customConsole;

// const content = `customConsole.log(logger.primary('hello'));`;
const content = `customConsole.log(logger.primary('hello'), value, {}, null, undefined, 'test content', 182, true, logger.danger('SUFFIX'));`;

function plugin() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        const { callee, arguments } = node;
        if (callee.type === "MemberExpression") {
          // 调用 custom console
          if (callee.object.name === 'customConsole' && callee.property.name === "log") {
            callee.object.name = "console";

            const fn = types.expressionStatement(
                types.callExpression(
                    types.memberExpression(
                        types.identifier('logger'),
                        types.identifier('log'),
                    ),
                    arguments,
                )
            );
            const { code: paramsCode } = generate(fn);
            const logParams = [];
            // const result = eval(paramsCode);
            // const logParams = result.map((text) => {
            //     const type = typeof text;
            //     console.log('h', text, type);
            //     if (text === null) {
            //         return types.nullLiteral();
            //     }
            //     if (type === 'string') {
            //         return types.stringLiteral(text);
            //     }
            //     if (type === 'number') {
            //         return types.numericLiteral(text);
            //     }
            //     if (type === 'boolean') {
            //         return types.booleanLiteral(text);
            //     }
            //     if (type === 'object') {
            //         return types.identifier(text);
            //     }
            // });
            node.arguments = logParams;
          }
        }
      },
    },
  };
}

const { code } = babel.transform(content, {
  plugins: [plugin],
});

console.log(code);

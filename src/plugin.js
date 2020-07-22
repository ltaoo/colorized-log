/* eslint-disable import/no-extraneous-dependencies */
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const { color } = require("./index");
const { buildFromAst, join } = require("./util");

const SUPPORTED_METHODS = Object.keys(color);

/**
 * 检查参数中是否有设置样式
 * @param  {Array<Node>} params - 函数调用的参数
 * @return {boolean}
 */
function checkHasColorizedText(...params) {
  return params.some((param) => {
    if (
      param.type === "CallExpression" &&
      param.callee.type === "MemberExpression" &&
      param.callee.object.name === "color"
    ) {
      return true;
    }
    return false;
  });
}

function plugin() {
  return {
    name: "custom-console",
    visitor: {
      CallExpression(path, state) {
        const { filename } = state.file.opts;
        const { node } = path;
        // eslint-disable-next-line no-shadow-restricted-names
        const { callee, arguments } = node;

        const func = path.findParent(
          (path) => path.node.type === "FunctionDeclaration"
        );
        let funcNode = null;
        if (func !== null) {
          funcNode = func.node;
        }

        if (callee.type !== "MemberExpression") {
          return;
        }
        if (callee.object.name !== "console") {
          return;
        }
        const hasColorizedText = checkHasColorizedText(...arguments);
        const firstArgument = arguments[0];
        const firstArgumentIsString =
          firstArgument && firstArgument.type === "StringLiteral";

        if (
          !hasColorizedText &&
          !SUPPORTED_METHODS.includes(callee.property.name)
        ) {
          callee.property.name = "log";
          return;
        }
        if (SUPPORTED_METHODS.includes(callee.property.name)) {
          if (firstArgumentIsString) {
            const ast = types.callExpression(
              types.memberExpression(
                types.identifier("color"),
                types.identifier(callee.property.name)
              ),
              [types.stringLiteral(firstArgument.value)]
            );
            arguments[0] = ast;
          }
        }

        const results = arguments
          .map((argument, index) => {
            if (
              argument.type === "CallExpression" &&
              argument.callee.type === "MemberExpression" &&
              argument.callee.object.name === "color"
            ) {
              const { code } = generate(argument);
              // eslint-disable-next-line no-eval
              const colorized = eval(code);
              const [text, ...restCssText] = colorized.valueOf();
              return [
                text,
                ...restCssText.map((cssText) => {
                  return types.stringLiteral(cssText);
                }),
              ];
            }
            if (argument.type === "Identifier") {
              if (argument.name === "__func") {
                if (funcNode === null) {
                  return null;
                }
                argument = types.stringLiteral(funcNode.id.name);
              }
              if (argument.name === "__file") {
                argument = types.stringLiteral(filename);
              }
            }
            return buildFromAst(argument, index);
          })
          .filter(Boolean);

        const arr = join(results);
        node.callee = types.memberExpression(
          types.identifier("console"),
          types.identifier("log")
        );
        node.arguments = arr.map((item) => {
          if (typeof item === "string") {
            return types.stringLiteral(item);
          }
          return item;
        });
      },
    },
  };
}

module.exports = plugin;

const babel = require("@babel/core");
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const customConsole = require("./core");

const { logger, ColorizedText } = customConsole;

// const content = `customConsole.log(logger.primary('hello'));`;
const content = `customConsole.log({}, null, undefined, 'test content', 182, true);`;

function buildFromValue(value) {
  const type = typeof value;
  if (["boolean", "object", "function", "undefined"].includes(type)) {
    text += `%o `;
    styles.push(param);
  }
  if (type === "string") {
    text += `"%c${param}%c" `;
    styles.push("color: #c6191d;");
    styles.push("");
  }
  if (type === "number") {
    text += `%c${param}%c `;
    styles.push("color: #0a00c7;");
    styles.push("");
  }
}

function buildFromAst(node) {
  const { type, value } = node;
  console.log("buildFromAst", type, value, generate(node).code);
  if (["NullLiteral", "ObjectExpression", "Identifier"].includes(type)) {
    //   const code = generate(node).code;
    //   console.log(typeof code);
    return ["%o ", node];
  }
  if (["BooleanLiteral"].includes(type)) {
    return ["%o ", node];
  }
  if (["StringLiteral"].includes(type)) {
    return [
      `"%c${value}%c" `,
      types.stringLiteral("color: #c6191d;"),
      types.stringLiteral(""),
    ];
  }
  if (["NumericLiteral"].includes(type)) {
    return [
      `%c${value}%c `,
      types.stringLiteral("color: #0a00c7;"),
      types.stringLiteral(""),
    ];
  }
}
function join(data) {
  const result = data
    .map((item) => {
      //   console.log(item);
      const [value, ...rest] = item;
      return [value, rest];
    })
    .reduce(
      (prev, total) => {
        const [value, styles] = prev;
        return [value + total[0], [...styles, ...total[1]]];
      },
      ["", []]
    );
  return [result[0], ...result[1]];
}
// '%chello%c', 'background:red;', ''
// '%o', {}
// '%o', null
// '%o', undefined
// '%c"test content"%c', 'color: red;', ''
// '%c182%c', 'color: blue;', ''
// '%o', true

function plugin() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        const { callee, arguments } = node;
        if (callee.type === "MemberExpression") {
          // 调用 custom console
          if (
            callee.object.name === "customConsole" &&
            callee.property.name === "log"
          ) {
            callee.object.name = "console";

            const results = arguments.map((argument, index) => {
              //   console.log(argument.type);
              if (
                argument.type === "CallExpression" &&
                argument.callee.type === "MemberExpression" &&
                argument.callee.object.name === "logger"
              ) {
                const { code } = generate(argument);
                // console.log(code);
                const colorized = eval(code);
                return colorized;
              }
              return buildFromAst(argument, index);
            });

            // console.log(results);
            const arr = join(results);
            const ast = types.expressionStatement(
              types.callExpression(
                types.memberExpression(
                  types.identifier("console"),
                  types.identifier("log")
                ),
                arr.map((item) => {
                    if (typeof item === 'string') {
                        return types.stringLiteral(item);
                    }
                    return item;
                }),
                // 参数
                // [
                //   types.identifier("a"),
                //   types.identifier("b"),
                //   types.spreadElement(types.identifier("params")),
                // ]
              )
            );
            const { code } = generate(ast);
            console.log(code);
          }
        }
      },
    },
  };
}

const { code } = babel.transform(content, {
  plugins: [plugin],
});

// console.log(code);

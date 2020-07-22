/* eslint-disable import/no-extraneous-dependencies */
const types = require('@babel/types');

module.exports.join = function join(data) {
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
            ['', []],
        );
    return [result[0], ...result[1]];
};

module.exports.buildFromValue = function buildFromValue(value) {
    const type = typeof value;
    if (['boolean', 'object', 'function', 'undefined'].includes(type)) {
        return [`%o `, value];
    }
    if (type === 'string') {
        return [`"%c${value}%c" `, 'color: #c6191d;', ''];
    }
    if (type === 'number') {
        return [`%c${value}%c `, 'color: #0a00c7;', ''];
    }
    return ['%o ', value];
};

module.exports.buildFromAst = function buildFromAst(node) {
    const { type, value } = node;
    //   console.log("buildFromAst", type, value, generate(node).code);
    if (['NullLiteral', 'ObjectExpression', 'Identifier'].includes(type)) {
        return ['%o ', node];
    }
    if (['BooleanLiteral'].includes(type)) {
        return ['%o ', node];
    }
    if (['StringLiteral'].includes(type)) {
        return [`"%c${value}%c" `, types.stringLiteral('color: #c6191d;'), types.stringLiteral('')];
    }
    if (['NumericLiteral'].includes(type)) {
        return [`%c${value}%c `, types.stringLiteral('color: #0a00c7;'), types.stringLiteral('')];
    }
    return [`%o `, node];
};

module.exports.cssTextToStyles = function cssTextToStyles(cssText) {
    const cssFields = cssText
        .split(';')
        .map((field) => field.trim())
        .filter(Boolean);
    return cssFields
        .map((field) => {
            const [attr, value] = field.split(':').map((text) => text.trim());
            const normalizedAttr = attr;
            return {
                [normalizedAttr]: value,
            };
        })
        .reduce((prev, styles) => {
            return { ...styles, ...prev };
        }, {});
};
module.exports.stylesToCssText = function stylesToCssText(styles) {
    const attrs = Object.keys(styles);
    return attrs
        .map((attr) => {
            return `${attr}:${styles[attr]}`;
        })
        .join(';')
        .concat(';');
};
module.exports.getColorByType = function color(type = 'primary') {
    let result = '';
    switch (type) {
        case 'default':
            result = '#515a6e';
            break;
        case 'primary':
            result = '#2d8cf0';
            break;
        case 'success':
            result = '#19be6b';
            break;
        case 'warning':
            result = '#ff9900';
            break;
        case 'error':
            result = '#ed4014';
            break;
        default:
            break;
    }
    return result;
};

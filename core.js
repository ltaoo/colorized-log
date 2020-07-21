/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
const ONLY = false;
function cssTextToStyles(cssText) {
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
        return Object.assign(Object.assign({}, styles), prev);
    }, {});
}
function stylesToCssText(styles) {
    // console.log('stylesToCssText', styles);
    const attrs = Object.keys(styles);
    return attrs
        .map((attr) => {
        return `${attr}:${styles[attr]}`;
    })
        .join(';')
        .concat(';');
}
function color(type = 'primary') {
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
}
class ColorizedText {
    constructor(params, options) {
        this.isColorizedText = true;
        const [content, cssText] = params;
        this.content = `%c${content}`;
        this.cssText = cssText;
        this.styles = cssTextToStyles(cssText);
        if (options) {
            const { type } = options;
            this.type = type;
        }
    }
    updateStyle(styles) {
        this.styles = Object.assign(Object.assign({}, this.styles), styles);
    }
    valueOf() {
        return [
            this.content,
            // cssTextToStyles(this.cssText),
            stylesToCssText(this.styles),
        ];
    }
}
const defaultOptions = {
    background: color('default'),
    borderRadius: '3px',
};
const logger = {
    log(...params) {
        const c = params;
        const colorizedTexts = c.filter((a) => a && a.isColorizedText);
        if (colorizedTexts.length === 0) {
            return params;
        }
        let text = '';
        const styles = [];
        for (let i = 0; i < c.length; i += 1) {
            const param = c[i];
            if (param && param.isColorizedText) {
                const [content, cssText] = param.valueOf();
                text += `${content}%c `;
                styles.push(cssText);
                styles.push('');
            }
            else {
                const type = typeof param;
                if (['boolean', 'object', 'function', 'undefined'].includes(type)) {
                    text += `%o `;
                    styles.push(param);
                }
                if (type === 'string') {
                    text += `"%c${param}%c" `;
                    styles.push('color: #c6191d;');
                    styles.push('');
                }
                if (type === 'number') {
                    text += `%c${param}%c `;
                    styles.push('color: #0a00c7;');
                    styles.push('');
                }
            }
        }
        // console.log(text);
        // console.log(styles);
        // console.log(text, ...styles);
        return [text, ...styles];
    },
    tag(content, styles) {
        const op = Object.assign(Object.assign({}, defaultOptions), (styles || {}));
        const { borderRadius, background } = op;
        return new ColorizedText([
            ` ${content} `,
            `border-radius: ${borderRadius}; background: ${background}; padding: 1px; color: #fff;`,
        ], {
            type: 'tag',
        });
    },
    primary(content) {
        return this.tag(content, {
            background: color('primary'),
        });
    },
    success(content) {
        return this.tag(content, {
            background: color('success'),
        });
    },
    danger(content) {
        return this.tag(content, {
            background: color('error'),
        });
    },
    prefix(content) {
        return this.tag(content);
    },
    red(text) {
        return new ColorizedText([text, 'color: red;']);
    }
};
// emoji https://github.com/jaywcjlove/console-emojis/blob/master/index.js
// eslint-disable-next-line
const customConsole = {
    log(...params) {
        console.log(...params);
    },
    primary(...params) {
        console.log(...logger.log(logger.primary('primary'), ...params));
    },
    danger(...params) {
        console.log(...logger.log(logger.danger('ERROR'), ...params));
    }
};
module.exports = customConsole;
module.exports.logger = logger;

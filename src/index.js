/* eslint-disable max-classes-per-file */

const {
    cssTextToStyles,
    stylesToCssText,
    getColorByType,
    buildFromValue,
    join,
} = require('./util');

class ColorizedText {
    constructor(params, options) {
        this.isColorizedText = true;
        const [content, cssText] = params;
        this.content = `%c${content}%c`;
        this.cssText = cssText;
        this.styles = cssTextToStyles(cssText);
        if (options) {
            const { type } = options;
            this.type = type;
        }
    }

    updateStyle(styles) {
        this.styles = { ...this.styles, ...styles };
    }

    valueOf() {
        return [this.content, stylesToCssText(this.styles), ' '];
    }
}

const defaultOptions = {
    background: getColorByType('default'),
    borderRadius: '3px',
};
const color = {
    tag(content, styles) {
        const op = { ...defaultOptions, ...(styles || {}) };
        const { borderRadius, background } = op;
        return new ColorizedText(
            [
                ` ${content} `,
                `border-radius: ${borderRadius}; background: ${background}; padding: 1px; color: #fff;`,
            ],
            {
                type: 'tag',
            },
        );
    },
    primary(content) {
        return this.tag(content, {
            background: getColorByType('primary'),
        });
    },
    success(content) {
        return this.tag(content, {
            background: getColorByType('success'),
        });
    },
    danger(content) {
        return this.tag(content, {
            background: getColorByType('error'),
        });
    },
    red(text) {
        return this.hex('red')(text);
    },
    blue(text) {
        return this.hex('blue')(text);
    },
    yellow(text) {
        return this.hex('yellow')(text);
    },
    green(text) {
        return this.hex('green')(text);
    },
    hex(colorText) {
        return (text) => {
            return new ColorizedText([`"${text}" `, `color: ${colorText};`]);
        };
    },
    /**
     * 将要打印的内容转换成原始字符串
     * @param  {Array<any>} params
     * @return Array<string>
     */
    parse(...params) {
        const colorizedTexts = params.filter((param) => param && param.isColorizedText);
        if (colorizedTexts.length === 0) {
            return params;
        }
        const results = params.map((param) => {
            if (param && param.isColorizedText) {
                const [content, ...restParams] = param.valueOf();
                return [content, ...restParams];
            }
            return buildFromValue(param);
        });
        return join(results);
    },
};

const customConsole = {
    log(...params) {
        console.log(...color.parse(...params));
    },
    // primary(...params) {
    //     const [firstParam, ...restParams] = params;
    //     if (typeof firstParam === 'string') {
    //         console.log(...this.innerLog(color.primary(firstParam), ...restParams));
    //         return;
    //     }
    //     console.log(...this.innerLog(...params));
    // },
};

module.exports = customConsole;
module.exports.color = color;
module.exports.ColorizedText = ColorizedText;

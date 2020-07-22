# Colorized Log 库

一个支持自定义浏览器控制台文本样式的库。

## Usage

### 直接调用库
```js
const cs, { color } = require('colorized-log');
cs.log(color.primary('PREFIX'), 'hello log');
```

```js
const { color } = require('colorized-log');
console.log(...color.parse(color.primary('PREFIX')), 'hello world');
```

错误用法，在没有配置 `babel` 插件的情况下，如下用法是错误的

```js
const { color } = require('colorized-log');
console.log(color.primary('PREFIX'));
```

### 配置 babel 插件
建议配置 `babel` 插件，该插件会将代码转换成原始字符串，即 `console.log(color.primary('PREFIX'))` 会被编译成

```js
console.log('%c PREFIX %c', 'border-radius: 3px;', '');
```

所以在控制台看到的代码行数不再是 `colorized-log` 库中，而是实际调用 `console.log` 的行数。

```js

```

然后可以在代码中使用

```js
console.log(color.primary('PREFIX'), 'hello world', 1000);
console.primary('PREFIX', 'hello world', 1000);
```

配置 `babel` 插件后就没必要使用 `cs.log` 了，当然如果使用也是可以的，但它们的效果是完全相同的。

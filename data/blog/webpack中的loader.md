---
title: webpack中的loader
date: '2025-10-29'
tags:
  - webpack
draft: false
summary: >-
  loader 是什么？ 是一个文件处理器 为什么需要 loader？ webpack本身只能处理 js 文件，而通过 loader 可以让 webpack
  处理非 js 的文件（比如图片，css等），把它们变成可以识别和打包的模块。 它是如何工作的？ 1. 匹配文件：在配置中定义规则（如 test:
  /\.css$/），指定哪些文件由 loader 处理。 2. ​转换内容​：loader 是函数...
---

loader 是什么？

是一个文件处理器

为什么需要 loader？

webpack本身只能处理 js 文件，而通过 loader 可以让 webpack 处理非 js 的文件（比如图片，css等），把它们变成可以识别和打包的模块。

它是如何工作的？

1. 匹配文件：在配置中定义规则（如 test: /\.css$/），指定哪些文件由 loader 处理。
2. ​转换内容​：loader 是函数，接收文件内容，返回处理结果（如将 CSS 代码转为 JavaScript 模块）。
3. ​链式调用​：多个 loader 可顺序执行（如先编译 SCSS 为 CSS，再嵌入页面）

最佳实践​：

1. ​功能单一​：一个 loader 只做一件事（如less-loader 专处理 Less 语法）。
2. ​使用官方工具​：通过 this.getOptions()获取配置，保持 loader 无状态。
3. ​示例场景​：处理 CSS 时，常用 css-loader（解析 CSS 依赖）和 style-loader（将样式注入页面）

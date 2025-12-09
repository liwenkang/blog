---
title: webpack中的plugin
date: '2025-10-29'
tags:
  - webpack
draft: true
summary: >-
  webpack中的plugin是什么？ plugin的本质是扩展Webpack功能的工具。比如很常见的一个插件
  HtmlWebpackPlugin，它可以生成一个 html，同时把打包好的 js，css 动态塞进去。CleanWebpackPlugin清理旧文件。
  为什么需要 plugin？ 解决更多打包中遇到的问题 它是如何工作的？ plugin必须是一个有apply方法的JavaScript类...
---

webpack中的plugin是什么？
plugin的本质是扩展Webpack功能的工具。比如很常见的一个插件 HtmlWebpackPlugin，它可以生成一个 html，同时把打包好的 js，css 动态塞进去。CleanWebpackPlugin清理旧文件。

为什么需要 plugin？
解决更多打包中遇到的问题

它是如何工作的？
plugin必须是一个有apply方法的JavaScript类或对象，Webpack在运行时会自动调用该方法。
Plugin通过监听Webpack的"钩子"（如编译开始、文件生成前）来介入构建流程
plugin的工作原理（如基于事件钩子机制）、关键对象（Compiler和Compilation）以及常见类型（如优化类、资源管理类插件）。

最佳实践​：
注意 plugin 的执行顺序

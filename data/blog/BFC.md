---
title: BFC（Block-Formatting-Context）-块级格式化上下文
date: '2025-10-20'
tags:
  - CSS
  - BFC
draft: false
summary: >-
  接下来将会更新一系列文章，每篇文章将会聚焦一个概念，从以下四个角度回答问题：是什么？如何创建（使用）？解决了什么问题？最佳实践有哪些？这是系列的第一篇，关于
  BFC。 BFC 是什么？ BFC
  全称是（Block-Formatting-Context）块级格式化上下文，BFC内部的块级盒子会在垂直方向上一个接一个地放置，属于同一个BFC的两个相邻Box的垂直margin会发生重叠。BFC就是页面上...
---

接下来将会更新一系列文章，每篇文章将会聚焦一个概念，从以下四个角度回答问题：是什么？如何创建（使用）？解决了什么问题？最佳实践有哪些？这是系列的第一篇，关于 BFC。

## BFC 是什么？

BFC 全称是（Block-Formatting-Context）块级格式化上下文，BFC内部的块级盒子会在垂直方向上一个接一个地放置，属于同一个BFC的两个相邻Box的垂直margin会发生重叠。BFC就是页面上的一个隔离的独立容器，容器内部的子元素不会影响外层样式，外层样式也无法影响容器内层样式，BFC的区域不会与浮动元素（float box）发生重叠。

## 如何创建 BFC？

1. `<html>` 标签本身就是一个 BFC
2. 设置 overflow：hidden/auto/scroll
3. 设置 display：flex/grid/inline-block/flow-root/inline-flex/inline-grid/table-cell
4. 设置 position：absolute/fixed
5. 设置 float 不是 none，即 left/right

## BFC 解决了什么问题？

1. 全部子元素都设置 float 后，造成的父元素高度塌陷。BFC可以包含浮动元素，使得计算BFC的高度时，浮动元素的高度也参与计算，从而避免了高度塌陷。

```html
<!-- 1. 子元素全部浮动之后，父元素高度塌陷 -->
<html>
  <body>
    <div class="parent">
      <div class="child"></div>
    </div>
  </body>
</html>
<style>
  .parent {
    width: 300px;
    background-color: red;
    display: flow-root; /* 解决高度塌陷问题 */
  }
  .child {
    width: 100px;
    height: 100px;
    background-color: blue;
    float: right;
  }
</style>
```

2. 在同一个 BFC 中，相邻块级元素的 margin 合并问题

```html
<!-- 2. 在一个 BFC 中，上下相邻的块级元素 margin 合并 -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .box {
        background-color: #f0f3f9;
      }

      .box p {
        outline: solid deepskyblue;
        margin: 2em;
      }

      .flow-root {
        display: flow-root;
      }
    </style>
  </head>

  <body>
    <!-- 
        在正常的预期中，子元素的 margin-top 应该在其父元素的“内部”产生间距。
        但当穿透发生时，这个外边距就像穿过了父元素的“屋顶”，直接作用在了父元素的外部，导致父元素整体与其上方元素的距离被改变。
    -->
    <div class="box">
      <p>margin: 2em;</p>
    </div>
    <!--
        上面的 .box容器：因为没有采取任何隔离措施，其内部 <p>标签的 margin-top穿透了容器，直接变成了容器本身的 margin-top。
        这导致容器的背景色（浅灰色）是从内容区域开始绘制的，并没有覆盖到被“穿透”的那部分外边距区域。
    -->
    <!-- 
        下面的 .flow-root容器：因为设置了 display: flow-root，它创建了一个块级格式化上下文（BFC）。
        BFC就像一个独立的布局容器，它内部元素的布局（包括外边距）不会影响到外部。
        所以 <p>标签的 margin被“困”在了这个独立的布局环境内，在容器内部产生了预期的间距，同时容器的背景色也完整地覆盖了这个区域。
    -->
    <div class="box flow-root">
      <p>margin: 2em;</p>
    </div>
  </body>
</html>
```

3. 当左侧 float+固定宽度，右侧自适应宽度布局时，会出现悬浮元素遮盖问题

```html
<!-- 3. 左侧固定宽度+ float，右侧自适应宽度时，浮动元素遮蔽问题 -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        width: 100%;
        height: 100vh;
        background-color: green;
      }

      .left-box {
        width: 200px;
        height: 100%;
        float: left;
        background-color: red;
        margin-right: 20px;
      }

      .right-box {
        background-color: blue;
        padding: 10px;
        /* 这行代码将把 右侧内容 包裹在一个新的 BFC 中，从而避免浮动元素遮蔽问题 */
        display: flow-root;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="left-box">
        <div class="left-box-item">左侧内容</div>
      </div>
      <div class="right-box">
        <div class="right-box-item">右侧内容</div>
      </div>
    </div>
  </body>
</html>
```

4. 文本环绕问题

```html
<!-- 4. 当非BFC容器内的文本遇到浮动元素时，会发生环绕现象。通过BFC可强制文本换行 -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      p {
        display: flow-root;
      }
    </style>
  </head>

  <body>
    <div style="float: left; width: 100px; height: 100px;"></div>
    <p>
      这段文本会环绕浮动元素...这段文本会环绕浮动元素...这段文本会环绕浮动元素...这段文本会环绕浮动元素...
    </p>
  </body>
</html>
```

## BFC 最佳实践有哪些？

1. 优先使用 flex/grid 等现代布局方法，如果仅为了实现 BFC，可以优先考虑 display：flow-root，避免 overflow： hidden 造成的裁切问题
2. 在处理 margin 合并问题时，无需让相邻的元素都构建 BFC，只需要给其中一个加上就行

## 扩展内容

1. BFC (块级格式化上下文)、FFC (弹性格式化上下文)、GFC (网格布局格式化上下文)、IFC (行内格式化上下文)
2. 处理历史布局问题​：对于需要清除浮动、防止外边距合并或处理文字环绕等经典问题，​BFC 依然是直接有效的解决方案。在现代布局中，它更像一个精细的调整工具
3. 安排组件内部布局​：对于组件内部的一维线性布局，比如导航栏、工具条、卡片列表等，​FFC​（Flexbox布局）通常更简单灵活。它在内容动态分布和对齐方面表现出色
4. 构建整体页面结构​：当需要设计复杂的二维布局​（如整个页面的头部、主体、侧边栏和底部区域），并且需要同时精确控制行和列时，应优先选择 GFC​（Grid布局）。它提供了最强大的布局能力
5. 理解行内元素排版​：​IFC 的概念虽然不常直接使用，但理解它有助于更好地控制文本和行内元素的垂直对齐、行高等细节

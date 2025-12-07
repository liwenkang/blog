---
title: 区分 type 和 interface
date: '2025-10-22'
tags: ['TypeScript']
draft: false
---

typescript 就是在 JavaScript 的基础上，增加了类型系统，让代码在编写的时候，就可以发现错误。通过丰富的配置项，使得类型检查的严格程度可以自定义。

type 是类型别名，通过&实现交叉类型，不支持声明合并，不可被类实现

```ts
type ID = string | number // 联合类型
type Point = [number, number] // 元组（类似坐标点）
```

interface 是接口，使用 extends 继承，支持声明合并，可被类实现

```ts
// interface 合并的示例
interface Window {
  width: number
}
interface Window {
  height: number
}
// 合并后 Window 包含 width 和 height
```

解决什么问题？
将弱类型的 JavaScript，转向"强类型"。更强的约束提升了代码的可读性，并减少了低级错误的出现（比如去判断数字和字符串是否相等，而不是先统一类型再判断）

如何使用以及最佳实践？

1. 针对对象类型，默认使用 interface 定义（如API返回的数据结构、React组件的Props），仅在 interface 能力不足的时候，使用 type 定义
2. type 是一个万能类型定义，涉及复杂类型运算（条件类型，联合类型）的使用 type。
3. 当类型定义一旦确定就不能修改的时候，用 type
4. interface的继承在属性类型冲突时会直接报错，而type的&交叉可能产生隐性的never类型。

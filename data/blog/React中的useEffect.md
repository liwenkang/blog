---
title: React中的useEffect
date: '2025-10-24'
tags:
  - react
  - useEffect
draft: false
summary: >-
  1. 在单次渲染的范围内，props和state始终保持不变，可以看成固定值，在任何地方读取都是一样的（Capture Value） 2.
  React只会在浏览器绘制后运行effects。这使得你的应用更流畅因为大多数effects并不会阻塞屏幕的更新。Effect的清除同样被延迟了。上一次的effect会在重新渲染后被清除。
  3. useEffect 里的 return，清理的也是当前渲染的这一...
---

1. 在单次渲染的范围内，props和state始终保持不变，可以看成固定值，在任何地方读取都是一样的（Capture Value）
2. React只会在浏览器绘制后运行effects。这使得你的应用更流畅因为大多数effects并不会阻塞屏幕的更新。Effect的清除同样被延迟了。上一次的effect会在重新渲染后被清除。
3. useEffect 里的 return，清理的也是当前渲染的这一次的，它所在的上下文环境就在当前渲染这一次
4. useEffect使你能够根据props和state\_同步\_React tree之外的东西（也就是"副作用"），比如接口请求，浏览器 tab 标题等。
5. 针对依赖项，请保持诚实，最好在项目的一开始，就做出强制规定（通过 eslint 配置）
6. 在 useEffect 中，对于依赖旧 state 数据做更新 state 操作时，可以把 state 放入依赖，也可以使用 setState 的函数写法（更推荐，因为可以避免反复执行 effect）
7. 如果有多个依赖项？如何简化？

- 使用 useReducer，将多个依赖项，合成一个对象去处理
- dispatch的时候，React只是记住了action
- 它会在下一次渲染中再次调用reducer。在那个时候，新的props就可以被访问到，而且reducer调用也不是在effect里。
- 它可以把更新逻辑和描述发生了什么分开。结果是，这可以帮助我移除不必要的依赖，避免不必要的effect调用

8. 函数要不要放在 useEffect 里？从减少依赖的角度这么做也不错，或者你只把函数中真正依赖的变量，放在 useEffect 的依赖项中，也没问题啦
9. 如果你不想把函数放在 useEffect 里面，有两个方法：

- 这个函数不依赖这个组件里的任何东西（比如一个工具函数？），那就直接把它放在组件外，然后直接在 useEffect 中调用就可以
- 如果这个函数确实也依赖这个组件里的变量，那可以加一层 useCallback，并把这个函数的依赖补充完整，同时将这个函数作为依赖项放入 useEffect 的依赖项数组里面（useMemo 也可以做类似的事情）

10. 可能涉及到的 竞态，比如我有一个输入框，里面可以根据我输入的内容实时搜索一些数据，当我搜索 A 时，假如接口返回很慢，当请求还在后端处理的时候，我把搜索内容改为了 B ，此时接口很快就返回了数据，前端也把它渲染在了页面上，那么等搜索内容 A 返回的时候，前端又一次把新数据渲染了一遍，最终看到的效果就是，我明明在搜索 B，但页面上展示的是 A 的搜索结果。

- 如果你使用的是 fetch 这种，支持请求取消的，那很好，直接取消上一次请求就可以
- 如果是 axios 这种不支持取消的，最简单的解决方法，就是在修改 state 数据之前加个判断，看看后来有没有触发过新的请求，或者自己所在的这一次上下文，是不是已经被销毁了，如果是的话，就把修改 state 数据的逻辑忽略掉。

请对比以下两段代码

```tsx
import { useEffect, useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  setTimeout(() => {
    console.log(`You clicked ${count} times`)
  }, 3000)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}

export default App
```

```tsx
import { useEffect, useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`)
    }, 3000)
  })

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}

export default App
```

如果 useEffect 不指定依赖项时，跟直接放在外面也是有区别的

直接放在外面时，这段代码会在渲染期间同步执行，会阻塞渲染，每次渲染都会执行

放在 useEffect 里面时，会在渲染结束后，立即执行，不会阻塞渲染，在每次渲染完成后都会执行

TODO 扩展内容

1. https://overreacted.io/how-are-function-components-different-from-classes/
2. https://segmentfault.com/a/1190000020964640
3. https://zhuanlan.zhihu.com/p/103150605?utm_source=wechat_session
4. https://zhuanlan.zhihu.com/p/106665408

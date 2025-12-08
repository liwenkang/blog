---
title: Async/Await
date: '2025-10-27'
tags: ['JavaScript', 'Async/Await']
draft: false
---

async/await 是什么？

"async/await 是 JavaScript 处理异步操作（如网络请求、文件读取）的"语法糖"，它让我们能用写同步代码的方式写异步逻辑，避免层层嵌套的回调函数。
底层依赖 Generator 的暂停/恢复机制和 Promise 的状态管理，async 函数总返回 Promise，即使内部返回普通值也会被自动包装为 Promise.resolve(value)

await 仅暂停当前 async 函数内的代码，不阻塞 JavaScript 主线程（其他同步任务照常执行），这是通过微任务队列实现的。

为什么要有这个？
让开发者可以通过看起来同步的方式，执行异步任务

它是怎么实现的？

```javascript
function asyncToGenerator(generatorFunc) {
  return new Promise((resolve, reject) => {
    let g
    try {
      g = generatorFunc()
    } catch (e) {
      reject(e)
    }

    function autoNext(g, nextVal, throwError = false) {
      try {
        let result
        if (throwError) {
          result = g.throw(nextVal)
        } else {
          result = g.next(nextVal)
        }

        const { value, done } = result
        if (done) {
          // 结束了
          resolve(value)
        } else {
          // 还没结束
          ;(value instanceof Promise ? value : Promise.resolve(value))
            .then((res) => {
              autoNext(g, res, false)
            })
            .catch((err) => {
              autoNext(g, err, true)
            })
        }
      } catch (error) {
        reject(error)
      }
    }
    autoNext(g)
  })
}

const getData = () => new Promise((resolve) => setTimeout(() => resolve('data'), 1000))
function* testG() {
  const data = yield getData()
  console.log('data: ', data)
  const data2 = yield getData()
  console.log('data2: ', data2)
  return 'success'
}

asyncToGenerator(testG).then((res) => console.log('success:', res))

const getError = () =>
  new Promise((resolve, reject) => setTimeout(() => reject('error occurred'), 1000))
function* testError() {
  try {
    const data = yield getError()
    console.log('data: ', data)
  } catch (error) {
    console.log('caught error:', error)
  }
  return 'handled'
}

asyncToGenerator(testError).then((res) => console.log('result:', res))
```

最佳实践

1. 一定要加 try catch ，做错误处理和捕获
2. 出错时，提供给用户清晰的错误原因和下一步能做的措施

---
title: Promise
date: '2025-10-27'
tags: ['JavaScript', 'Promise']
draft: false
---

什么是 Promise ?
Promise 是 es6 提出的处理异步任务的"承诺容器"。它只有三个状态 pending，fulfilled，rejected，状态一旦从 pending 变成后面两个，就不会再发生变化了，支持链式调用，通过.then() 方法，可以将异步任务的结果参数传递下去，实现了更好的异步任务执行控制和错误处理。

为什么要有 Promise？解决了什么问题？
在 Promise 之前，为了处理 JavaScript 中的异步任务，一般都是通过在回调函数中，拿到异步任务的结果，然后再进行下一步操作。如果涉及多个异步任务嵌套的场景，就会出现"嵌套地狱"。Promise 将嵌套的回调拍平了，可以竖着发展，而不是横向发展。

核心机制？

1. 状态驱动：Promise 内部维护状态机，成功时调用 resolve(value)，失败时调用 reject(error)
2. 链式传递：每个 .then 方法都会返回一个新的 Promise，可以传递值或者 Promise 对象，实现任务的串联（.then ,.catch 里面都是 微任务，可以在当前宏任务结束后，立即执行，从而让用户更快的看到由异步任务触发的结果，比如渲染了新的数据之类）
3. 错误冒泡：在链中的任意环节，出现错误(throw new Error())，或者出现 reject(error)时，都会跳过后续的 .then，直达最近的 .catch

如何实现 Promise？核心在于实现 .then 方法

```
const MyPromise = (fn) => {
    this.callbackList = [] // 存储要执行的回调

    const resolve = (value) => {
        setTimeout(() => {
            this.data = value;
            this.callbackList.forEach(cb => cb(value))
        }, 0)
    }

    fn(resolve);
}

MyPromise.prototype.then = (onResolved) => {
    return new MyPromise((resolve) => {
        this.callbackList.push(() => {
            const response = onResolved(this.data)
            // 执行结果是否是一个 promise
            if (response instanceof MyPromise) {
                // 1. 还是 promise
                response.then(resolve)
            } else {
                // 2. 不是 promise
                resolve(response)
            }
        })
    })
}
```

最佳实践

1. 能并行的，就并行，Promise.all([])
2. 一定要有 catch 做错误捕获处理
3. 可以使用 Promise.race 实现调用接口超时时间的控制
4. 针对Promise 中的接口请求，可能会存在竞态（即第一次请求返回比较慢，第二次请求返回比较快，导致页面上的数据渲染实际渲染了第一次的返回内容），此时如果是 fetch 这种支持请求终止的，就直接终止前一次的请求。如果是不支持请求终止的，比如 axios，可以加一个变量控制，在请求拿到数据后，通过变量看下当前所在的上下文是否已经销毁了？如果已经销毁了，那就啥也不做。如果没有销毁，就正常执行流程

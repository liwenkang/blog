---
title: Independent Module Url Processing For New Worker()
date: '2023-05-27'
tags: ['New Worker()', 'New URL()', 'Module']
draft: false
summary: One way to get right url in new Worker()
---

Yesterday, I found a problem with `file upload` in my frontend page.

When I upload a file to server, the browser tells me an error.

```
DOMException: Failed to construct 'Worker': Script at 'http://localhost:9000/src_env_document_spark-md5_js.UploadFileApp.js' cannot be accessed from origin 'http://localhost:5001'.
    at http://localhost:9000/UploadFileApp.js:234274:27
    at new Promise (<anonymous>)
    at splitBigFile (http://localhost:9000/UploadFileApp.js:234271:12)
    at http://localhost:9000/UploadFileApp.js:234373:17
    at Generator.next (<anonymous>)
    at http://localhost:9000/UploadFileApp.js:234258:69
    at new Promise (<anonymous>)
    at __awaiter (http://localhost:9000/UploadFileApp.js:234240:12)
    at uploadFile (http://localhost:9000/UploadFileApp.js:234339:117)
    at http://localhost:9000/UploadFileApp.js:269092:42
    at new Promise (<anonymous>)
    at isUploadTimeOut (http://localhost:9000/UploadFileApp.js:269088:7)
    at http://localhost:9000/UploadFileApp.js:269101:27
    at Generator.next (<anonymous>)
    at http://localhost:9000/UploadFileApp.js:268900:69
    at new Promise (<anonymous>)
    at __awaiter (http://localhost:9000/UploadFileApp.js:268882:12)
    at uploadFileToNode (http://localhost:9000/UploadFileApp.js:269068:12)
    at http://localhost:9000/UploadFileApp.js:254966:45
    at Generator.next (<anonymous>)
    at fulfilled (http://localhost:9000/UploadFileApp.js:254870:26)
```

Here is my code.

```js
// `UploadFileApp`: getMD5EventListener.js
import SparkMD5 from 'spark-md5'

addEventListener('message', (e) => {
  const file = e.data.file || []
  const FILE_CHUNK_SIZE = 1 * 1024 * 1024
  const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  const chunks = Math.ceil(file.size / FILE_CHUNK_SIZE)
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()
  let currentChunk = 0

  fileReader.onload = function (e) {
    spark.append(e.target.result) // Append array buffer
    currentChunk++
    if (currentChunk < chunks) {
      loadNext()
    } else {
      postMessage({ md5: spark.end() })
    }
  }

  fileReader.onerror = function () {
    console.warn('oops, something went wrong.')
  }

  function loadNext() {
    const start = currentChunk * FILE_CHUNK_SIZE,
      end = start + FILE_CHUNK_SIZE >= file.size ? file.size : start + FILE_CHUNK_SIZE
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  loadNext()
})
```

```js
// `UploadFileApp`: main.js
const getMD5 = (file: File): Promise<{ md5: string }> => {
  return new Promise((resolve) => {
    //  Here: Failed to construct 'Worker'
    const sparkWorker = new Worker(new URL('./getMD5EventListener.js', import.meta.url))
    sparkWorker.onmessage = (event) => {
      resolve({ md5: event.data.md5 })
    }
  })
}
```

I think it could work until the file upload module was split as a independent module(We call it UploadFileApp) from a big web application(We call it BigWebApp, it's based on Next and React). So I want to compare what's the difference between them.

First, I try to hit some breakpoints, and use `console.log` to show me more information

```js
// `UploadFileApp`: main.js
const getMD5 = (file: File): Promise<{ md5: string }> => {
  return new Promise((resolve) => {
   debugger
    // 1
    console.log('import.meta.url', import.meta.url)
    // 2
    console.log(
      "new URL('./spark-md5.js', import.meta.url)",
      new URL('./spark-md5.js', import.meta.url)
    )    const sparkWorker = new Worker(new URL('./getMD5EventListener.js', import.meta.url))
    sparkWorker.onmessage = (event) => {
      resolve({ md5: event.data.md5 })
    }
  })
}
```

Obviously, `import.meta.url` return the file `absolute path` and show it's path in it's file Location, and because of module split, it changed. But, to my surprise, `new URL('./spark-md5.js', import.meta.url)` return completely different result.

```js
// old
'/_next/static/media/spark-md5.756744a0.js'
```

```js
// new
'http://localhost:9000/2471a53e42b8c4be0b00.js'
```

`localhost:9000` is my upload module server host and port

It seems that old result is a static file, and it's generated by Next in `BigWebApp`. And the new result is also a static file, But it's generated by Webpack in `UploadFileApp`.

The key is that when you use `new Worker()`, `new URL()` and `import.meta.url`, you should consider where will it be used.

So When I use `UploadFileApp` inside `BigWebApp`, its incoming parameter is totally wrong.

There is a less elegant solution for me, just replace `new Worker()` with asynchronously read and process the file. Actually my script in `new Worker()` is just to calculate MD5. So, I change my code, and calculate MD5 without `new Worker()`.

```js
const asyncGetFileMD5 = ({ file, resolve }) => {
  const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  const chunks = Math.ceil(file.size / FILE_CHUNK_SIZE)
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()
  let currentChunk = 0

  fileReader.onload = function (e) {
    spark.append(e.target.result) // Append array buffer
    currentChunk++
    if (currentChunk < chunks) {
      loadNext()
    } else {
      resolve({ md5: spark.end() })
    }
  }

  fileReader.onerror = function () {
    console.warn('oops, something went wrong.')
  }

  function loadNext() {
    const start = currentChunk * FILE_CHUNK_SIZE,
      end = start + FILE_CHUNK_SIZE >= file.size ? file.size : start + FILE_CHUNK_SIZE
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  loadNext()
}

const splitBigFile = (file: File): Promise<{ md5: string }> => {
  return new Promise((resolve) => {
    asyncGetFileMD5({ file, resolve })
  })
}
```

After some tests, It looks like it's okay, but is there any way we can continue to use `new Worker()`? I ask chatGPT for help...

chatGPT tell me two ways to solve the problem.

1. Using a static location to store script, like cdn
2. Using Blob and URL.createObjectURL()

In my project, I don't a static location to store script, So the only way is using Blob and URL.createObjectURL()

First of all, I can't import SparkMD5 from 'spark-md5' directly in `UploadFileApp/getMD5EventListener.js`， I need to download spark-md5.js and store it in my local folder(localThirdModule).

```js
// `UploadFileApp`: main.js
function getWorkerUrl() {
  const sparkMD5Url = new URL('localThirdModule/spark-md5.js', import.meta.url)
  const getMD5EventListenerUrl = new URL('./getMD5EventListener.js', import.meta.url)
  const workerScript = `importScripts("${sparkMD5Url.href}", "${getMD5EventListenerUrl.href}");` // please pay attention, the script order is important
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  return window.URL.createObjectURL(blob)
}

const getMD5 = (file: File): Promise<{ md5: string }> => {
  return new Promise((resolve) => {
    const sparkWorker = new Worker(getWorkerUrl())
    sparkWorker.onmessage = (event) => {
      resolve({ md5: event.data.md5 })
    }
  })
}
```

I don't known why the [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) say the `new Worker()` first incoming parameter is just a string representing the URL of the script the worker will execute. But you can even pass a function, and use it's result as first incoming parameter

Finally, you can see there is a `URL.revokeObjectURL()` method to releases an existing object URL which was previously created by calling URL.createObjectURL().But in my application, I can't find a fit place to use it. Maybe, one day, it will give me a hammer blow. o(╥﹏╥)o

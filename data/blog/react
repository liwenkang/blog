---
title: React
date: '2023-05-08'
tags: ['react', 'hook', 'React Components']
draft: true
---

## react-hook

use `usecallback` with `memo` to reduce unnecessary child-component re-render

use `useContent` and wrap child components in `<XXX.Provider value="xxx">` to share data between components without passing data by props.

use `useDeferredValue` with `<Suspense fallback={} >` to improve user experience by update a part of UI.

use `Effect` to get data, Connecting to an external system.

use `useId` to generate Id for aria-describe

use `useImperativeHandle` to make the parent component to get the child commponent's ref without true dom, but only some methods that the child component want to expose.

use `useInsertionEffect` to inject dynamic styles from CSS-in-JS libraries. It's happen before DOM mutations.

use `useLayoutEffect` to measure layout before the browser repaints the screen

use `useMemo` to cache a function result between re-renders.
try to separate a object dependencies to more single variable.

a example explain `useCallback` and `useMemo`

```js
const handleSubmit = useMemo(() => { // no arguments
    return (data) => {
        axios.post(url, {
            data
        })
            .then()
            .catch()
    }
}, [url])

const handleSubmit = useCallback((data) => {
   axios.post(url, {
        data
    })
        .then()
        .catch()
}, [url])
```

use `useReducer` to set initial state and change state by dispatch action.

use `useRef` to store data that won't change in screen, If you want to change `ref.current`, You should change it during `useEffect` or in a event handler like `handleSubmit`.
If use map/EChart/VideoPlayer, just initial constructor once.
```js
useEffect(() => {
    // the initial value is a function, and it will be called in every render
    const playerRef = useRef(new VideoPlayer())
    
    const playerRef = useRef(null)
    if (playerRef.current === null) {
        playerRef.current = new VideoPlayer()
    }
}, [])
```
use `forwardRef`,if you want to expose the child component ref to the parent component

use `useState`, if you initial a state by passing a function which look like
```js
// The function computeNum will execute in every render
const [num, setNum] = useState(computeNum())

// React will only call it during initialization.
const [num, setNum] = useState(computeNum)
```

if you need to integrate with existing non-React code. such as `navigator.onLine` use `useSyncExternalStore`

```js
import { useSyncExternalStore } from 'react';

export default function ChatIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function getSnapshot() {
  return navigator.onLine;
}

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}
```

use `useTransition` update the state without blocking the UI.
Toggle components by changing tab, UI will be blocked, put the `setTab(nextTab)` in `useTransition` function. 

## React Components

`<Fragment>` can pass key in array loop.

`<Profiler>` phase: "mount", "update" or "nested-update"
compare `actualDuration`, `baseDuration`, you will know whether memorization work

`<StrictMode>` enable trigger once more method. warn you some deprecation methods

`<Suspense>` If you use `<Suspense>` in a nested components, maybe you don't want to show fallback content when some useful content already exist. So use `useTransition` or `startTransition`, and pass `setPage(url)` in callback function.

## API

use `createContext` with `useContext` and `<XX.Provider>`

use `forwardRef` to pass ref to custom component

use `lazy` in react router classnames

use `startTransition`: the function in it will not block UI

[drag/drop api](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

use `createPortal`: place the component in what you want. example: <Modal />

use `flushSync` 

For example, the browser onbeforeprint API allows you to change the page immediately before the print dialog opens. This is useful for applying custom print styles that allow the document to display better for printing. In the example below, you use flushSync inside of the onbeforeprint callback to immediately “flush” the React state to the DOM. Then, by the time the print dialog opens, isPrinting displays “yes”:

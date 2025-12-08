---
title: 'Start Mobx With React'
date: '2023-04-21'
tags: ['Mobx', 'React', 'State Management']
draft: false
summary: 'Two hooks to start Mobx with React'
---

Maybe two years ago, My friend Bryan suggest me to replace [redux](https://redux.js.org/) to [mobx](https://mobx.js.org/). I remember when I opened the document of mobx, I was confused by the document, and I didn't know how to start. So I gave up.

Luckily, I find an easy-to-follow tutorial today, [Introduction to MobX & React in 2020](https://www.youtube.com/watch?v=pnhIJA64ByY).

So, Let's start!

First of all, you can create an react app by using [create-react-app](https://create-react-app.dev/), then in order to support `decorators`, you need to eject the app.

```bash
npm run eject
```

and change the `package.json` to support `@babel/plugin-proposal-decorators`.

```json
{
  // ...
  "babel": {
    "presets": ["react-app"],
    "plugins": [
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ]
    ]
  }
}
```

Then, you can install `mobx` and `mobx-react`.

```bash
npm install mobx mobx-react
```

Here comes the point!

Just like redux, you need create a store to manage the state. In mobx, you can use `useLocalStore` to create a store.It includes data, action and computed method.

```js
//  src/store/index.js
import React from 'react'
import { useLocalStore } from 'mobx-react'

const StoreContext = React.createContext()

const StoreProvider = ({ children }) => {
  const store = useLocalStore(() => ({
    // data
    bugs: ['Centipede'],
    // action: don't use `this`
    addBug: (bug) => {
      store.bugs.push(bug)
    },
    // computed: don't use `this`
    get bugsCount() {
      return store.bugs.length
    },
  }))

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export { StoreContext, StoreProvider }
```

Then, you can wrap `<App>` in `<StoreProvider>`, then `<App>` can access the store.

```js
// src/index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { StoreProvider } from './store'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
```

In order to get store in `<App>`, you can use `React.useContext` to get the store. If you want to make your component re-render when the store changes, you can use `useObserver`.

```js
// src/App.js
import React from 'react'
import { StoreContext } from './store'
import { useObserver } from 'mobx-react'

const BugsHeader = () => {
  const store = React.useContext(StoreContext)

  return useObserver(() => {
    return <h1>{store.bugsCount} Bugs!</h1>
  })
}

const BugsList = () => {
  const store = React.useContext(StoreContext)

  // It will re-render when the store changes
  return useObserver(() => (
    <ul>
      {store.bugs.map((bug) => (
        <li key={bug}>{bug}</li>
      ))}
    </ul>
  ))
}

const BugsForm = () => {
  const store = React.useContext(StoreContext)
  const [bug, setBug] = React.useState('')

  // It doesn't re-render when the store changes
  return (
    <form
      onSubmit={(e) => {
        store.addBug(bug)
        setBug('')
        e.preventDefault()
      }}
    >
      <input
        type="text"
        value={bug}
        onChange={(e) => {
          setBug(e.target.value)
        }}
      />

      <button type="submit">Add</button>
    </form>
  )
}

const App = () => {
  return (
    <div>
      <BugsHeader />
      <BugsList />
      <BugsForm />
    </div>
  )
}

export default App
```

So, just two hooks `useLocalStore`, `useObserver` you need to know to start mobx with react. In real project, you may want to have multiple stores for different components.

Have a try!

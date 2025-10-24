---
title: React组件如何设计？
date: '2025-10-24'
tags: ['react', 'react component']
draft: false
---

四点建议：

1. 一开始不要过度考虑组件的扩展性。如果在一开始就把各种情况都考虑到，会导致组件核心功能不清晰，为了实现各个 props，可能会导致代码存在很多的逻辑判断
2. 如果为了高扩展性设计，可以考虑更多使用 props.children 插槽的方式，让外界更自由的使用。而组件只关心自己的核心功能。如果是为了让用户即插即用，可能确实需要支持更多的 props。
3. 关注传入 props 的命名，类型，是否必填（使用 Typescript 强定义）
4. 关注组件中的状态管理，state => common parent state => props.children => context

一个 Button 组件的示例

功能：包含文字描述和图标，支持 Link（React Router） 和 a 标签
注意点

- 能够接受任意 props，例如 onKeyDown 和 aria-describedby
- 能够呈现为 button 、带有 href 属性的 a 或带有 to 属性的 Link
- 确保根元素具有其所需的所有 props，并且没有不支持的 props
- 不会让 TypeScript 崩溃
  我们来提供一个初始化示例

```tsx
function Button() {}
const App = () => {
  return (
    <>
      {/* Easy defaults */}
      <Button />
      <Button>Click me</Button>

      {/* complex component */}
      <Button
        color="primary"
        icon="arrow-right"
        className="btn-large"
        onClick={() => {
          console.log('clicked')
        }}
        onMouseDown={() => {
          console.log('mouse down')
        }}
      />

      {/* wrong prop type should be caught by the compiler */}
      <Button fakeProp="fakePropValue" />
    </>
  )
}
export default App
```

在第一版的实现中我是这么做的

```tsx
const Link = ({ to }: { to: string }) => {
  return <a href={to}>Click me</a>
}

interface ButtonInjectedProps {
  className?: string
  children?: React.ReactNode
}

interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement & HTMLAnchorElement & HTMLDivElement> {
  color?: string
  icon?: string
  className?: string
  onClick?: () => void
  renderContainer?: (props: ButtonInjectedProps) => React.ReactNode
  children?: React.ReactNode
}

const getClassName = (color: string, className: string) => {
  return `btn btn-${color ?? 'primary'} ${className ?? ''}`
}

function Button({
  color = 'primary',
  icon,
  className = '',
  onClick,
  renderContainer,
  children,
  ...props
}: ButtonProps & React.HTMLAttributes<HTMLButtonElement>): React.ReactNode {
  // Enforce that color is always a defined string for getClassName
  const safeColor = color ?? 'primary'
  return renderContainer ? (
    renderContainer({ className, children, ...props } as ButtonInjectedProps &
      React.HTMLAttributes<HTMLButtonElement & HTMLAnchorElement & HTMLDivElement>)
  ) : (
    <>
      {icon && <div className={`icon icon-${icon}`}>{icon}</div>}
      <button className={getClassName(safeColor, className)} onClick={onClick} {...props}>
        {children}
      </button>
    </>
  )
}

const App = () => {
  return (
    <>
      {/* Easy defaults */}
      <Button />

      <Button>Click me</Button>

      {/* complex component */}
      <Button
        color="primary"
        icon="arrow-right"
        className="btn-large"
        onClick={() => {
          console.log('clicked')
        }}
        onMouseDown={() => {
          console.log('mouse down')
        }}
      />

      {/* Renders a Link, enforces `to` prop set */}
      <Button renderContainer={(props) => <Link {...props} to="/" />} />

      {/* Renders an anchor, accepts `href` prop */}
      <Button renderContainer={(props) => <a {...props} href="/" />} />

      {/* Renders a button with `aria-describedby` */}
      <Button renderContainer={(props) => <button {...props} aria-describedby="tooltip-1" />} />

      {/* wrong prop type should be caught by the compiler */}
      <Button fakeProp="fakePropValue" />
    </>
  )
}

export default App
```

但是还有几个小问题需要解决一下

1. `React.HTMLAttributes<HTMLButtonElement & HTMLAnchorElement & HTMLDivElement>`
   使用交叉类型 &来合并多个不同的 HTML 元素类型（如 HTMLButtonElement、HTMLAnchorElement）的主要问题在于，它会试图创建一个同时包含所有这些元素属性的“超级”类型。这会导致几个问题：

- 属性冲突与类型不兼容​：不同的 HTML 元素虽然有大量共用属性，但也存在许多独有的属性，甚至同名的属性可能要求不同的类型。例如，`<a>`标签有 href 属性，而 `<button>`有 disabled属性。当它们被合并时，您的组件理论上会同时拥有这些属性，这听起来很好，但实际上，当您将 ...rest属性传递给一个具体的 DOM 元素（如 `<button>`）时，href属性对按钮是无效的，可能会被 React 忽略或导致控制台警告。更重要的是，如果不同元素对同一个属性的类型定义存在不兼容（虽然不常见），交叉类型会尝试合并它们，可能导致该属性的类型变为 never，从而无法使用。
- 语义混乱​：一个组件应该具有明确的语义。它应该清晰地对应一个主要的 HTML 元素。将一个组件的属性同时定义为按钮、链接和 div 的特性，会使组件的用途和预期行为变得模糊不清，不利于代码的维护和理解。
  我们可以考虑使用 as 属性，实现多态组件

2. 应该精确过滤和传递属性

```tsx
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

const Link = ({ to }: { to: string }) => {
  return <a href={to}>{to}</a>
}

const ButtonIcon = ({ icon }: { icon: string }) => {
  return <div className={`icon icon-${icon}`}>{icon}</div>
}

type BaseButtonProps = {
  color?: string
  icon?: string
  className?: string
  children?: ReactNode
}

// 多态Props：通过 `as` 属性决定渲染为何种元素/组件
type PolymorphicButtonProps<T extends ElementType> = BaseButtonProps & {
  as?: T
  to?: string // 专属于 Link 的 prop
  href?: string // 专属于 a 标签的 prop
  type?: string // 专属于 button 的 prop
} & Omit<ComponentPropsWithoutRef<T>, keyof BaseButtonProps | 'to' | 'href'>

// 组件的函数签名
function Button<T extends ElementType = 'button'>({
  as,
  color = 'primary',
  icon,
  className = '',
  children,
  to,
  href,
  type,
  ...restProps
}: PolymorphicButtonProps<T>) {
  const Component = as || 'button' // 默认渲染为 button 元素

  const finalClassName = `btn btn-${color} ${className}`.trim()
  // 根据 `as` 的值和传入的属性，安全地构建需要传递的 props
  const baseProps: any = {
    className: finalClassName,
    ...restProps,
  }

  if (Component === 'a') {
    return (
      <Component {...baseProps} href={href}>
        {icon && <ButtonIcon icon={icon} />}
        {children}
      </Component>
    )
  } else if (Component === Link) {
    // 需要正确定义 Link 类型
    return (
      <Component {...baseProps} to={to as string}>
        {icon && <ButtonIcon icon={icon} />}
        {children}
      </Component>
    )
  } else {
    // 处理 button 和其他自定义组件
    const componentProps = {
      ...baseProps,
      ...(Component === 'button' && { type: type || 'button' }), // 仅为 button 添加 type
    }
    return (
      <Component {...componentProps}>
        {icon && <ButtonIcon icon={icon} />}
        {children}
      </Component>
    )
  }
}

const App = () => {
  return (
    <>
      {/* Easy defaults */}
      <Button />

      <Button>Click me</Button>

      {/* complex component */}
      <Button
        color="primary"
        icon="arrow-right"
        className="btn-large"
        onClick={() => {
          console.log('clicked')
        }}
        onMouseDown={() => {
          console.log('mouse down')
        }}
      />

      {/* Renders a Link, enforces `to` prop set */}
      <Button as={Link} to="/" />

      {/* Renders an anchor, accepts `href` prop */}
      <Button as="a" href="/" />

      {/* Renders a button with `aria-describedby` */}
      <Button as="button" aria-describedby="tooltip-1" />

      {/* wrong prop type should be caught by the compiler */}
      <Button fakeProp="fakePropValue" />
    </>
  )
}

export default App
```

如果你有更好的设计思路，欢迎和我交流！

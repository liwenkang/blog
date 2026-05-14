---
title: 怎么写出 AI 修改友好的前端代码-AI版本
date: '2026-05-14'
tags:
  - AI
  - Frontend
draft: false
summary: 面向 2026 年 AI 编程工具的前端代码最佳实践：不是让 AI 从 0 到 1 无约束发挥，而是由人搭好工程边界，让 AI 在清晰架构、类型、测试和任务约束内高效修改。
---

2026 年再讨论这个话题，重点早就变了。不是"怎么写提示词让 AI 一次生成完整项目"，而是：怎么设计一个代码库，让 AI 能持续、稳定、低风险地修改它。

我的看法很直接：生产项目不应该一开始就完全交给 AI。更实际的做法是人先搭好基础框架、目录边界、技术约束和验证闭环，再让 AI 在明确范围内高频执行。

AI 写代码、补组件、改样式、迁移 API 都很拿手。但如果没有足够的上下文，让它长期保持架构一致性，基本靠不住。一个 AI 修改质量高的项目，背后通常是代码本身清晰：边界明确，类型完整，反馈快速。

## 要不要从 0 到 1 vibe coding？

可以，但分场景。

Demo、活动页、概念验证——让 AI 从头生成完全合理。这个阶段要的是速度，不是长期可维护性。快速产出，人工挑选能留下来的部分。

但如果是长期维护的业务系统，我不建议这么做。AI 在局部任务上很强，在长期架构一致性上不可靠。它倾向于复制已有模式，也会放大已有混乱。项目一开始没有边界，AI 只会更快地制造技术债。

我倾向的分工是：人负责定义产品边界、技术选型、目录结构、数据流、状态管理和质量门禁；AI 负责生成初始代码、补齐组件、写测试、处理重复劳动；人负责 code review 和架构取舍。

说白了，别让 AI 当架构师。让它当执行力强的开发助手。

## AI 友好的代码，首先是人也容易理解的代码

很多人把"AI 友好"理解成"多写注释"或者"多加规则"。这只对了一半。

真正让 AI 修改质量稳定的代码，通常满足这几个条件：目录结构稳定，文件职责清晰；类型定义完整，输入输出明确；组件粒度适中，不是几千行大组件；业务逻辑、UI 展示、数据请求、状态管理分开放；有可运行的 lint、typecheck、test、build；需求和约束写在仓库里，不是散在聊天记录里。

AI 修改代码时，主要依赖三类信息：当前文件、相邻文件、项目级规则。代码本身混乱，AI 看到的上下文也是混乱的。这时候再多提示词，也只是在补救代码结构的问题。

## 基础框架先搭好，但不要过度设计

一个 AI 修改体验好的前端项目，初始化时至少先定下这些：

```text
技术栈
├── 框架：Next.js / Vite / Remix 等，优先选团队熟悉且生态成熟的方案
├── 语言：TypeScript strict mode
├── 样式：Tailwind CSS / CSS Modules / design tokens，规则要统一
├── 数据校验：Zod / Valibot / OpenAPI schema
├── 测试：Vitest/Jest + Testing Library + Playwright
├── 质量门禁：ESLint + Prettier + typecheck + build
└── AI 规则：AGENTS.md / CLAUDE.md / Cursor rules 等
```

重点不是追新，而是减少 AI 的选择空间。AI 最容易出问题的地方，就是每次都在猜：

- 这个项目到底用不用 Server Components？
- API 请求写在组件里，还是封装到 service？
- 表单校验用 Zod，还是手写 if else？
- 样式写 Tailwind，还是 CSS Module？
- 新组件放 `components/`，还是业务目录下？

这些问题如果不提前定下来，AI 每次都会"合理但不一致"地做选择。一个项目里出现三套请求封装、四种表单写法，通常就是这样来的。

## 用仓库文件约束 AI，不只是聊天提示词

AI 编程工具现在普遍支持项目级指令文件。Codex 用 `AGENTS.md`，Claude Code 用 `CLAUDE.md`，很多 IDE Agent 也有自己的 rules 文件。

这类文件不要写成百科全书。官方文档也说，项目指令应该具体、简洁、结构化。Claude Code 建议 `CLAUDE.md` 控制在较短规模内，复杂规则拆到路径级；Codex 的 `AGENTS.md` 按目录层级加载，靠近当前目录的规则优先级更高。

一个实用的 `AGENTS.md` 大概长这样：

```markdown
# AGENTS.md

## Project

- Next.js App Router + TypeScript strict mode.
- Package manager: pnpm.
- Use `@/*` path alias for local imports.

## Commands

- Install: `pnpm install`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Build: `pnpm build`

## Frontend Rules

- Prefer Server Components by default. Add `use client` only for interactivity, browser APIs, or client state.
- Keep components under 200 lines when practical. Extract business logic into hooks or pure functions.
- Do not introduce new dependencies without explicit approval.
- Do not use `any`; use explicit types or `unknown` with narrowing.
- Keep API request/response validation close to the boundary.

## Validation

- After changing TypeScript or React files, run lint and typecheck.
- For behavior changes, add or update tests.
```

这个文件的价值不是让 AI 更聪明，而是让它少猜。规则越具体越容易执行，越抽象越容易被忽略。

比如：

- 不好：保持代码优雅。
- 更好：组件超过 200 行时优先拆分，业务计算放到 `lib/` 或 `features/*/utils.ts`。
- 不好：注意测试。
- 更好：修改表单提交逻辑时，必须补充成功、失败、loading 三种状态测试。

## 目录结构要让 AI 一眼看出边界

AI 不怕文件多，怕的是边界不清。

我更推荐按业务域组织前端代码，而不是把所有东西塞进全局 `components`、`hooks`、`utils`：

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       └── page.tsx
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── tests/
│   └── billing/
│       ├── components/
│       ├── api.ts
│       ├── schema.ts
│       └── tests/
├── components/
│   └── ui/
├── lib/
│   ├── env.ts
│   ├── logger.ts
│   └── utils.ts
└── styles/
    └── globals.css
```

这样做的好处是：AI 修改登录功能时，大概率只需要看 `features/auth`，不会碰到其他模块。schema、types、api、tests 放在同一业务域，AI 也更容易补齐联动修改。

对 AI 来说，"相关文件都在附近"这件事很重要。上下文距离越短，修改越稳定。

## 组件要小，但不能碎

AI 喜欢在已有文件里继续追加。如果一个组件已经 800 行，它很可能继续往里塞。最后这个文件会变成谁都不敢动的超级组件。

更实用的原则：页面组件负责组合，不写复杂业务逻辑；UI 组件只管展示和交互，不直接发请求；表单组件明确 props、默认值、提交状态和错误状态；复杂计算放到纯函数，方便单独测试；副作用集中在少数 hooks 或 action 中，不散落在 JSX 里。

一个对 AI 不友好的组件通常长这样：

```tsx
export function UserDashboard() {
  // 请求、权限判断、筛选、弹窗、表格、表单、埋点全部在这里
}
```

AI 面对这种组件，很难判断新增逻辑应该放哪里，只能继续追加。

更好的拆法：

```tsx
export async function UserDashboardPage() {
  const data = await getUserDashboardData()

  return (
    <DashboardShell>
      <UserSummary data={data.summary} />
      <UserTable users={data.users} />
      <BillingNotice billing={data.billing} />
    </DashboardShell>
  )
}
```

这样 AI 就能清楚识别页面、数据、展示组件的边界。让它"修改账单提示文案"，它就不应该去碰用户表格。

## TypeScript 是给 AI 的护栏

AI 参与开发后，TypeScript 的价值变得更明显。AI 很容易写出"看起来合理，但契约不对"的代码，类型系统可以把一部分问题提前挡住。

几个实用做法：开启 `strict: true`；禁止裸 `any`；API 响应要有 schema 校验；表单输入、URL params、环境变量都做边界校验；共享类型从 schema 推导，不要手写两套。

```ts
import { z } from 'zod'

export const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
```

这段代码同时告诉 AI 字段有哪些、哪些必填、默认值是什么、类型从哪里来。AI 后续写表单、API、测试时，都可以围绕这个 schema 展开，不用凭空猜字段。

## React / Next.js 的新范式要写进规则里

2026 年的 React 前端和几年前不一样了。React Compiler 已经稳定，官方建议新代码更多依赖 Compiler 做自动 memoization，只在需要精确控制时用 `useMemo` / `useCallback`。Next.js App Router 已经是主流路径，默认拥抱 Server Components、Suspense、Server Functions。

对 AI 的影响有两点。第一，不要让 AI 套用旧习惯，到处手写 `useMemo`、`useCallback`、`React.memo`。除非 profiling 证明有性能问题，或者依赖稳定性确实需要，这些代码只会增加噪音。

第二，明确 Server / Client 边界。在 Next.js App Router 中，可以约定：默认写 Server Component；只有用到浏览器 API、事件处理、客户端状态时才加 `use client`；数据读取优先在服务端完成；交互组件尽量下沉，避免整个页面变成 Client Component。

这类规则必须写进项目指令，否则 AI 为了"能跑"很容易把 `use client` 加到页面顶层。短期没问题，时间长了 RSC 的收益就消失了。

## 测试是 AI 修改代码的反馈系统

AI 编程最大的风险不是写不出来，而是写出来但悄悄破坏了别的功能。

所以项目里必须有自动验证：

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "e2e": "playwright test",
    "build": "next build"
  }
}
```

最低要求：改工具函数，有单元测试；改组件交互，有组件测试；改关键用户路径，有 e2e 测试；改数据契约，schema 和 mock 一起更新。

AI 最适合"写完就跑验证，根据报错继续修"的闭环。没有测试，AI 只能靠静态阅读和自信判断，这个组合相当危险。

## 任务要小，验收标准要具体

不要一次丢给 AI 一个大需求：

> 帮我重构整个后台系统，顺便优化性能和样式。

这种任务会导致大面积改动，review 成本很高。

更好的写法：

```markdown
任务：重构用户列表筛选逻辑

范围：

- 只修改 `features/users` 下的文件。
- 不改 API 契约。
- 不引入新依赖。

目标：

- 将筛选状态同步到 URL query。
- 刷新页面后保留筛选条件。
- 保持现有表格展示不变。

验收：

- 新增 URL query 相关测试。
- `pnpm lint` 和 `pnpm test` 通过。
```

AI 的执行质量和任务边界直接相关。边界清晰，结果稳定；边界模糊，改动容易扩散。

## 规则文件要精，不要多

很多团队开始用 AI 后会不断往规则文件里加内容，最后变成几百上千行。结果是 AI 读了但遵守得不稳定。

更好的管理方式：全局规则只放每次都需要的内容；业务域规则放到对应目录；临时任务约束写在 prompt 里；复杂流程写成脚本或命令，不要只写自然语言；规则定期清理过期内容。

比如，这些没用：

```markdown
- 保持良好架构。
- 注意性能。
- 保证代码质量。
- 遵守最佳实践。
```

这些才有用：

```markdown
- 列表超过 100 条时使用分页或虚拟列表，不直接全量渲染。
- 新增 public function 时必须补充对应测试。
- 修改 `features/billing` 时必须更新 `schema.ts` 中的 Zod schema。
- 不在 Client Component 中直接读取服务端密钥或环境变量。
```

AI 需要的是可执行的规则，不是价值观口号。

## 什么样的代码最不 AI 友好？

列一下最容易踩的坑：单文件过大，一个组件几百到几千行；类型缺失，大量 `any`、隐式对象、魔法字段；业务逻辑直接写在 JSX 中；请求、缓存、状态、埋点、UI 混在一起；同一类功能有多种实现方式；缺少测试，改完只能手动点页面；目录结构没有业务边界；环境变量、权限、接口契约没有文档；规则文件很长但抽象，没有具体命令和验收方式。

这些问题在人类团队里已经很麻烦，加入 AI 后会放大得更快。

## 如果从零开始，我会这样做

1. 先写一页架构说明：项目目标、技术栈、目录结构、状态管理、接口约定。
2. 初始化工程：TypeScript strict、ESLint、Prettier、测试框架、CI。
3. 建立 `AGENTS.md` / `CLAUDE.md`：只写关键命令、项目约定、禁止事项、验证方式。
4. 搭好设计系统基础：颜色、字号、间距、按钮、输入框、弹窗、布局容器。
5. 定义数据边界：schema、API client、错误格式、环境变量校验。
6. 建立业务目录：按 feature 聚合组件、schema、api、hooks、tests。
7. 让 AI 生成首批页面和组件，但要求小步提交。
8. 每个任务写清楚范围、目标、禁止事项和验收标准。
9. 所有 AI 改动都通过 lint、typecheck、test、build。
10. 人负责 review 架构和产品语义，不把最终判断交给 AI。

第 1、3、8、9 步最关键。它们决定 AI 是在可控地加速，还是在高速地制造混乱。

## 结语

AI 友好的前端代码，不是更花哨的代码，也不是堆满提示词的代码。它就是一个新人容易上手、测试容易运行、文件职责清晰、错误容易定位的代码库——碰巧这也是任何团队都该追求的目标。

人先搭骨架，AI 填内容。人定规则，AI 做执行。人做最终判断，AI 负责加速。这个分工如果搞清楚了，AI 工具的收益才能真正兑现。

## 参考资料

- [React Compiler 官方文档](https://react.dev/learn/react-compiler/introduction)
- [Next.js App Router 官方文档](https://nextjs.org/docs/app)
- [Claude Code Memory / CLAUDE.md 官方文档](https://code.claude.com/docs/en/memory)
- [Codex AGENTS.md 官方文档](https://developers.openai.com/codex/guides/agents-md)

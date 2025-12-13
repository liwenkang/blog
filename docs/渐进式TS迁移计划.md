# 渐进式 TypeScript 迁移计划

## 目标

在不影响现有构建的前提下，逐步将核心模块迁移到 TypeScript，提升类型安全与开发体验。

## 阶段与步骤

### 阶段 1：类型基础（当天完成）

- 添加声明文件：`types/content.d.ts`（Post/Tag/SiteMetadata 等）
- 在 JS 文件通过 JSDoc 引用类型（无需改扩展名）：
  ```js
  /** @typedef {import('../types/content').PostItem} PostItem */
  ```
- 校验 `tsconfig.json` 与 Next.js 混合 TS/JS 支持是否正常（已存在）。

### 阶段 2：核心工具迁移（1-2 天）

- 将 `lib/tags.js`、`lib/mdx.js`、`lib/remark-*` 等逐步迁移为 `.ts`，保留原导出 API。
- 为 `scripts/generate-search-index.js` 增加类型声明或迁移到 TS。

### 阶段 3：组件与页面（2-3 天）

- 从无状态组件开始迁移：`components/Tag.js`、`components/PageTitle.js` 等。
- 页面按路由重要性选择性迁移，如 `pages/search.js`、`pages/tags.js`。

### 阶段 4：严格模式与质量保障（可选）

- 打开更严格的编译选项（如 `strict`, `noUncheckedIndexedAccess`）。
- 引入 `eslint` 的 `@typescript-eslint` 规则并按模块推进。

## 验证与回滚策略

- 每次迁移保持小步提交，运行 `npm run build` 与现有测试。
- 若出现兼容问题，保留 JS 版本做快速回滚；TS 构建失败时以声明文件降级。

## 当前进度

- 已新增：`types/content.d.ts`
- 待执行：工具与组件的逐步迁移。

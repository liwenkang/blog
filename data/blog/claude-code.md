---
title: claude code 国内使用注意事项
date: '2026-03-26'
tags:
  - claude code
draft: false
summary: 在国内如何稳定使用 Claude Code 的完整指南，涵盖网络环境搭建、sing-box 配置与订阅购买。
---

去年 11 月换了新公司之后，没有了 AI 工具的使用限制，我开始尝试 Claude Code、GitHub Copilot 等工具来提升工作效率。

Copilot 没什么特别要说的，我用国内银行开的万事达卡购买了 Pro+ 会员，整体体验不错（Claude 模型时有时无，这点需要接受）。这里先分享一下我在项目中使用的 Copilot 提示词模板。

````markdown
# copilot-instructions

## 一、项目上下文

### 项目简介（示例）

xxxx 是 yyyy，主要功能是 zzzz。

### 技术栈（示例）

- **框架**：Next.js 15 (App Router, RSC)
- **语言**：TypeScript 严格模式（`strict: true`）
- **UI 组件库**：shadcn/ui (new-york style) + Radix UI + Tailwind CSS v4
- **状态管理**：React 内置状态 + `useChat` hook (`@ai-sdk/react`)
- **路由**：Next.js App Router (`app/` 目录)
- **构建**：Next.js 内置 (Turbopack dev)
- **Lint/格式化**：ESLint (next/core-web-vitals + next/typescript)
- **包管理器**：pnpm
- **工具库**：
  - `react-resizable-panels` — 可拖拽调整大小的面板

### 目录结构

```text

```

### 关键架构细节

1. xxx
2. yyy

### 编码约定（示例）

- 使用项目根目录别名 `@/*`。
- 使用 Tailwind utility classes 和 `cn()` 合并 class。
- 使用函数组件和 hooks，不使用 class 组件。
- 使用 `async/await`，不使用 `.then()` 链。
- 导入顺序：React/Next → 第三方库 → 本地模块 → 类型。

### Commit 规范

遵循 Conventional Commits：`type(scope): description`

- **type**：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `build` / `ci` / `chore` / `revert`
- **scope**：`layout` / `chat` / `vnc` / `event-store` / `debug-panel` / `tool-viz` / `api` / `components` / `types` / `utils` / `config`
- 允许使用中文 commit message。

### 语言偏好

- 变量名、函数名、类型名：英文
- 代码注释：英文
- 与用户对话：中文

---

## 二、禁止事项

- 不使用 `any`，改用 `unknown` 或明确类型。
- 不使用 `moment`，改用 `dayjs`；不使用 `lodash`，改用 `lodash-es`。
- 未经用户明确要求，不引入新的第三方依赖。
- 未经明确要求，不生成 changelog、总结文档或交接文档。
- 不移除现有功能，VNC、聊天和流式传输必须保持可用。
- 不破坏现有 `POST /api/chat` 的请求与响应契约。

---

## 三、行为准则

### 编码前先思考

- 明确说明假设。
- 如果存在多种解释，不要默默选择，直接列出。
- 如果有更简单的方法，直接指出。
- 如果关键点不清楚，先停下来确认。

### 保持简洁

- 用最少的必要代码解决问题。
- 避免推测性抽象和不必要的灵活性。

### 精准修改

- 只修改必要部分。
- 保持现有代码风格。
- 如果改动导致某些导入、变量或函数不再使用，顺手删除。
- 每一行改动都必须直接服务于当前任务。

### 自行验证

- 回读修改后的代码，确认逻辑完整。
- 检查类型是否正确，确保没有隐式 `any`。
- 多步骤任务按步骤完成并逐步验证。
- 修 bug 时先理解根因，再验证原始场景已被覆盖。
````

---

接下来是重头戏——如何在国内尽可能平稳地使用 Claude Code。

刚开始时，推特上很多人反映 Claude 封号严重，所以我直接选择了中转站。优点是相对稳定、有售后兜底，缺点是价格偏贵，单日中重度使用时，花费大约要两百元人民币。

使用了约三个月后，我重新研究了推特上的一些教程和讨论，决定尝试自己搭建方案。

## 前期参考资料

有位博主写了非常详细的步骤，但链接暂时找不到了，后续补充。

---

## 我的方案

### 前置条件

| 类型 | 说明                                      |
| ---- | ----------------------------------------- |
| 网络 | 可用机场 + 静态 ISP 代理                  |
| 支付 | 国内银行开的万事达卡                      |
| 账号 | 美区 Apple ID                             |
| 硬件 | 2019 款 Intel 芯片 MacBook Pro            |
| 软件 | iTerm2 + 指纹浏览器（AdsPower）+ sing-box |

### 目标网络链路

```
本机
  ↓
sing-box（统一代理出口，监听 7890）
  ↓
机场节点（翻墙 + obfs 混淆）
  ↓
静态 ISP 代理（美国住宅 IP 出口）
  ↓
目标网站（Claude、GitHub 等）
```

这样做的目的是让 Claude 识别到的来源 IP 是干净的美国家庭住宅 IP，而非数据中心 IP，从而降低封号风险。

---

## 逐步配置

### 第一步：准备机场节点

大家一般都有自己的机场，香港、日本节点延迟较低，能用即可。

### 第二步：购买静态 ISP 代理

静态 ISP 代理的作用是伪装出口 IP，让 Claude 认为你是美国的家庭宽带用户。我使用的是 [blurpath](https://dashboard.blurpath.com/register?invitation_code=13iwf6bd0s)，体验不错，美国 IP 每月约 6 美元，支持信用卡支付。（不想走邀请链接的话，直接访问 [blurpath.com](https://dashboard.blurpath.com/register) 注册即可）

### 第三步：配置美区 Apple ID

可以在闲鱼购买，也可以直接将现有账号的归属地从中国改为美国，具体步骤网上教程很多。

### 第四步：安装 sing-box 和 obfs-local

推荐使用 Homebrew 安装：

```bash
brew install sing-box
brew install obfs4proxy  # 提供 obfs-local 插件
```

### 第五步：配置 sing-box

在 `~/sing-box/config.json` 中写入以下内容（将占位符替换为你的实际配置）：

```json
{
  "log": {
    "level": "info"
  },
  "inbounds": [
    {
      "type": "mixed",
      "tag": "in",
      "listen": "127.0.0.1",
      "listen_port": 7890,
      "sniff": true,
      "sniff_override_destination": true
    }
  ],
  "outbounds": [
    {
      "type": "direct",
      "tag": "direct"
    },
    {
      "type": "shadowsocks",
      "tag": "airport",
      "server": "机场节点 IP，如 1.1.1.1",
      "server_port": 机场节点端口,
      "method": "机场节点加密方式",
      "password": "机场节点密码",
      "plugin": "obfs-local",
      "plugin_opts": "obfs=http;obfs-host=84Ynf0aa6L.microsoft.com"
    },
    {
      "type": "socks",
      "tag": "residential",
      "server": "静态 ISP 代理 IP",
      "server_port": 静态 ISP 代理端口,
      "version": "5",
      "username": "用户名",
      "password": "密码",
      "detour": "airport"
    }
  ],
  "route": {
    "final": "residential"
  }
}
```

### 第六步：启动 sing-box

```bash
sudo sing-box run -c ~/sing-box/config.json
```

启动成功后，你会看到类似如下的日志：

```
INFO[0000] network: updated default interface en0, index 6
INFO[0000] inbound/mixed[in]: tcp server started at 127.0.0.1:7890
INFO[0000] sing-box started (0.00s)
```

### 第七步：配置终端代理

将以下内容追加到 `~/.zshrc` 和 `~/.bash_profile`，使终端中的 Claude Code 请求全部走代理：

```bash
export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
export all_proxy="socks5://127.0.0.1:7890"
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"
export ALL_PROXY="socks5://127.0.0.1:7890"
```

修改后执行 `source ~/.zshrc` 使配置生效。

### 第八步：配置指纹浏览器

打开 AdsPower，新建一个浏览器配置，将代理信息填写为：

```
协议：SOCKS5
地址：127.0.0.1
端口：7890
```

---

## 验证网络环境

**1. 验证终端网络**

```bash
curl -I https://www.google.com
```

返回 `HTTP/2 200` 说明可以正常访问。

```bash
curl ipinfo.io
```

输出中 `"country": "US"` 且 IP 为你购买的静态 ISP 代理 IP，说明终端出口已正确伪装。

**2. 验证浏览器网络**

在指纹浏览器中访问 `https://ippure.com`，确认：

- **IP 属性**：住宅 IP
- **IPPure 系数**：小于 15

两项均满足，说明浏览器的网络环境也已配置完毕。

---

## 购买 Claude 订阅

由于国内万事达卡无法直接绑定美区 Apple ID 作为支付方式，推荐使用 Apple 官方礼品卡充值：

1. 通过 Apple 官网购买礼品卡并充值到账户余额
2. 在 iPhone 或 iPad 上下载 Claude 客户端
3. 直接在 App 内购买 Pro 或 Max 套餐（价格会比官网略高，这是 Apple 收取的渠道费）

---

## 日常使用建议

- **终端**：使用 Claude Code，所有请求走 sing-box 代理
- **浏览器**：通过指纹浏览器访问 Claude 官网网页版

理论上，通过 App Store 内购的订阅费用即使遭遇封号，苹果也会将余额退回 Apple ID 账户，风险相对可控。

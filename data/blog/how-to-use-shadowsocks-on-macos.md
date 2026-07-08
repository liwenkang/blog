---
title: 如何在 macOS 上使用从 iPhone 导出的 Shadowsocks 地址
date: '2026-03-23'
tags:
  - 工具
  - Shadowsocks
  - macOS
draft: false
summary: 介绍如何将 iPhone 上导出的 Shadowsocks 地址（ss:// 链接或二维码）导入到 macOS 上的 ShadowsocksX-NG 客户端中使用。
---

## 背景

很多朋友在 iPhone 上使用 Shadowrocket 等客户端管理代理节点，当换到 Mac 时希望把已有的节点迁移过来。本文介绍几种常见的做法。

## Shadowsocks URL 的标准格式

Shadowsocks 的标准分享链接格式如下：

```
ss://<BASE64(method:password)>@<hostname>:<port>[/?plugin=<plugin_opts>][#<tag>]
```

例如：

```
ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ=@192.168.1.1:8388#MyServer
```

其中 `YWVzLTI1Ni1nY206cGFzc3dvcmQ=` 是 `aes-256-gcm:password` 的 Base64 编码。

> **注意**：如果你的链接以 `socks://` 开头（而不是 `ss://`），说明该链接使用了 SOCKS5 协议，并非 Shadowsocks 协议，两者不能直接互换。请确认你的链接类型，或向节点提供方索取正确格式的 Shadowsocks 链接。

## 方法一：直接导入 ss:// 链接

如果你手上的链接格式为 `ss://...`，可以直接在 ShadowsocksX-NG 中导入：

1. 打开 **ShadowsocksX-NG**，点击菜单栏中的纸飞机图标。
2. 选择 **服务器** → **从剪贴板导入 URL**（Import Servers from URL）。
3. 将 `ss://` 链接粘贴进去，点击确认即可。

## 方法二：使用二维码扫描（推荐）

这是最简单的方式，无需手动复制长字符串：

### iPhone 端（以 Shadowrocket 为例）

1. 打开 Shadowrocket，进入服务器列表。
2. 长按要分享的节点，选择 **分享** → **二维码**，此时屏幕上会显示一个二维码。

### macOS 端（ShadowsocksX-NG）

1. 将 iPhone 屏幕上的二维码截图，保存到 Mac。
2. 打开 **ShadowsocksX-NG**，点击菜单栏的纸飞机图标。
3. 选择 **服务器** → **从屏幕扫描二维码**（Scan QR Code from Screen）。
4. ShadowsocksX-NG 会自动识别屏幕上（或截图文件中）的二维码并导入服务器信息。

> **提示**：如果二维码识别不到，可以把截图拖入某个图片查看器全屏显示后再扫描，或用手机显示二维码对准 Mac 摄像头。

## 方法三：手动添加服务器

如果你只知道服务器的各项参数（地址、端口、密码、加密方式），也可以手动填写：

1. 打开 **ShadowsocksX-NG**，点击 **服务器** → **服务器偏好设置**（Server Preferences）。
2. 点击左下角 **+** 按钮，新建一个服务器。
3. 依次填写：
   - **地址（Address）**：服务器 IP 或域名
   - **端口（Port）**：服务器端口
   - **加密方式（Encryption）**：如 `aes-256-gcm`、`chacha20-ietf-poly1305` 等
   - **密码（Password）**：连接密码
4. 点击 **OK** 保存，然后在菜单中选择该服务器并开启代理即可。

## 关于 `dialer-proxy` 参数

部分 iOS 客户端（如 Surge、sing-box 等）导出的链接中包含 `dialer-proxy=` 参数，这是用来指定出站连接所使用的代理，属于客户端自定义扩展字段。**ShadowsocksX-NG 不支持该参数**，导入时会忽略它。如果你的链接带有此参数，只需去掉它或直接导入，服务器本身的连接信息（地址、端口、密码、加密方式）仍然有效。

## 常见问题

**Q：导入后连不上服务器怎么办？**

- 确认加密方式与服务器端一致。
- 检查防火墙或网络是否限制了该端口。
- 尝试切换代理模式（自动代理模式 / 全局模式）。

**Q：ShadowsocksX-NG 在哪里下载？**

可以从其 [GitHub Release 页面](https://github.com/shadowsocks/ShadowsocksX-NG/releases) 下载最新版本。

**Q：macOS 上有没有其他推荐客户端？**

除 ShadowsocksX-NG 外，还可以考虑：

- [ClashX](https://github.com/yichengchen/clashX)：支持更多协议和规则
- [Surge for Mac](https://nssurge.com/)：功能强大的商业软件
- [Mihomo Party](https://github.com/mihomo-party-org/mihomo-party)：基于 Mihomo 内核的开源客户端

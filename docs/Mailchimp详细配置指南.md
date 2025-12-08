# Mailchimp 详细设置指南

## 🎯 目标

使用 Mailchimp 免费方案为你的博客设置邮件订阅功能。

---

## 📋 第一部分：Mailchimp 账户设置

### 步骤 1: 注册账户

1. 访问 [Mailchimp 官网](https://mailchimp.com/)
2. 点击 **Sign Up** 按钮
3. 填写邮箱、用户名、密码
4. 勾选同意条款
5. 点击 **Sign up**
6. 验证邮箱（检查邮件收件箱）

### 步骤 2: 创建 Audience (邮件列表)

> **Audience** = 邮件列表，用于存储订阅者

#### 方式 A: 从仪表板创建

1. 登录 Mailchimp 账户
2. 点击左侧菜单 **Audience**
3. 看到弹窗："Looks like you don't have an audience yet"
4. 点击 **Create Audience**

#### 方式 B: 菜单创建

1. 左侧菜单 → **Audience** → **All Contacts**
2. 点击 **Create Audience** 按钮

#### 填写 Audience 信息

| 字段                           | 填写说明                                     |
| ------------------------------ | -------------------------------------------- |
| **Audience name**              | 填写：`Blog Subscribers` 或你喜欢的名称      |
| **Company name**               | 填写：你的网站名称或公司名                   |
| **Default from email address** | 填写：你的联系邮箱                           |
| **Default from name**          | 填写：你的名字或网站名称                     |
| **Reminder text**              | 可选填写：`You signed up for our newsletter` |

点击 **Create audience**

### 步骤 3: 获取 Audience ID

1. 进入刚创建的 Audience
2. 点击 **Audience** 菜单 → **Settings**
3. 滚动到页面底部，找到 **Audience ID**
4. 复制这个 ID（格式：`abc123def456`）

![位置示意] 你会看到类似：

```
Audience ID: abc123def456
```

---

## 🔐 第二部分：获取 API 凭证

### 步骤 4: 获取 API Key

#### 找到 API Keys 设置

1. 点击右上角你的 **头像**
2. 选择 **Account & Billing**
3. 点击菜单栏中的 **Extras** → **API keys**

#### 创建 API Key

1. 你会看到 "Your API keys" 部分
2. 点击 **Create Key** 按钮
3. 输入密钥名称（可选），例如：`Blog Subscription`
4. 点击 **Generate** 按钮

#### 复制 API Key

你会看到一个很长的密钥，格式：

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us1
```

- **复制整个密钥**（包括最后的 `-us1`）
- `-us1` 是服务器代码

### 步骤 5: 提取服务器代码

从 API Key 的最后部分提取服务器代码：

```
API Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us1
                                         ↓
                                   Server: us1
```

**常见的服务器代码**：

- `us1`, `us2`, `us3` (美国)
- `eu1`, `eu2` (欧洲)
- `ca1` (加拿大)
- `cn1` (中国)

---

## 🌐 第三部分：项目配置

### 步骤 6: 配置环境变量

编辑项目根目录的 `.env` 文件：

```env
# Mailchimp Newsletter
MAILCHIMP_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us1
MAILCHIMP_API_SERVER=us1
MAILCHIMP_AUDIENCE_ID=abc123def456
```

**替换为你的实际值**：

- `MAILCHIMP_API_KEY`: 从第4步获取的完整 API Key
- `MAILCHIMP_API_SERVER`: API Key 最后的服务器代码
- `MAILCHIMP_AUDIENCE_ID`: 从第3步获取的 Audience ID

### 步骤 7: 启用在 siteMetadata.js

编辑 `data/siteMetadata.js`：

找到：

```javascript
newsletter: {
  provider: '',  // 现在是空的
},
```

改为：

```javascript
newsletter: {
  provider: 'mailchimp',  // ← 改为 mailchimp
},
```

### 步骤 8: 重启开发服务器

```bash
# 如果已运行，先停止（Ctrl+C）
npm run dev
```

---

## ✅ 第四部分：测试功能

### 步骤 9: 访问网站并测试

1. 打开浏览器访问 `http://localhost:3000`
2. 滚动到页面底部
3. 找到 "Subscribe to the newsletter" 表单
4. 输入一个测试邮箱地址（可以是你的邮箱）
5. 点击 "Sign up" 按钮

### 步骤 10: 验证订阅成功

**成功表现**：

- ✅ 页面显示：`"Successfully! 🎉 You are now subscribed."`
- ✅ 输入框变成灰色，显示：`"You're subscribed ! 🎉"`
- ✅ 按钮变为：`"Thank you!"`

**检查 Mailchimp**：

1. 登录 Mailchimp
2. 进入 **Audience** → **All contacts**
3. 应该能看到你的测试邮箱，状态为 **"Subscribed"**

---

## 🚀 第五部分：可选配置

### 设置欢迎邮件（重要！）

当有人订阅时，自动发送欢迎邮件。

#### 启用欢迎邮件

1. 进入 Audience
2. 点击 **Automations** 菜单
3. 点击 **Welcome series** 或 **Create automation**
4. 选择 **Automated welcome email**
5. 按照向导设置：
   - **Send to**: New subscribers
   - **Timing**: Immediately 或 1 day after
   - **Email subject**: 例如 `Welcome to [Your Blog Name]!`
   - **Email content**: 可以自定义邮件内容

#### 自定义欢迎邮件

1. 在自动化邮件的**编辑**中自定义内容
2. 添加：
   - 欢迎语
   - 博客简介
   - 最新文章链接
   - 社交媒体链接
   - 退订选项

### 配置发件人信息

1. 进入 Audience
2. 点击 **Settings** → **Notifications**
3. 修改：
   - **From name**: 你的名字或网站名称
   - **From email**: 用于发送邮件的邮箱
   - **Reply-to email**: 订阅者回复的邮箱

---

## 📊 第六部分：查看订阅者数据

### 查看订阅者列表

1. **Audience** → **All contacts**
2. 你会看到所有订阅者的列表，包括：
   - 邮箱地址
   - 订阅日期
   - 订阅状态
   - 最后活动时间

### 查看统计信息

1. **Dashboard** → 看到总体统计
2. **Audience** → **Growth** 查看增长趋势
3. **Reports** → **Campaign** 查看邮件活动

### 导出订阅者列表

1. **All contacts** → 点击 **Export**
2. 选择导出格式（CSV、Excel）
3. 点击 **Download**

---

## 🚨 常见问题排查

### 问: 显示 "Invalid email"？

**答**:

- 检查邮箱格式是否正确
- 检查是否已在列表中订阅过
- 等待几秒后重试

### 问: 显示 "API error"？

**答**:

1. 检查 `.env` 中的凭证是否正确无空格
2. 确认 Audience ID 是否存在
3. 检查 API Key 是否过期（重新生成）
4. 查看浏览器控制台（F12 → Console）的错误信息

### 问: 订阅后没收到邮件？

**答**:

1. 检查邮箱垃圾箱
2. 在 Mailchimp 中检查是否启用了欢迎邮件
3. 检查发件人邮箱是否正确配置

### 问: 环境变量修改后不生效？

**答**:

1. 完全停止开发服务器（Ctrl+C）
2. 重新运行 `npm run dev`
3. 清除浏览器缓存

---

## 📱 生产环境部署

### 在 Vercel 部署

1. 登录 [Vercel 控制面板](https://vercel.com/dashboard)
2. 选择你的项目
3. **Settings** → **Environment Variables**
4. 添加三个变量：
   ```
   MAILCHIMP_API_KEY = a1b2c3d4e5f6...
   MAILCHIMP_API_SERVER = us1
   MAILCHIMP_AUDIENCE_ID = abc123def456
   ```
5. 点击 **Save**
6. 重新部署项目

### 验证生产环境

1. 访问你的生产网址
2. 测试邮件订阅功能
3. 检查 Mailchimp 中是否收到新订阅

---

## 🎓 学习资源

- [Mailchimp 官方文档](https://mailchimp.com/help/)
- [Mailchimp API 文档](https://mailchimp.com/developer/marketing/api/)
- [本项目邮件订阅文档](./邮件订阅配置指南.md)

---

## ✨ 下一步建议

1. ✅ **完成 Mailchimp 设置**
2. ✅ **本地测试邮件订阅**
3. ✅ **设置欢迎邮件自动化**
4. ✅ **部署到生产环境**
5. ✅ **在生产环境再次测试**
6. 📊 **分析订阅者数据**
7. 📧 **定期发送通讯邮件**

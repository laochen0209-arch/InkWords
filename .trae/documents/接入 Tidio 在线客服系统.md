## 接入 Tidio 在线客服系统

### 步骤 1: 准备工作（需要用户配合）
1. 访问 https://www.tidio.com/ 注册账号
2. 创建项目，获取 Widget 代码中的 Public Key
3. 在 Tidio 后台配置客服欢迎语、自动回复等

### 步骤 2: 代码修改

**文件 1: app/settings/help/page.tsx**
- 移除 alert 弹窗
- 点击"联系客服"按钮时调用 `tidioChatApi.open()` 打开聊天窗口
- 添加按钮加载状态

**文件 2: app/layout.tsx 或创建 TidioProvider 组件**
- 添加 Tidio Widget 脚本
- 使用环境变量存储 Tidio Public Key

**文件 3: .env.local**
- 添加 `NEXT_PUBLIC_TIDIO_PUBLIC_KEY=xxx`

### 步骤 3: 样式配置
- 在 Tidio 后台配置主题色为 `#C23E32`（与应用主色一致）
- 设置聊天窗口语言为中文

### 预期效果
- 用户点击"联系客服"按钮直接打开聊天窗口
- 无需跳转页面，体验流畅
- 支持实时消息、离线留言、文件发送等功能
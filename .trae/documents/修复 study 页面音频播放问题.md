## 修复计划

### 问题分析
从日志可以看到语音被触发但立即被中断。根本原因是：

1. **Chrome speechSynthesis bug** - 需要用户交互后才能正常工作
2. **多个组件同时操作 speechSynthesis** - 导致互相干扰
3. **interactive-paragraph.tsx 缺少语音预加载**
4. **cancel() 调用时机问题**

### 修复内容

#### 1. 创建全局语音管理器
创建一个单例模式管理语音播放，避免多个组件互相干扰。

#### 2. 修复 interactive-paragraph.tsx
- 添加语音预加载
- 添加错误处理
- 使用全局管理器

#### 3. 修复 library 页面的 speak 函数
- 使用延迟执行确保在用户交互上下文中
- 添加重试机制

#### 4. 修复 study 页面
- 同样使用延迟执行

### 关键修复点
- 使用 `setTimeout(..., 0)` 确保在事件循环中执行
- 添加 `speechSynthesis.resume()` 唤醒 Chrome 的语音合成
- 首次播放时可能需要两次尝试（Chrome bug）

请确认这个修复方案后，我将开始实施具体的代码修改。
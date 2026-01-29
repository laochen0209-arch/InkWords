## 优化计划

### 1. UI 和排版优化

**Header 区域：**
- 重新设计布局，更紧凑美观
- 使用 Flexbox 对齐
- 添加响应式设计

**内容区域：**
- 雷达图：添加更好的标题和说明
- 功能卡片：统一样式，添加悬停效果
- 网格布局优化

### 2. 左上角切换按钮交互修复

**当前问题：**
- 只更新本地状态，不更新 URL
- 没有与 TargetSelector 同步

**修复方案：**
- 使用 useSearchParams 获取 URL type 参数
- 根据 type 自动确定语言轨道
- 切换时更新 URL
- 确保 TargetSelector 显示正确选项

### 3. 语言逻辑修复

**正确逻辑：**
1. 从 URL 获取 type 参数
2. 根据 type 确定语言轨道：
   - IELTS/TOEFL/CET-4/CET-6 → English
   - HSK/BCT/TOCFL → Chinese
3. 显示对应功能入口
4. 点击时将 type 参数传递到下一页

### 修改文件
- app/practice/page.tsx
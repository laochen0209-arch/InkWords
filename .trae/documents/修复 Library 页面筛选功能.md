## 问题总结

### 1. FilterSheet Props 不匹配
- 组件定义了 `onFilterChange` prop，但调用时传递了未定义的 `nativeLang` prop
- 筛选状态变化没有通知父组件更新数据

### 2. 筛选功能未集成到数据获取
- FilterSheet 更新了 URL 参数，但 LibraryList 没有读取这些参数
- API 调用没有传递 category 和 readStatus 参数

### 3. "阅读状态"筛选未实现
- API 端点没有处理 readStatus 参数
- 数据库中没有用户的阅读状态记录

### 4. LibraryList 内部筛选与 URL 参数不同步
- LibraryList 有自己的 activeTab 状态，没有与 URL 同步

## 修复计划

### 文件 1: components/library/filter-sheet.tsx
- 移除未使用的 `onFilterChange` prop
- 添加 `nativeLang` prop 到组件定义

### 文件 2: app/library/page.tsx
- 读取 URL 的 category 和 readStatus 参数
- 将筛选参数传递给 API 调用
- 修复 FilterSheet 的 props 传递
- 添加筛选状态变化时重新获取数据的逻辑

### 文件 3: components/library/library-list.tsx
- 从 props 接收筛选参数
- 移除内部的 activeTab 状态，使用传入的筛选参数
- 根据传入参数过滤文章

### 文件 4: app/api/articles/route.ts
- 添加 readStatus 参数处理（如果数据库支持）
- 或者暂时移除前端界面的阅读状态筛选

请确认此计划后，我将立即实施修复。
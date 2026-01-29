## 问题诊断

发现了以下关键问题导致 /study 页面无法正常显示内容：

### 问题 1：数据库 Schema 默认值与查询值不匹配
- Schema 中 `category` 默认值为 `"daily"`（小写）
- 但 API 查询使用的是 `"Daily Life"`（首字母大写）
- 这导致查询条件不匹配，返回空结果

### 问题 2：API 分类映射逻辑有缺陷
- 第 93 行的 fallback 逻辑 `categoryParam.toLowerCase()` 会将 `"Daily Life"` 变成 `"daily life"`，与数据库 `"daily"` 不匹配

### 问题 3：前端状态管理问题
- `selectedCategory` 存储的是中文标签（如"日常"）
- 但分类按钮的激活状态判断使用 `selectedCategory === category.label`
- 需要确保前后端分类值的一致性

### 问题 4：调试信息不足
- 需要添加更多日志来确认实际的数据库值

## 修复步骤

### 1. 修复 API 路由 (app/api/study/data/route.ts)
- 修改 CATEGORY_MAP 以匹配数据库实际值
- 修复 fallback 逻辑
- 添加调试日志显示实际查询的分类值

### 2. 修复前端页面 (app/study/page.tsx)
- 确保分类映射一致性
- 添加调试日志追踪数据流
- 检查 `isCategoryCompleted` 逻辑是否正确

### 3. 验证修复
- 检查浏览器控制台日志
- 确认 API 返回的数据
- 验证内容是否正确显示
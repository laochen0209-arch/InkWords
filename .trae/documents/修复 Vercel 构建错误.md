## 问题分析

Vercel 构建日志显示以下错误：

1. **Module not found: Can't resolve '@/lib/email'**
   - 文件存在，可能是大小写敏感问题

2. **Module not found: Can't resolve '@supabase/ssr'**
   - 依赖已在 package.json 中，可能需要重新安装

3. **Module not found: Can't resolve 'stripe'**
   - 依赖已在 package.json 中，可能需要重新安装

## 修复步骤

### 步骤 1: 修复 lib/api/client.ts
- 当前使用 `import { createBrowserClient } from '@supabase/ssr'`
- 应改为使用项目统一的 `import { createBrowserClient } from '@/lib/supabase/client'`
- 这样可以避免 @supabase/ssr 浏览器客户端的兼容性问题

### 步骤 2: 验证依赖安装
- 运行 `npm install` 确保所有依赖正确安装
- 检查 node_modules 中是否存在 @supabase/ssr 和 stripe

### 步骤 3: 本地构建测试
- 运行 `npm run build` 验证本地构建是否成功
- 确保没有模块找不到的错误

### 步骤 4: 重新部署到 Vercel
- 推送代码到 Git
- 在 Vercel 重新部署

## 需要修改的文件

1. `lib/api/client.ts` - 修改 import 路径，使用项目统一的 supabase client

请确认此计划后，我将开始执行修复。
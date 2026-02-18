## 修复计划（不修改 UI 前端）

### 🔴 关键修复项

#### 1. **集成错误监控** - 修改 `components/error-boundary.tsx`
- 添加 Sentry 集成
- 捕获并上报生产环境错误
- 不修改 UI 显示

#### 2. **添加 API 限流** - 创建 `middleware.ts`
- 创建 Next.js Middleware 文件
- 实现基于 IP 的速率限制
- 保护 API 路由免受滥用

#### 3. **SEO 文件**
- 创建 `public/robots.txt` - 搜索引擎规则
- 创建 `public/sitemap.xml` - 站点地图
- 创建 `public/manifest.json` - PWA 配置

#### 4. **完善 favicon**
- 检查现有 favicon 配置
- 添加完整的 favicon 链接

#### 5. **更新 README.md**
- 添加项目介绍
- 添加部署说明

### 🚫 不修改的内容
- 不修改任何组件的 UI/样式
- 不修改页面布局
- 不修改颜色、字体等视觉元素
- 只添加功能性代码

### 执行顺序
1. 创建 middleware.ts（API 限流）
2. 集成 Sentry（错误监控）
3. 创建 SEO 文件（robots.txt, sitemap.xml, manifest.json）
4. 检查并完善 favicon
5. 更新 README.md
6. 验证所有修复

请确认此计划后，我将立即执行修复。
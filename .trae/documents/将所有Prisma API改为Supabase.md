## 问题诊断
Prisma 无法连接到 Supabase 数据库（连接超时），导致所有使用 Prisma 的 API 都无法获取数据。

## 解决方案
将所有使用 Prisma 的 API 路由改为使用 Supabase 客户端：

### 需要修改的 API 路由：
1. `/app/api/articles/route.ts` - 获取文章列表
2. `/app/api/user/me/route.ts` - 获取用户信息
3. `/app/api/register/route.ts` - 用户注册
4. `/app/api/checkin/route.ts` - 签到功能
5. `/app/api/send-code/route.ts` - 发送验证码
6. `/app/api/study/progress/route.ts` - 学习进度

### 修改步骤：
1. 将 `import prisma from '@/lib/prisma'` 改为 `import { createServerClient } from '@/lib/supabase/server'`
2. 将 Prisma 查询改为 Supabase 查询
3. 确保表名使用小写 snake_case

### 执行顺序：
1. 先修改 `/app/api/articles/route.ts`（影响图书馆页面）
2. 修改 `/app/api/user/me/route.ts`（影响首页和签到）
3. 其他 API 根据优先级修改
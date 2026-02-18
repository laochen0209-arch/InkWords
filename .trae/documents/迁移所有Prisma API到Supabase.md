## 问题诊断
Prisma 无法连接到数据库，导致 11 个 API 无法正常工作。需要将所有 Prisma API 迁移到 Supabase。

## 需要迁移的 API（按优先级）

### 高优先级（影响核心功能）：
1. `/app/api/register/route.ts` - 用户注册
2. `/app/api/send-code/route.ts` - 发送验证码
3. `/app/api/study/progress/route.ts` - 学习进度

### 中优先级：
4. `/app/api/practice/submit/route.ts` - 提交练习
5. `/app/api/practice/result/[id]/route.ts` - 获取练习结果
6. `/app/api/vocabulary/data/route.ts` - 词汇数据

### 低优先级：
7. `/app/api/daily/update/route.ts` - 每日更新
8. `/app/api/crawler/test/route.ts` - 爬虫测试
9. `/app/api/crawler/schedule/route.ts` - 爬虫调度
10. `/app/api/crawler/run/route.ts` - 爬虫运行

## 执行步骤：
1. 逐个读取 Prisma API 文件
2. 将 Prisma 查询改为 Supabase 查询
3. 确保表名使用小写 snake_case
4. 测试每个 API 是否正常工作
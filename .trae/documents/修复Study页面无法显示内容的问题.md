## 问题分析

1. **Prisma客户端未更新**：虽然修改了schema.prisma文件，但Prisma客户端没有重新生成，导致API调用`prisma.studyWord`和`prisma.studySentence`时报错
2. **数据库表未创建**：StudyWord和StudySentence表没有在数据库中创建

## 修复步骤

### 1. 重新生成Prisma客户端
运行 `npx prisma generate` 生成包含新模型的客户端代码

### 2. 推送数据库结构
运行 `npx prisma db push` 将新模型同步到数据库

### 3. 检查API错误处理
确保API有正确的错误捕获和日志输出，方便调试

### 4. 验证修复
检查页面是否能正常获取和显示数据

## 需要执行的命令
1. `npx prisma generate` - 生成Prisma客户端
2. `npx prisma db push` - 推送数据库结构

## 需要检查的文件
- `app/api/study/data/route.ts` - 确保API调用正确
- `lib/generated/prisma/index.d.ts` - 验证新模型已生成
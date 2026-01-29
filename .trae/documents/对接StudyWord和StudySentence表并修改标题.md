## 计划概述
将/study页面从使用Vocabulary和Sentence表，切换到使用StudyWord和StudySentence表，并修改页面标题。

## 具体步骤

### 1. 更新Prisma Schema
添加StudyWord和StudySentence模型：
- `StudyWord` 表：id, chinese, english, pinyin, example, category, createdAt, updatedAt
- `StudySentence` 表：id, contentZh, contentEn, pinyin, category, createdAt, updatedAt

### 2. 更新API端点
修改 `app/api/study/data/route.ts`：
- 将 `prisma.vocabulary` 改为 `prisma.studyWord`
- 将 `prisma.sentence` 改为 `prisma.studySentence`
- 更新字段映射（如果字段名不同）

### 3. 更新i18n翻译
修改 `lib/i18n.ts`：
- LEARN_ENGLISH 模式：将 practice.title 从 "修习" 改为 "词句练习"
- LEARN_CHINESE 模式：将 practice.title 从 "Practice" 改为 "Word & Sentence Practice"

### 4. 执行数据库迁移
运行 `npx prisma db push` 或创建迁移文件

## 需要修改的文件
1. `prisma/schema.prisma` - 添加新模型
2. `app/api/study/data/route.ts` - 更新数据库查询
3. `lib/i18n.ts` - 修改标题翻译

## 注意事项
- 需要确认StudyWord和StudySentence表的具体字段结构
- 执行数据库迁移前需要备份数据
- 修改后需要重新生成Prisma客户端
-- 创建 StudyWord 表
CREATE TABLE IF NOT EXISTS "StudyWord" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "StudyWord_category_idx" ON "StudyWord"("category");

-- 创建 StudySentence 表
CREATE TABLE IF NOT EXISTS "StudySentence" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "zh" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "StudySentence_category_idx" ON "StudySentence"("category");

-- 插入一些示例数据
INSERT INTO "StudyWord" ("id", "word", "meaning", "pronunciation", "example", "category") VALUES
('1', 'conversation', '对话，交谈', '/ˌkɒnvəˈseɪʃən/', 'I had a long conversation with my friend.', 'Lifestyle'),
('2', 'schedule', '日程安排', '/ˈʃedjuːl/', 'What is your schedule for tomorrow?', 'Professional'),
('3', 'environment', '环境', '/ɪnˈvaɪrənmənt/', 'We need to protect the environment.', 'Lifestyle')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "StudySentence" ("id", "zh", "en", "pinyin", "category") VALUES
('1', '你今天过得怎么样？', 'How was your day today?', 'Nǐ jīntiān guò de zěnme yàng?', 'Lifestyle'),
('2', '我们需要安排一个会议。', 'We need to schedule a meeting.', 'Wǒmen xūyào ānpái yí gè huìyì.', 'Professional'),
('3', '这个项目的截止日期是什么时候？', 'What is the deadline for this project?', 'Zhège xiàngmù de jiézhǐ rìqī shì shénme shíhou?', 'Professional')
ON CONFLICT ("id") DO NOTHING;

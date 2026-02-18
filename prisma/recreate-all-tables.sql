-- ============================================
-- 完整数据库重建脚本
-- 包含所有表结构和示例数据
-- 执行前请备份现有数据！
-- ============================================

-- 步骤 1: 清理所有旧表（按依赖顺序倒序删除）
DROP TABLE IF EXISTS "exam_results" CASCADE;
DROP TABLE IF EXISTS "mock_exams" CASCADE;
DROP TABLE IF EXISTS "user_progress" CASCADE;
DROP TABLE IF EXISTS "user_study_stats" CASCADE;
DROP TABLE IF EXISTS "check_ins" CASCADE;
DROP TABLE IF EXISTS "verification_codes" CASCADE;
DROP TABLE IF EXISTS "crawler_logs" CASCADE;
DROP TABLE IF EXISTS "crawler_configs" CASCADE;
DROP TABLE IF EXISTS "news" CASCADE;
DROP TABLE IF EXISTS "study_sentences" CASCADE;
DROP TABLE IF EXISTS "study_words" CASCADE;
DROP TABLE IF EXISTS "practice_logs" CASCADE;
DROP TABLE IF EXISTS "mistake_books" CASCADE;
DROP TABLE IF EXISTS "articles" CASCADE;
DROP TABLE IF EXISTS "sentences" CASCADE;
DROP TABLE IF EXISTS "vocabulary" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================
-- 步骤 2: 创建所有表（按依赖顺序正序创建）
-- 所有字段使用 snake_case 命名规范
-- ============================================

-- 1. users 表 - 用户基础信息
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_login_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 插入系统 guest 用户（用于未登录用户提交考试）
INSERT INTO "users" ("id", "email", "password", "name", "avatar", "points", "streak", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000000', 'guest@system.local', NULL, 'Guest User', NULL, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 2. vocabulary 表 - 词汇库
CREATE TABLE "vocabulary" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "english" TEXT NOT NULL,
    "chinese" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "example_en" TEXT NOT NULL,
    "example_zh" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL DEFAULT 'daily',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. sentences 表 - 句子库
CREATE TABLE "sentences" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "content_en" TEXT NOT NULL,
    "content_zh" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'daily',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. articles 表 - 文章库
CREATE TABLE "articles" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title_en" TEXT NOT NULL,
    "title_zh" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_zh" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. study_words 表 - 修习页面词汇
CREATE TABLE "study_words" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "example_zh" TEXT,
    "category" TEXT NOT NULL DEFAULT 'daily',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. study_sentences 表 - 修习页面句子
CREATE TABLE "study_sentences" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "zh" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'daily',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. news 表 - 新闻内容
CREATE TABLE "news" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT,
    "url" TEXT UNIQUE,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. practice_logs 表 - 练习记录
CREATE TABLE "practice_logs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. mistake_books 表 - 错题本
CREATE TABLE "mistake_books" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "exam_type" TEXT NOT NULL,
    "section_type" TEXT NOT NULL,
    "question_content" JSONB NOT NULL,
    "user_answer" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "analysis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. user_progress 表 - 用户学习进度
CREATE TABLE "user_progress" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "is_learned" BOOLEAN NOT NULL DEFAULT false,
    "learned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "category", "content_type", "content_id")
);

-- 11. user_study_stats 表 - 用户学习统计
CREATE TABLE "user_study_stats" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "words_learned" INTEGER NOT NULL DEFAULT 0,
    "sentences_learned" INTEGER NOT NULL DEFAULT 0,
    "total_learned" INTEGER NOT NULL DEFAULT 0,
    "study_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "date")
);

-- 12. check_ins 表 - 签到记录
CREATE TABLE "check_ins" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "date")
);

-- 13. verification_codes 表 - 邮箱验证码
CREATE TABLE "verification_codes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. crawler_logs 表 - 爬虫日志
CREATE TABLE "crawler_logs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "article_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. crawler_configs 表 - 爬虫配置
CREATE TABLE "crawler_configs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL UNIQUE,
    "url" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "interval" INTEGER NOT NULL DEFAULT 3600,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. mock_exams 表 - 模拟考试数据（drill 功能用）
CREATE TABLE "mock_exams" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "exam_type" TEXT NOT NULL DEFAULT 'drill',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "questions" JSONB,
    "rewritten_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. exam_results 表 - 考试结果（drill 功能用）
CREATE TABLE "exam_results" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "exam_type" TEXT NOT NULL DEFAULT 'drill',
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL DEFAULT 100,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ai_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 步骤 3: 创建索引
-- ============================================

-- users 相关索引
CREATE INDEX "users_email_idx" ON "users"("email");

-- vocabulary 相关索引
CREATE INDEX "vocabulary_english_idx" ON "vocabulary"("english");
CREATE INDEX "vocabulary_category_idx" ON "vocabulary"("category");

-- sentences 相关索引
CREATE INDEX "sentences_author_idx" ON "sentences"("author");
CREATE INDEX "sentences_category_idx" ON "sentences"("category");

-- articles 相关索引
CREATE INDEX "articles_category_idx" ON "articles"("category");

-- study_words 相关索引
CREATE INDEX "study_words_category_idx" ON "study_words"("category");

-- study_sentences 相关索引
CREATE INDEX "study_sentences_category_idx" ON "study_sentences"("category");

-- news 相关索引
CREATE INDEX "news_category_published_at_idx" ON "news"("category", "published_at");

-- practice_logs 相关索引
CREATE INDEX "practice_logs_user_id_idx" ON "practice_logs"("user_id");

-- mistake_books 相关索引
CREATE INDEX "mistake_books_user_id_idx" ON "mistake_books"("user_id");

-- user_progress 相关索引
CREATE INDEX "user_progress_user_id_category_content_type_idx" ON "user_progress"("user_id", "category", "content_type");
CREATE INDEX "user_progress_user_id_is_learned_idx" ON "user_progress"("user_id", "is_learned");

-- user_study_stats 相关索引
CREATE INDEX "user_study_stats_user_id_date_idx" ON "user_study_stats"("user_id", "date");

-- check_ins 相关索引
CREATE INDEX "check_ins_user_id_date_idx" ON "check_ins"("user_id", "date");

-- verification_codes 相关索引
CREATE INDEX "verification_codes_email_type_idx" ON "verification_codes"("email", "type");
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes"("expires_at");

-- crawler_logs 相关索引
CREATE INDEX "crawler_logs_source_status_idx" ON "crawler_logs"("source", "status");

-- exam_results 相关索引
CREATE INDEX "exam_results_user_id_idx" ON "exam_results"("user_id");

-- ============================================
-- 步骤 4: 插入示例数据
-- ============================================

-- 插入 vocabulary 数据 (20个)
INSERT INTO "vocabulary" ("id", "english", "chinese", "pinyin", "example_en", "example_zh", "difficulty", "category", "created_at", "updated_at") VALUES
('vocab-001', 'Serendipity', '不期而遇的美好', 'sè rén dì pí yù', 'Finding this book was pure serendipity.', '发现这本书纯属不期而遇的美好。', 4, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-002', 'Ephemeral', '转瞬即逝的', 'zhuǎn shùn jí shì de', 'Youth is ephemeral.', '青春是转瞬即逝的。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-003', 'Resilience', '韧性', 'rèn xìng', 'Her resilience inspired everyone.', '她的韧性激励了每个人。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-004', 'Eloquent', '雄辩的', 'xióng biàn de', 'He is an eloquent speaker.', '他是一位雄辩的演讲者。', 4, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-005', 'Mellifluous', '甜美的', 'tián měi de', 'She has a mellifluous voice.', '她有一个甜美的嗓音。', 4, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-006', 'Tranquility', '宁静', 'níng jìng', 'The tranquility of the lake was breathtaking.', '湖面的宁静令人叹为观止。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-007', 'Ethereal', '飘渺的', 'piāo miǎo de', 'The ethereal beauty of the sunset.', '日落的飘渺之美。', 4, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-008', 'Perseverance', '坚持不懈', 'jiān chí bù xiè', 'Perseverance leads to success.', '坚持不懈通向成功。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-009', 'Harmony', '和谐', 'hé xié', 'Living in harmony with nature.', '与自然和谐相处。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-010', 'Serenity', '宁静', 'níng jìng', 'Find serenity in meditation.', '在冥想中寻找宁静。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-011', 'Gratitude', '感恩', 'gǎn ēn', 'Express gratitude to others.', '向他人表达感恩。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-012', 'Compassion', '同情心', 'tóng qíng xīn', 'Show compassion to those in need.', '对需要帮助的人表示同情心。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-013', 'Authenticity', '真实性', 'zhēn shí xìng', 'Value authenticity in relationships.', '重视人际关系中的真实性。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-014', 'Mindfulness', '正念', 'zhèng niàn', 'Practice mindfulness daily.', '每天练习正念。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-015', 'Benevolence', '仁慈', 'rén cí', 'Act with benevolence toward all.', '对所有人都以仁慈之心对待。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-016', 'Curiosity', '好奇心', 'hào qí xīn', 'Maintain curiosity about the world.', '保持对世界的好奇心。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-017', 'Creativity', '创造力', 'chuàng zào lì', 'Unleash your creativity.', '释放你的创造力。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-018', 'Resilience', '适应力', 'shì yìng lì', 'Build resilience in adversity.', '在逆境中建立适应力。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-019', 'Integrity', '正直', 'zhèng zhí', 'Maintain integrity in all actions.', '在所有行动中保持正直。', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-020', 'Empathy', '同理心', 'tóng lǐ xīn', 'Practice empathy with others.', '与他人练习同理心。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入 sentences 数据 (10个)
INSERT INTO "sentences" ("id", "content_en", "content_zh", "pinyin", "author", "category", "created_at", "updated_at") VALUES
('sentence-001', 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.', '在一个不断试图让你成为别人的世界里，做你自己是最伟大的成就。', 'zài yī gè bú duàn shì tú ràng nǐ chéng wéi bié rén de shì jiè lǐ, zuò nǐ zì jǐ shì zuì wěi dà de chéng jiù', 'Ralph Waldo Emerson', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-002', 'The only way to do great work is to love what you do.', '做伟大工作的唯一方法是热爱你所做的事。', 'zuò wěi dà gōng zuò de wéi yī fāng fǎ shì rè ài nǐ suǒ zuò de shì', 'Steve Jobs', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-003', 'In the middle of difficulty lies opportunity.', '困难之中蕴藏着机会。', 'kùn nán zhī zhōng yùn cáng zhe jī huì', 'Albert Einstein', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-004', 'Life is what happens when you are busy making other plans.', '生活就是当你忙着制定其他计划时发生的事情。', 'shēng huó jiù shì dāng nǐ máng zhe zhì dìng qí tā jì huà shí fā shēng de shì qíng', 'John Lennon', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-005', 'The future belongs to those who believe in the beauty of their dreams.', '未来属于那些相信自己梦想之美的人。', 'wèi lái shǔ yú nà xiē xiāng xìn zì jǐ mèng xiǎng zhī měi de rén', 'Eleanor Roosevelt', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-006', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', '成功不是终点，失败也不是致命的：重要的是继续前进的勇气。', 'chéng gōng bù shì zhōng diǎn, shī bài yě bù shì zhì mìng de: zhòng yào de shì jì xù qián jìn de yǒng qì', 'Winston Churchill', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-007', 'The only thing we have to fear is fear itself.', '我们唯一需要恐惧的是恐惧本身。', 'wǒ men wéi yī xū yào kǒng jù de shì kǒng jù běn shēn', 'Franklin D. Roosevelt', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-008', 'Education is the most powerful weapon which you can use to change the world.', '教育是你可以用来改变世界的最强有力的武器。', 'jiào yù shì nǐ kě yǐ yòng lái gǎi biàn shì jiè de zuì qiáng yǒu lì de wǔ qì', 'Nelson Mandela', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-009', 'Be the change you wish to see in the world.', '成为你希望在世界中看到的变化。', 'chéng wéi nǐ xī wàng zài shì jiè zhōng kàn dào de biàn huà', 'Mahatma Gandhi', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-010', 'The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.', '世界上最美好、最珍贵的东西，看不见也摸不着——它们必须用心去感受。', 'shì jiè shàng zuì měi hǎo, zuì zhēn guì de dōng xī, kàn bù jiàn yě mō bù zháo - tā men bì xū yòng xīn qù gǎn shòu', 'Helen Keller', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入 articles 数据 (3篇)
INSERT INTO "articles" ("id", "title_en", "title_zh", "content_en", "content_zh", "category", "created_at", "updated_at") VALUES
('article-001', 'The Little Prince - Chapter 21', '小王子 - 第二十一章', 'It was then that the fox appeared.

"Good morning," said the fox.
"Good morning," the little prince responded politely.
And when he turned back to the wall, he saw the fox.

"I am here," said the fox, "under the apple tree."

The little prince looked at him. He did not look at all like a king who had conquered everything. He looked like a child.

"Who are you?" asked the little prince. "You are very pretty to look at."

"I am a fox," said the fox.

"Come and play with me," proposed the little prince. "I am so unhappy."

"I cannot play with you," said the fox. "I am not tamed."

"Ah! Excuse me," said the little prince.

But after some thought, he added:

"What does that mean - ''tamed''?"

"You do not live here," said the fox. "What do you look for?"

"I am looking for men," said the little prince. "What does that mean - ''tamed''?"

"Men," said the fox, "they have guns, and they hunt. It is very disturbing. They also raise chickens. These are their only interests. So you are looking for chickens?"

"No," said the little prince. "I am looking for friends. What does that mean - ''tamed''?"

"It is an act too often neglected," said the fox. "It means to establish ties."

"To establish ties?"

"That''s right," said the fox. "To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys. And I have no need of you. And you, on your side, have no need of me. To you, I am nothing more than a fox like a hundred thousand other foxes. But if you tame me, then we shall need each other. You will be to me the only boy in the world. And I shall be to you the only fox in the world."

"I am beginning to understand," said the little prince. "There is a flower... I think that she has tamed me..."

"That is possible," said the fox. "On the Earth, one sees or meets all sorts of things. But one does not see flowers everywhere. One walks in the desert, and one does not see flowers. One looks into the stars, and one does not see flowers. But a single flower somewhere shines for you. You love that flower. You water it... You protect it... You give it your life... That is why she shines."

"She is more important than all the hundreds of thousands of other roses?"

"Certainly. Because she is my rose."

"And because she is your rose that she is so important?"

"Because she is the one I have watered."

"Because she is the one I have put under glass."

"Because she is the one I have sheltered behind a screen."

"Because she is my rose."

"You have done well," said the fox. "Now go back to your garden. And come back tomorrow."

The next day the little prince came back.

"Goodbye," he said.

"Goodbye," said the fox. "And now here is my secret. It is very simple: one sees well only with the heart. What is essential is invisible to the eyes."

"What is essential is invisible to the eyes," the little prince repeated, so that he would be sure to remember.

"It is the time you have wasted for your rose that makes your rose so important."

"It is the time that I have wasted for my rose..." said the little prince, so that he would be sure to remember.

"Men have forgotten this truth," said the fox. "But you must not forget it. You become responsible, forever, for what you have tamed. You are responsible for your rose..."

"I am responsible for my rose..." the little prince repeated, so that he would be sure to remember.', 
'这时，狐狸出现了。

"早安，"狐狸说。
"早安，"小王子礼貌地回答。
当他转过头来看墙壁时，他看见了狐狸。

"我就在这里，"狐狸说，"在苹果树下。"

小王子看着他。他看起来不像一个征服了一切的国王。他看起来像个孩子。

"你是谁？"小王子问。"你看起来很漂亮。"

"我是一只狐狸，"狐狸说。

"来和我玩吧，"小王子提议说，"我很不快乐。"

"我不能和你玩，"狐狸说，"我还没有被驯服。"

"啊！请原谅，"小王子说。

但经过思考后，他补充道：

"那是什么意思——''被驯服''？"

"你不住在这里，"狐狸说，"你在寻找什么？"

"我在寻找人，"小王子说，"那是什么意思——''被驯服''？"

"人，"狐狸说，"他们有枪，他们打猎。这很令人不安。他们也养鸡。这是他们唯一的兴趣。所以你在寻找鸡吗？"

"不，"小王子说，"我在寻找朋友。那是什么意思——''被驯服''？"

"这是一个经常被忽视的行为，"狐狸说，"它意味着建立联系。"

"建立联系？"

"是的，"狐狸说，"对我来说，你还只是一个像十万个其他小男孩一样的小男孩。而对我来说，你也不需要我。而对你来说，我也只是像十万个其他狐狸一样的狐狸。但如果你驯服了我，那么我们就需要彼此。你对我来说是世界上唯一的男孩。而我对你来说是世界上唯一的狐狸。"

"我开始明白了，"小王子说，"有一朵花……我想她驯服了我……"

"这是可能的，"狐狸说，"在地球上，人们看到或遇到各种各样的东西。但人们不是到处都能看到花。人们在沙漠中行走，看不到花。人们看着星星，看不到花。但某处有一朵花为你而闪耀。你爱那朵花。你给它浇水……你保护它……你把你的生命给了它……这就是为什么她如此闪耀。"

"她比那成千上万朵其他玫瑰都重要吗？"

"当然。因为她是我的玫瑰。"

"而且因为她是你的玫瑰，所以她才如此重要？"

"因为她是那朵我浇过水的玫瑰。"

"因为她是那朵我放在玻璃罩下的玫瑰。"

"因为她是那朵我遮在屏风后面的玫瑰。"

"因为她是我的玫瑰。"

"你做得很好，"狐狸说，"现在回到你的花园里去。明天再回来。"

第二天，小王子回来了。

"再见，"他说。

"再见，"狐狸说，"现在这里是我的秘密。它很简单：只有用心才能看清。本质的东西用眼睛是看不见的。"

"本质的东西用眼睛是看不见的，"小王子重复道，以便他能记住。

"那就是你为你的玫瑰浪费的时间，才使你的玫瑰如此重要。"

"那就是我为我的玫瑰浪费的时间……"小王子重复道，以便他能记住。

"人们已经忘记了这一真理，"狐狸说，"但你不能忘记它。你永远对你所驯服的东西负责。你要对你的玫瑰负责……"

"我要对我的玫瑰负责……"小王子重复道，以便他能记住。', 
'classics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('article-002', 'AI Revolution in Language Education', '语言教育中的AI革命', 'Artificial intelligence is fundamentally transforming how we approach language education. Traditional methods, while effective, often struggle to provide personalized learning experiences that adapt to individual needs and learning styles.

Recent studies have shown that AI-powered language learning platforms can increase student engagement by up to 40% compared to conventional approaches. These systems analyze learner behavior in real-time, identifying strengths and weaknesses to create customized learning paths.

One of the most significant advantages is the ability to provide instant feedback. In traditional classroom settings, students might wait days or even weeks to receive corrections on their pronunciation or grammar. AI systems can now provide immediate, detailed feedback on pronunciation accuracy, grammar usage, and vocabulary application.

Moreover, AI enables truly personalized learning experiences. By analyzing thousands of data points from each learner, these systems can identify patterns in learning behavior and adjust difficulty level, pace, and content type accordingly. This ensures that learners are always working at their optimal challenge level.

The integration of AI with traditional language teaching methods creates a powerful synergy. Teachers can use AI analytics to understand which students need additional support, while AI handles routine practice and assessment tasks, freeing educators to focus on more complex aspects of language instruction.

As we look to the future, the role of AI in language education will only continue to grow. From advanced natural language processing that can understand context and nuance, to virtual reality environments that provide immersive cultural experiences, the possibilities are endless. The key is to embrace these technologies while maintaining the human connection that makes language learning meaningful.', 
'人工智能正在从根本上改变我们进行语言教育的方式。传统方法虽然有效，但往往难以提供个性化的学习体验，以适应个人需求和学习风格。

最近的研究表明，与常规方法相比，AI驱动的语言学习平台可以将学生的参与度提高高达40%。这些系统实时分析学习者的行为，识别优势和劣势，从而创建定制化的学习路径。

最显著的优势之一是能够提供即时反馈。在传统的课堂环境中，学生可能需要几天甚至几周才能收到关于发音或语法的更正。AI系统现在可以立即提供关于发音准确性、语法用法和词汇应用的详细反馈。

此外，AI实现了真正的个性化学习体验。通过分析每个学习者的数千个数据点，这些系统可以识别学习行为中的模式，并相应地调整难度级别、进度和内容类型。这确保学习者始终在最佳挑战水平上工作。

AI与传统语言教学方法的整合创造了强大的协同效应。教师可以使用AI分析来了解哪些学生需要额外支持，而AI处理常规练习和评估任务，使教育者能够专注于语言教学的更复杂方面。

展望未来，AI在语言教育中的作用只会继续增长。从能够理解语境和细微差别的先进自然语言处理，到提供沉浸式文化体验的虚拟现实环境，可能性是无限的。关键是在拥抱这些技术的同时，保持使语言学习有意义的人际联系。', 
'news', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('article-003', 'The Art of Living Simply', '简单生活的艺术', 'In a world that constantly demands more—more money, more possessions, more achievements—we often forget the beauty of simplicity. The art of living simply is not about deprivation; it''s about intentionality and finding contentment in what truly matters.

Simplicity begins with letting go of the unnecessary. This doesn''t mean living with nothing, but rather living with only what serves a purpose and brings joy. When we clear away the clutter—physical, mental, and emotional—we create space for what''s truly important.

There is profound freedom in owning less. When we''re not tied down by material possessions, we gain flexibility and peace of mind. We''re not constantly maintaining, protecting, or worrying about things that don''t contribute to our happiness or growth.

Living simply also means being present. When we''re not chasing after the next acquisition or achievement, we can fully engage with the current moment. We can savor our meals, appreciate our surroundings, and connect more deeply with the people around us.

The practice of simplicity extends to our relationships and commitments. By saying no to activities and obligations that don''t align with our values, we create room for meaningful connections and pursuits. We become more selective about how we spend our time and energy, investing it in what truly enriches our lives.

Ultimately, living simply is an act of courage. It requires us to question societal norms and expectations, and to define success on our own terms. In doing so, we often discover that we need far less than we thought to be happy and fulfilled.', 
'在一个不断要求更多的世界里——更多的钱、更多的财产、更多的成就——我们经常忘记简单之美。简单生活的艺术不是关于剥夺；它是关于有意图，在真正重要的事情中找到满足。

简单从放下不必要的东西开始。这并不意味着什么都不拥有，而是只拥有那些有目的且带来快乐的东西。当我们清除掉杂乱——物质的、精神的和情感的——我们就为真正重要的东西创造了空间。

拥有更少的东西有着深刻的自由。当我们不被物质财产所束缚时，我们获得了灵活性和内心的平静。我们不需要不断地维护、保护或担心那些不会对我们的幸福或成长做出贡献的事情。

简单生活也意味着活在当下。当我们不追求下一次获取或成就时，我们可以充分参与当下。我们可以细细品味我们的饭菜，欣赏我们的周围环境，与周围的人建立更深的联系。

简单的实践延伸到我们的关系和承诺。通过对那些不符合我们价值观的活动和义务说不，我们为有意义的联系和追求创造了空间。我们对如何花费时间和精力变得更加挑剔，将其投资在真正丰富我们生活的事情上。

归根结底，简单生活是一种勇敢的行为。它要求我们质疑社会规范和期望，并按照我们自己的方式定义成功。在这样做的过程中，我们经常发现，我们需要比我们想象的要少得多才能快乐和满足。', 
'classics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入 study_words 数据 (3个示例)
INSERT INTO "study_words" ("id", "word", "meaning", "pronunciation", "example", "example_zh", "category", "created_at", "updated_at") VALUES
('studyword-001', 'conversation', '对话，交谈', '/ˌkɒnvəˈseɪʃən/', 'I had a long conversation with my friend.', '我和我的朋友进行了一次长谈。', 'Lifestyle', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('studyword-002', 'schedule', '日程安排', '/ˈʃedjuːl/', 'What is your schedule for tomorrow?', '你明天的日程安排是什么？', 'Professional', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('studyword-003', 'environment', '环境', '/ɪnˈvaɪrənmənt/', 'We need to protect the environment.', '我们需要保护环境。', 'Lifestyle', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入 study_sentences 数据 (3个示例)
INSERT INTO "study_sentences" ("id", "zh", "en", "pinyin", "category", "created_at", "updated_at") VALUES
('studysentence-001', '你今天过得怎么样？', 'How was your day today?', 'Nǐ jīntiān guò de zěnme yàng?', 'Lifestyle', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('studysentence-002', '我们需要安排一个会议。', 'We need to schedule a meeting.', 'Wǒmen xūyào ānpái yí gè huìyì.', 'Professional', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('studysentence-003', '这个项目的截止日期是什么时候？', 'What is the deadline for this project?', 'Zhège xiàngmù de jiézhǐ rìqī shì shénme shíhou?', 'Professional', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入示例 news 数据
INSERT INTO "news" ("id", "title", "content", "source", "category", "url", "created_at", "updated_at") VALUES
('news-001', 'AI Technology Breakthrough', 'Latest developments in artificial intelligence are reshaping the tech industry.', 'TechDaily', 'technology', 'https://example.com/news/1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('news-002', 'Global Climate Summit', 'World leaders gather to discuss climate change solutions.', 'WorldNews', 'environment', 'https://example.com/news/2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入示例 crawler_configs 数据
INSERT INTO "crawler_configs" ("id", "name", "url", "selector", "category", "enabled", "interval", "created_at", "updated_at") VALUES
('crawler-001', 'Tech News Source', 'https://example.com/tech', 'article.news-item', 'technology', true, 3600, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入示例 mock_exams 数据 (IELTS)
INSERT INTO "mock_exams" ("id", "exam_type", "sections", "created_at", "updated_at") VALUES
('mock-ielts-001', 'IELTS', '[
  {
    "type": "listening",
    "title": "Listening Comprehension",
    "transcript": "Welcome to the IELTS listening test. In this section, you will hear a conversation between two students discussing their upcoming presentation. Listen carefully and answer the questions that follow. Student A: Hi Sarah, have you started working on our group presentation for next week? Student B: Yes, I have. I have been researching the topic of climate change and its effects on marine life. What about you?",
    "questions": [
      {
        "id": "l1",
        "type": "multiple_choice",
        "stem": "What is the main topic of the students presentation?",
        "options": ["A. Climate change and marine life", "B. Renewable energy sources", "C. Ocean pollution", "D. Wildlife conservation"],
        "answer": "A",
        "analysis": "The conversation clearly mentions that Student B has been researching the topic of climate change and its effects on marine life."
      },
      {
        "id": "l2",
        "type": "fill_blank",
        "stem": "The presentation is scheduled for next ______.",
        "answer": "week",
        "analysis": "Student A mentions the presentation is for next week."
      }
    ]
  },
  {
    "type": "reading",
    "title": "Reading Comprehension",
    "content": "The rapid advancement of artificial intelligence has transformed numerous industries, from healthcare to finance. Machine learning algorithms can now process vast amounts of data to identify patterns that humans might miss. However, this technological revolution also raises important ethical questions about privacy, job displacement, and the role of human judgment in decision-making processes.",
    "questions": [
      {
        "id": "r1",
        "type": "multiple_choice",
        "stem": "According to the passage, what is one concern raised by AI advancement?",
        "options": ["A. Increased productivity", "B. Job displacement", "C. Faster internet speeds", "D. Lower energy consumption"],
        "answer": "B",
        "analysis": "The passage explicitly mentions job displacement as one of the ethical questions raised by AI advancement."
      }
    ]
  },
  {
    "type": "vocabulary",
    "title": "Vocabulary Section",
    "questions": [
      {
        "id": "v1",
        "type": "fill_blank",
        "stem": "In detective fiction, a ______ is a false clue intended to mislead readers or characters.",
        "answer": "red herring",
        "analysis": "A red herring is a common literary device used in mystery novels to distract readers from the real solution."
      },
      {
        "id": "v2",
        "type": "fill_blank",
        "stem": "The novel adheres to the principles of ______, where all clues are fairly presented to the reader.",
        "answer": "fair play",
        "analysis": "Fair play is a convention in detective fiction that requires the author to give the reader all the necessary clues to solve the mystery."
      }
    ]
  }
]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入示例 mock_exams 数据 (TOEFL)
INSERT INTO "mock_exams" ("id", "exam_type", "sections", "created_at", "updated_at") VALUES
('mock-toefl-001', 'TOEFL', '[
  {
    "type": "listening",
    "title": "Listening Comprehension",
    "transcript": "Listen to a conversation between a student and a professor. Student: Professor Johnson, I am having trouble understanding the concept of photosynthesis. Could you explain it in simpler terms? Professor: Of course. Photosynthesis is the process by which plants convert light energy into chemical energy. Think of it as a factory where sunlight is the raw material and glucose is the product.",
    "questions": [
      {
        "id": "t1",
        "type": "multiple_choice",
        "stem": "According to the professor, what is photosynthesis compared to?",
        "options": ["A. A laboratory experiment", "B. A factory", "C. A chemical reaction", "D. A biological process"],
        "answer": "B",
        "analysis": "The professor explicitly compares photosynthesis to a factory where sunlight is the raw material and glucose is the product."
      }
    ]
  },
  {
    "type": "reading",
    "title": "Reading Comprehension",
    "content": "The Great Barrier Reef, located off the coast of Australia, is the worlds largest coral reef system. Stretching over 2,300 kilometers, it is home to thousands of marine species. However, climate change poses a significant threat to this natural wonder. Rising ocean temperatures cause coral bleaching, which can lead to the death of coral colonies if conditions do not improve.",
    "questions": [
      {
        "id": "t2",
        "type": "multiple_choice",
        "stem": "What is the main threat to the Great Barrier Reef mentioned in the passage?",
        "options": ["A. Overfishing", "B. Pollution", "C. Climate change", "D. Tourism"],
        "answer": "C",
        "analysis": "The passage explicitly states that climate change poses a significant threat to the Great Barrier Reef."
      }
    ]
  }
]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- 完成
-- ============================================
SELECT 'Database recreation completed successfully!' AS status;
SELECT 'Created tables: users, vocabulary, sentences, articles, study_words, study_sentences, news, practice_logs, mistake_books, user_progress, user_study_stats, check_ins, verification_codes, crawler_logs, crawler_configs, mock_exams, exam_results' AS tables;

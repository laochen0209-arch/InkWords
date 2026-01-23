-- ============================================
-- 完整的数据库初始化 SQL 脚本
-- 包含：清理旧表、创建新表、插入数据
-- ============================================

-- 步骤 1: 清理旧表
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Vocabulary" CASCADE;
DROP TABLE IF EXISTS "Sentence" CASCADE;
DROP TABLE IF EXISTS "Article" CASCADE;
DROP TABLE IF EXISTS "PracticeLog" CASCADE;
DROP TABLE IF EXISTS "MistakeBook" CASCADE;

-- 步骤 2: 创建新表
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "avatar" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "PracticeLog" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "MistakeBook" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Vocabulary" (
    "id" TEXT PRIMARY KEY,
    "english" TEXT NOT NULL,
    "chinese" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "exampleEn" TEXT NOT NULL,
    "exampleZh" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Sentence" (
    "id" TEXT PRIMARY KEY,
    "contentEn" TEXT NOT NULL,
    "contentZh" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Article" (
    "id" TEXT PRIMARY KEY,
    "titleEn" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentZh" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 步骤 3: 创建索引
CREATE INDEX IF NOT EXISTS "PracticeLog_userId_idx" ON "PracticeLog"("userId");
CREATE INDEX IF NOT EXISTS "MistakeBook_userId_idx" ON "MistakeBook"("userId");
CREATE INDEX IF NOT EXISTS "Vocabulary_english_idx" ON "Vocabulary"("english");
CREATE INDEX IF NOT EXISTS "Sentence_author_idx" ON "Sentence"("author");
CREATE INDEX IF NOT EXISTS "Article_category_idx" ON "Article"("category");

-- 步骤 4: 插入词汇数据 (20个)
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "createdAt", "updatedAt") VALUES
('vocab-001', $text$Serendipity$text$, $text$不期而遇的美好$text$, $text$sè rén dì pí yù$text$, $text$Finding this book was pure serendipity.$text$, $text$发现这本书纯属不期而遇的美好。$text$, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-002', $text$Ephemeral$text$, $text$转瞬即逝的$text$, $text$zhuǎn shùn jí shì de$text$, $text$Youth is ephemeral.$text$, $text$青春是转瞬即逝的。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-003', $text$Resilience$text$, $text$韧性$text$, $text$rèn xìng$text$, $text$Her resilience inspired everyone.$text$, $text$她的韧性激励了每个人。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-004', $text$Eloquent$text$, $text$雄辩的$text$, $text$xióng biàn de$text$, $text$He is an eloquent speaker.$text$, $text$他是一位雄辩的演讲者。$text$, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-005', $text$Mellifluous$text$, $text$甜美的$text$, $text$tián měi de$text$, $text$She has a mellifluous voice.$text$, $text$她有一个甜美的嗓音。$text$, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-006', $text$Tranquility$text$, $text$宁静$text$, $text$níng jìng$text$, $text$The tranquility of the lake was breathtaking.$text$, $text$湖面的宁静令人叹为观止。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-007', $text$Ethereal$text$, $text$飘渺的$text$, $text$piāo miǎo de$text$, $text$The ethereal beauty of the sunset.$text$, $text$日落的飘渺之美。$text$, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-008', $text$Perseverance$text$, $text$坚持不懈$text$, $text$jiān chí bù xiè$text$, $text$Perseverance leads to success.$text$, $text$坚持不懈通向成功。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-009', $text$Harmony$text$, $text$和谐$text$, $text$hé xié$text$, $text$Living in harmony with nature.$text$, $text$与自然和谐相处。$text$, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-010', $text$Serenity$text$, $text$宁静$text$, $text$níng jìng$text$, $text$Find serenity in meditation.$text$, $text$在冥想中寻找宁静。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-011', $text$Gratitude$text$, $text$感恩$text$, $text$gǎn ēn$text$, $text$Express gratitude to others.$text$, $text$向他人表达感恩。$text$, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-012', $text$Compassion$text$, $text$同情心$text$, $text$tóng qíng xīn$text$, $text$Show compassion to those in need.$text$, $text$对需要帮助的人表示同情心。$text$, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-013', $text$Authenticity$text$, $text$真实性$text$, $text$zhēn shí xìng$text$, $text$Value authenticity in relationships.$text$, $text$重视人际关系中的真实性。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-014', $text$Mindfulness$text$, $text$正念$text$, $text$zhèng niàn$text$, $text$Practice mindfulness daily.$text$, $text$每天练习正念。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-015', $text$Benevolence$text$, $text$仁慈$text$, $text$rén cí$text$, $text$Act with benevolence toward all.$text$, $text$对所有人都以仁慈之心对待。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-016', $text$Curiosity$text$, $text$好奇心$text$, $text$hào qí xīn$text$, $text$Maintain curiosity about the world.$text$, $text$保持对世界的好奇心。$text$, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-017', $text$Creativity$text$, $text$创造力$text$, $text$chuàng zào lì$text$, $text$Unleash your creativity.$text$, $text$释放你的创造力。$text$, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-018', $text$Resilience$text$, $text$适应力$text$, $text$shì yìng lì$text$, $text$Build resilience in adversity.$text$, $text$在逆境中建立适应力。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-019', $text$Integrity$text$, $text$正直$text$, $text$zhèng zhí$text$, $text$Maintain integrity in all actions.$text$, $text$在所有行动中保持正直。$text$, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-020', $text$Empathy$text$, $text$同理心$text$, $text$tóng lǐ xīn$text$, $text$Practice empathy with others.$text$, $text$与他人练习同理心。$text$, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 步骤 5: 插入句子数据 (10个)
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "createdAt", "updatedAt") VALUES
('sentence-001', $text$To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.$text$, $text$在一个不断试图让你成为别人的世界里，做你自己是最伟大的成就。$text$, $text$zài yī gè bú duàn shì tú ràng nǐ chéng wéi bié rén de shì jiè lǐ, zuò nǐ zì jǐ shì zuì wěi dà de chéng jiù$text$, $text$Ralph Waldo Emerson$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-002', $text$The only way to do great work is to love what you do.$text$, $text$做伟大工作的唯一方法是热爱你所做的事。$text$, $text$zuò wěi dà gōng zuò de wéi yī fāng fǎ shì rè ài nǐ suǒ zuò de shì$text$, $text$Steve Jobs$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-003', $text$In the middle of difficulty lies opportunity.$text$, $text$困难之中蕴藏着机会。$text$, $text$kùn nán zhī zhōng yùn cáng zhe jī huì$text$, $text$Albert Einstein$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-004', $text$Life is what happens when you are busy making other plans.$text$, $text$生活就是当你忙着制定其他计划时发生的事情。$text$, $text$shēng huó jiù shì dāng nǐ máng zhe zhì dìng qí tā jì huà shí fā shēng de shì qíng$text$, $text$John Lennon$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-005', $text$The future belongs to those who believe in the beauty of their dreams.$text$, $text$未来属于那些相信自己梦想之美的人。$text$, $text$wèi lái shǔ yú nà xiē xiāng xìn zì jǐ mèng xiǎng zhī měi de rén$text$, $text$Eleanor Roosevelt$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-006', $text$Success is not final, failure is not fatal: it is the courage to continue that counts.$text$, $text$成功不是终点，失败也不是致命的：重要的是继续前进的勇气。$text$, $text$chéng gōng bù shì zhōng diǎn, shī bài yě bù shì zhì mìng de: zhòng yào de shì jì xù qián jìn de yǒng qì$text$, $text$Winston Churchill$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-007', $text$The only thing we have to fear is fear itself.$text$, $text$我们唯一需要恐惧的是恐惧本身。$text$, $text$wǒ men wéi yī xū yào kǒng jù de shì kǒng jù běn shēn$text$, $text$Franklin D. Roosevelt$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-008', $text$Education is the most powerful weapon which you can use to change the world.$text$, $text$教育是你可以用来改变世界的最强有力的武器。$text$, $text$jiào yù shì nǐ kě yǐ yòng lái gǎi biàn shì jiè de zuì qiáng yǒu lì de wǔ qì$text$, $text$Nelson Mandela$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-009', $text$Be the change you wish to see in the world.$text$, $text$成为你希望在世界中看到的变化。$text$, $text$chéng wéi nǐ xī wàng zài shì jiè zhōng kàn dào de biàn huà$text$, $text$Mahatma Gandhi$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-010', $text$The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.$text$, $text$世界上最美好、最珍贵的东西，看不见也摸不着——它们必须用心去感受。$text$, $text$shì jiè shàng zuì měi hǎo, zuì zhēn guì de dōng xī, kàn bù jiàn yě mō bù zháo - tā men bì xū yòng xīn qù gǎn shòu$text$, $text$Helen Keller$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 步骤 6: 插入文章数据 (3篇)
INSERT INTO "Article" ("id", "titleEn", "titleZh", "contentEn", "contentZh", "category", "createdAt", "updatedAt") VALUES
('article-001', $text$The Little Prince - Chapter 21$text$, $text$小王子 - 第二十一章$text$, $text$classics$text$, $text$It was then that the fox appeared.

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

"What does that mean - 'tamed'?"

"You do not live here," said the fox. "What do you look for?"

"I am looking for men," said the little prince. "What does that mean - 'tamed'?"

"Men," said the fox, "they have guns, and they hunt. It is very disturbing. They also raise chickens. These are their only interests. So you are looking for chickens?"

"No," said the little prince. "I am looking for friends. What does that mean - 'tamed'?"

"It is an act too often neglected," said the fox. "It means to establish ties."

"To establish ties?"

"That's right," said the fox. "To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys. And I have no need of you. And you, on your side, have no need of me. To you, I am nothing more than a fox like a hundred thousand other foxes. But if you tame me, then we shall need each other. You will be to me the only boy in the world. And I shall be to you the only fox in the world."

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

"I am responsible for my rose..." the little prince repeated, so that he would be sure to remember.$text$, $text$这时，狐狸出现了。

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

"那是什么意思——'被驯服'？"

"你不住在这里，"狐狸说，"你在寻找什么？"

"我在寻找人，"小王子说，"那是什么意思——'被驯服'？"

"人，"狐狸说，"他们有枪，他们打猎。这很令人不安。他们也养鸡。这是他们唯一的兴趣。所以你在寻找鸡吗？"

"不，"小王子说，"我在寻找朋友。那是什么意思——'被驯服'？"

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

"我要对我的玫瑰负责……"小王子重复道，以便他能记住。$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('article-002', $text$AI Revolution in Language Education$text$, $text$语言教育中的AI革命$text$, $text$news$text$, $text$Artificial intelligence is fundamentally transforming how we approach language education. Traditional methods, while effective, often struggle to provide personalized learning experiences that adapt to individual needs and learning styles.

Recent studies have shown that AI-powered language learning platforms can increase student engagement by up to 40% compared to conventional approaches. These systems analyze learner behavior in real-time, identifying strengths and weaknesses to create customized learning paths.

One of the most significant advantages is the ability to provide instant feedback. In traditional classroom settings, students might wait days or even weeks to receive corrections on their pronunciation or grammar. AI systems can now provide immediate, detailed feedback on pronunciation accuracy, grammar usage, and vocabulary application.

Moreover, AI enables truly personalized learning experiences. By analyzing thousands of data points from each learner, these systems can identify patterns in learning behavior and adjust difficulty level, pace, and content type accordingly. This ensures that learners are always working at their optimal challenge level.

The integration of AI with traditional language teaching methods creates a powerful synergy. Teachers can use AI analytics to understand which students need additional support, while AI handles routine practice and assessment tasks, freeing educators to focus on more complex aspects of language instruction.

As we look to the future, the role of AI in language education will only continue to grow. From advanced natural language processing that can understand context and nuance, to virtual reality environments that provide immersive cultural experiences, the possibilities are endless. The key is to embrace these technologies while maintaining the human connection that makes language learning meaningful.$text$, $text$人工智能正在从根本上改变我们进行语言教育的方式。传统方法虽然有效，但往往难以提供个性化的学习体验，以适应个人需求和学习风格。

最近的研究表明，与常规方法相比，AI驱动的语言学习平台可以将学生的参与度提高高达40%。这些系统实时分析学习者的行为，识别优势和劣势，从而创建定制化的学习路径。

最显著的优势之一是能够提供即时反馈。在传统的课堂环境中，学生可能需要几天甚至几周才能收到关于发音或语法的更正。AI系统现在可以立即提供关于发音准确性、语法用法和词汇应用的详细反馈。

此外，AI实现了真正的个性化学习体验。通过分析每个学习者的数千个数据点，这些系统可以识别学习行为中的模式，并相应地调整难度级别、进度和内容类型。这确保学习者始终在最佳挑战水平上工作。

AI与传统语言教学方法的整合创造了强大的协同效应。教师可以使用AI分析来了解哪些学生需要额外支持，而AI处理常规练习和评估任务，使教育者能够专注于语言教学的更复杂方面。

展望未来，AI在语言教育中的作用只会继续增长。从能够理解语境和细微差别的先进自然语言处理，到提供沉浸式文化体验的虚拟现实环境，可能性是无限的。关键是在拥抱这些技术的同时，保持使语言学习有意义的人际联系。$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('article-003', $text$The Art of Living Simply$text$, $text$简单生活的艺术$text$, $text$classics$text$, $text$In a world that constantly demands more—more money, more possessions, more achievements—we often forget the beauty of simplicity. The art of living simply is not about deprivation; it's about intentionality and finding contentment in what truly matters.

Simplicity begins with letting go of the unnecessary. This doesn't mean living with nothing, but rather living with only what serves a purpose and brings joy. When we clear away the clutter—physical, mental, and emotional—we create space for what's truly important.

There is profound freedom in owning less. When we're not tied down by material possessions, we gain flexibility and peace of mind. We're not constantly maintaining, protecting, or worrying about things that don't contribute to our happiness or growth.

Living simply also means being present. When we're not chasing after the next acquisition or achievement, we can fully engage with the current moment. We can savor our meals, appreciate our surroundings, and connect more deeply with the people around us.

The practice of simplicity extends to our relationships and commitments. By saying no to activities and obligations that don't align with our values, we create room for meaningful connections and pursuits. We become more selective about how we spend our time and energy, investing it in what truly enriches our lives.

Ultimately, living simply is an act of courage. It requires us to question societal norms and expectations, and to define success on our own terms. In doing so, we often discover that we need far less than we thought to be happy and fulfilled.$text$, $text$在一个不断要求更多的世界里——更多的钱、更多的财产、更多的成就——我们经常忘记简单之美。简单生活的艺术不是关于剥夺；它是关于有意图，在真正重要的事情中找到满足。

简单从放下不必要的东西开始。这并不意味着什么都不拥有，而是只拥有那些有目的且带来快乐的东西。当我们清除掉杂乱——物质的、精神的和情感的——我们就为真正重要的东西创造了空间。

拥有更少的东西有着深刻的自由。当我们不被物质财产所束缚时，我们获得了灵活性和内心的平静。我们不需要不断地维护、保护或担心那些不会对我们的幸福或成长做出贡献的事情。

简单生活也意味着活在当下。当我们不追求下一次获取或成就时，我们可以充分参与当下。我们可以细细品味我们的饭菜，欣赏我们的周围环境，与周围的人建立更深的联系。

简单的实践延伸到我们的关系和承诺。通过对那些不符合我们价值观的活动和义务说不，我们为有意义的联系和追求创造了空间。我们对如何花费时间和精力变得更加挑剔，将其投资在真正丰富我们生活的事情上。

归根结底，简单生活是一种勇敢的行为。它要求我们质疑社会规范和期望，并按照我们自己的方式定义成功。在这样做的过程中，我们经常发现，我们需要比我们想象的要少得多才能快乐和满足。$text$, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 完成
SELECT 'Database initialization completed!' AS status;

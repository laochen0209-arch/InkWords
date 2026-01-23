import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  try {
    console.log('Clearing existing data...')
    await prisma.vocabulary.deleteMany({})
    await prisma.sentence.deleteMany({})
    await prisma.article.deleteMany({})

    console.log('Seeding vocabulary...')
    await prisma.vocabulary.createMany({
      data: [
        {
          id: 'vocab-001',
          english: 'Serendipity',
          chinese: '不期而遇的美好',
          pinyin: 'sè rén dì pí yù',
          exampleEn: 'Finding this book was pure serendipity.',
          exampleZh: '发现这本书纯属不期而遇的美好。',
          difficulty: 4
        },
        {
          id: 'vocab-002',
          english: 'Ephemeral',
          chinese: '转瞬即逝的',
          pinyin: 'zhuǎn shùn jí shì de',
          exampleEn: 'Youth is ephemeral.',
          exampleZh: '青春是转瞬即逝的。',
          difficulty: 3
        },
        {
          id: 'vocab-003',
          english: 'Resilience',
          chinese: '韧性',
          pinyin: 'rèn xìng',
          exampleEn: 'Her resilience inspired everyone.',
          exampleZh: '她的韧性激励了每个人。',
          difficulty: 3
        },
        {
          id: 'vocab-004',
          english: 'Eloquent',
          chinese: '雄辩的',
          pinyin: 'xióng biàn de',
          exampleEn: 'He is an eloquent speaker.',
          exampleZh: '他是一位雄辩的演讲者。',
          difficulty: 4
        },
        {
          id: 'vocab-005',
          english: 'Mellifluous',
          chinese: '甜美的',
          pinyin: 'tián měi de',
          exampleEn: 'She has a mellifluous voice.',
          exampleZh: '她有一个甜美的嗓音。',
          difficulty: 4
        },
        {
          id: 'vocab-006',
          english: 'Tranquility',
          chinese: '宁静',
          pinyin: 'níng jìng',
          exampleEn: 'The tranquility of the lake was breathtaking.',
          exampleZh: '湖面的宁静令人叹为观止。',
          difficulty: 3
        },
        {
          id: 'vocab-007',
          english: 'Ethereal',
          chinese: '飘渺的',
          pinyin: 'piāo miǎo de',
          exampleEn: 'The ethereal beauty of the sunset.',
          exampleZh: '日落的飘渺之美。',
          difficulty: 4
        },
        {
          id: 'vocab-008',
          english: 'Perseverance',
          chinese: '坚持不懈',
          pinyin: 'jiān chí bù xiè',
          exampleEn: 'Perseverance leads to success.',
          exampleZh: '坚持不懈通向成功。',
          difficulty: 3
        },
        {
          id: 'vocab-009',
          english: 'Harmony',
          chinese: '和谐',
          pinyin: 'hé xié',
          exampleEn: 'Living in harmony with nature.',
          exampleZh: '与自然和谐相处。',
          difficulty: 2
        },
        {
          id: 'vocab-010',
          english: 'Serenity',
          chinese: '宁静',
          pinyin: 'níng jìng',
          exampleEn: 'Find serenity in meditation.',
          exampleZh: '在冥想中寻找宁静。',
          difficulty: 3
        },
        {
          id: 'vocab-011',
          english: 'Gratitude',
          chinese: '感恩',
          pinyin: 'gǎn ēn',
          exampleEn: 'Express gratitude to others.',
          exampleZh: '向他人表达感恩。',
          difficulty: 2
        },
        {
          id: 'vocab-012',
          english: 'Compassion',
          chinese: '同情心',
          pinyin: 'tóng qíng xīn',
          exampleEn: 'Show compassion to those in need.',
          exampleZh: '对需要帮助的人表示同情心。',
          difficulty: 2
        },
        {
          id: 'vocab-013',
          english: 'Authenticity',
          chinese: '真实性',
          pinyin: 'zhēn shí xìng',
          exampleEn: 'Value authenticity in relationships.',
          exampleZh: '重视人际关系中的真实性。',
          difficulty: 3
        },
        {
          id: 'vocab-014',
          english: 'Mindfulness',
          chinese: '正念',
          pinyin: 'zhèng niàn',
          exampleEn: 'Practice mindfulness daily.',
          exampleZh: '每天练习正念。',
          difficulty: 3
        },
        {
          id: 'vocab-015',
          english: 'Benevolence',
          chinese: '仁慈',
          pinyin: 'rén cí',
          exampleEn: 'Act with benevolence toward all.',
          exampleZh: '对所有人都以仁慈之心对待。',
          difficulty: 3
        },
        {
          id: 'vocab-016',
          english: 'Curiosity',
          chinese: '好奇心',
          pinyin: 'hào qí xīn',
          exampleEn: 'Maintain curiosity about the world.',
          exampleZh: '保持对世界的好奇心。',
          difficulty: 2
        },
        {
          id: 'vocab-017',
          english: 'Creativity',
          chinese: '创造力',
          pinyin: 'chuàng zào lì',
          exampleEn: 'Unleash your creativity.',
          exampleZh: '释放你的创造力。',
          difficulty: 2
        },
        {
          id: 'vocab-018',
          english: 'Resilience',
          chinese: '适应力',
          pinyin: 'shì yìng lì',
          exampleEn: 'Build resilience in adversity.',
          exampleZh: '在逆境中建立适应力。',
          difficulty: 3
        },
        {
          id: 'vocab-019',
          english: 'Integrity',
          chinese: '正直',
          pinyin: 'zhèng zhí',
          exampleEn: 'Maintain integrity in all actions.',
          exampleZh: '在所有行动中保持正直。',
          difficulty: 3
        },
        {
          id: 'vocab-020',
          english: 'Empathy',
          chinese: '同理心',
          pinyin: 'tóng lǐ xīn',
          exampleEn: 'Practice empathy with others.',
          exampleZh: '与他人练习同理心。',
          difficulty: 2
        }
      ]
    })

    console.log('Seeding sentences...')
    await prisma.sentence.createMany({
      data: [
        {
          id: 'sentence-001',
          contentEn: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
          contentZh: '在一个不断试图让你成为别人的世界里，做你自己是最伟大的成就。',
          pinyin: 'zài yī gè bú duàn shì tú ràng nǐ chéng wéi bié rén de shì jiè lǐ, zuò nǐ zì jǐ shì zuì wěi dà de chéng jiù',
          author: 'Ralph Waldo Emerson'
        },
        {
          id: 'sentence-002',
          contentEn: 'The only way to do great work is to love what you do.',
          contentZh: '做伟大工作的唯一方法是热爱你所做的事。',
          pinyin: 'zuò wěi dà gōng zuò de wéi yī fāng fǎ shì rè ài nǐ suǒ zuò de shì',
          author: 'Steve Jobs'
        },
        {
          id: 'sentence-003',
          contentEn: 'In the middle of difficulty lies opportunity.',
          contentZh: '困难之中蕴藏着机会。',
          pinyin: 'kùn nán zhī zhōng yùn cáng zhe jī huì',
          author: 'Albert Einstein'
        },
        {
          id: 'sentence-004',
          contentEn: 'Life is what happens when you are busy making other plans.',
          contentZh: '生活就是当你忙着制定其他计划时发生的事情。',
          pinyin: 'shēng huó jiù shì dāng nǐ máng zhe zhì dìng qí tā jì huà shí fā shēng de shì qíng',
          author: 'John Lennon'
        },
        {
          id: 'sentence-005',
          contentEn: 'The future belongs to those who believe in the beauty of their dreams.',
          contentZh: '未来属于那些相信自己梦想之美的人。',
          pinyin: 'wèi lái shǔ yú nà xiē xiāng xìn zì jǐ mèng xiǎng zhī měi de rén',
          author: 'Eleanor Roosevelt'
        },
        {
          id: 'sentence-006',
          contentEn: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
          contentZh: '成功不是终点，失败也不是致命的：重要的是继续前进的勇气。',
          pinyin: 'chéng gōng bù shì zhōng diǎn, shī bài yě bù shì zhì mìng de: zhòng yào de shì jì xù qián jìn de yǒng qì',
          author: 'Winston Churchill'
        },
        {
          id: 'sentence-007',
          contentEn: 'The only thing we have to fear is fear itself.',
          contentZh: '我们唯一需要恐惧的是恐惧本身。',
          pinyin: 'wǒ men wéi yī xū yào kǒng jù de shì kǒng jù běn shēn',
          author: 'Franklin D. Roosevelt'
        },
        {
          id: 'sentence-008',
          contentEn: 'Education is the most powerful weapon which you can use to change the world.',
          contentZh: '教育是你可以用来改变世界的最强有力的武器。',
          pinyin: 'jiào yù shì nǐ kě yǐ yòng lái gǎi biàn shì jiè de zuì qiáng yǒu lì de wǔ qì',
          author: 'Nelson Mandela'
        },
        {
          id: 'sentence-009',
          contentEn: 'Be the change you wish to see in the world.',
          contentZh: '成为你希望在世界中看到的变化。',
          pinyin: 'chéng wéi nǐ xī wàng zài shì jiè zhōng kàn dào de biàn huà',
          author: 'Mahatma Gandhi'
        },
        {
          id: 'sentence-010',
          contentEn: 'The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.',
          contentZh: '世界上最美好、最珍贵的东西，看不见也摸不着——它们必须用心去感受。',
          pinyin: 'shì jiè shàng zuì měi hǎo, zuì zhēn guì de dōng xī, kàn bù jiàn yě mō bù zháo - tā men bì xū yòng xīn qù gǎn shòu',
          author: 'Helen Keller'
        }
      ]
    })

    console.log('Seeding articles...')
    await prisma.article.createMany({
      data: [
        {
          id: 'article-001',
          titleEn: 'The Little Prince - Chapter 21',
          titleZh: '小王子 - 第二十一章',
          category: 'classics',
          contentEn: `It was then that the fox appeared.

"Good morning," said the fox.
"Good morning," the little prince responded politely.
And when he turned back to the wall, he saw the fox.

"I am here," the fox said, "under the apple tree."

The little prince looked at him. He did not look at all like a king who had conquered everything. He looked like a child.

"Who are you?" asked the little prince. "You are very pretty to look at."

"I am a fox," the fox said.

"Come and play with me," proposed the little prince. "I am so unhappy."

"I cannot play with you," the fox said. "I am not tamed."

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

"That is possible," the fox said. "On the Earth, one sees or meets all sorts of things. But one does not see flowers everywhere. One walks in the desert, and one does not see flowers. One looks into the stars, and one does not see flowers. But a single flower somewhere shines for you. You love that flower. You water it... You protect it... You give it your life... That is why she shines."

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

"Men have forgotten this truth," the fox said. "But you must not forget it. You become responsible, forever, for what you have tamed. You are responsible for your rose..."

"I am responsible for my rose..." the little prince repeated, so that he would be sure to remember.

"Men have forgotten this truth," the fox said. "But you must not forget it. You become responsible, forever, for what you have tamed. You are responsible for your rose..."

"I am responsible for my rose..." the little prince repeated, so that he would be sure to remember.`,
          contentZh: `这时，狐狸出现了。

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

"我要对我的玫瑰负责……"小王子重复道，以便他能记住。`
        },
        {
          id: 'article-002',
          titleEn: 'AI Revolution in Language Education',
          titleZh: '语言教育中的AI革命',
          category: 'news',
          contentEn: `Artificial intelligence is fundamentally transforming how we approach language education. Traditional methods, while effective, often struggle to provide personalized learning experiences that adapt to individual needs and learning styles.

Recent studies have shown that AI-powered language learning platforms can increase student engagement by up to 40% compared to conventional approaches. These systems analyze learner behavior in real-time, identifying strengths and weaknesses to create customized learning paths.

One of the most significant advantages is the ability to provide instant feedback. In traditional classroom settings, students might wait days or even weeks to receive corrections on their pronunciation or grammar. AI systems can now provide immediate, detailed feedback on pronunciation accuracy, grammar usage, and vocabulary application.

Moreover, AI enables truly personalized learning experiences. By analyzing thousands of data points from each learner, these systems can identify patterns in learning behavior and adjust difficulty level, pace, and content type accordingly. This ensures that learners are always working at their optimal challenge level.

The integration of AI with traditional language teaching methods creates a powerful synergy. Teachers can use AI analytics to understand which students need additional support, while AI handles routine practice and assessment tasks, freeing educators to focus on more complex aspects of language instruction.

As we look to the future, the role of AI in language education will only continue to grow. From advanced natural language processing that can understand context and nuance, to virtual reality environments that provide immersive cultural experiences, the possibilities are endless. The key is to embrace these technologies while maintaining human connection that makes language learning meaningful.`,
          contentZh: `人工智能正在从根本上改变我们进行语言教育的方式。传统方法虽然有效，但往往难以提供个性化的学习体验，以适应个人需求和学习风格。

最近的研究表明，与常规方法相比，AI驱动的语言学习平台可以将学生的参与度提高高达40%。这些系统实时分析学习者的行为，识别优势和劣势，从而创建定制化的学习路径。

最显著的优势之一是能够提供即时反馈。在传统的课堂环境中，学生可能需要几天甚至几周才能收到关于发音或语法的更正。AI系统现在可以立即提供关于发音准确性、语法用法和词汇应用的详细反馈。

此外，AI实现了真正的个性化学习体验。通过分析每个学习者的数千个数据点，这些系统可以识别学习行为中的模式，并相应地调整难度级别、进度和内容类型。这确保学习者始终在最佳挑战水平上工作。

AI与传统语言教学方法的整合创造了强大的协同效应。教师可以使用AI分析来了解哪些学生需要额外支持，而AI处理常规练习和评估任务，使教育者能够专注于语言教学的更复杂方面。

展望未来，AI在语言教育中的作用只会继续增长。从能够理解语境和细微差别的先进自然语言处理，到提供沉浸式文化体验的虚拟现实环境，可能性是无限的。关键是在拥抱这些技术的同时，保持使语言学习有意义的人际联系。`
        },
        {
          id: 'article-003',
          titleEn: 'The Art of Living Simply',
          titleZh: '简单生活的艺术',
          category: 'classics',
          contentEn: `In a world that constantly demands more—more money, more possessions, more achievements—we often forget the beauty of simplicity. The art of living simply is not about deprivation; it's about intentionality and finding contentment in what truly matters.

Simplicity begins with letting go of the unnecessary. This doesn't mean living with nothing, but rather living with only what serves a purpose and brings joy. When we clear away the clutter—physical, mental, and emotional—we create space for what's truly important.

There is profound freedom in owning less. When we're not tied down by material possessions, we gain flexibility and peace of mind. We're not constantly maintaining, protecting, or worrying about things that don't contribute to our happiness or growth.

Living simply also means being present. When we're not chasing after the next acquisition or achievement, we can fully engage with the current moment. We can savor our meals, appreciate our surroundings, and connect more deeply with the people around us.

The practice of simplicity extends to our relationships and commitments. By saying no to activities and obligations that don't align with our values, we create room for meaningful connections and pursuits. We become more selective about how we spend our time and energy, investing it in what truly enriches our lives.

Ultimately, living simply is an act of courage. It requires us to question societal norms and expectations, and to define success on our own terms. In doing so, we often discover that we need far less than we thought to be happy and fulfilled.`,
          contentZh: `在一个不断要求更多的世界里——更多的钱、更多的财产、更多的成就——我们经常忘记简单之美。简单生活的艺术不是关于剥夺；它是关于有意图，在真正重要的事情中找到满足。

简单从放下不必要的东西开始。这并不意味着什么都不拥有，而是只拥有那些有目的且带来快乐的东西。当我们清除掉杂乱——物质的、精神的和情感的——我们就为真正重要的东西创造了空间。

拥有更少的东西有着深刻的自由。当我们不被物质财产所束缚时，我们获得了灵活性和内心的平静。我们不需要不断地维护、保护或担心那些不会对我们的幸福或成长做出贡献的事情。

简单生活也意味着活在当下。当我们不追求下一次获取或成就时，我们可以充分参与当下。我们可以细细品味我们的饭菜，欣赏我们的周围环境，与周围的人建立更深的联系。

简单的实践延伸到我们的关系和承诺。通过对那些不符合我们价值观的活动和义务说不，我们为有意义的联系和追求创造了空间。我们对如何花费时间和精力变得更加挑剔，将其投资在真正丰富我们生活的事情上。

归根结底，简单生活是一种勇敢的行为。它要求我们质疑社会规范和期望，并按照我们自己的方式定义成功。在这样做的过程中，我们经常发现，我们需要比我们想象的要少得多才能快乐和满足。`
        }
      ]
    })

    console.log('Seeding completed!')
  } catch (error) {
    console.error('Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

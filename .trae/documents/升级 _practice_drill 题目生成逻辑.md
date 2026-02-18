## 升级计划：综合模拟试卷结构

### 一、目标
将 `/practice/drill` 的题目从单一结构升级为包含听力、阅读、词汇三大部分的**综合模拟试卷结构**。

### 二、新数据结构（Zod Schema）

```typescript
// 试卷结构
interface DrillExam {
  id: string;
  exam_type: string;
  sections: Section[];
}

// 部分类型
type SectionType = 'listening' | 'reading' | 'vocabulary';

interface Section {
  type: SectionType;
  title: string;
  content?: string;      // 阅读文章/听力原文
  transcript?: string;   // 听力原文（用于朗读）
  questions: Question[];
}

// 题目类型
type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

interface Question {
  id: string;
  type: QuestionType;
  stem: string;
  options?: string[];    // 选择题选项
  answer: string;
  analysis: string;
}
```

### 三、各部分详细规格

#### Section 1: 听力 (Listening)
- **transcript**: 听力原文（英文，约150-200词）
- **questions**: 3道选择题
- 前端提供"播放听力"按钮，使用 `window.speechSynthesis` 朗读

#### Section 2: 阅读 (Reading)
- **content**: 生成的300字英文短文
- **questions**: 
  - 2道判断题（True/False）
  - 2道选择题

#### Section 3: 词汇 (Vocabulary)
- **questions**: 3道填空题（根据上下文填写单词）

### 四、需要修改的文件

1. **后端 Prompt 配置** (`final_fix.json` 或新建工作流)
   - 更新 DeepSeek Prompt，生成符合新结构的 JSON

2. **类型定义文件** (`lib/types/drill.ts` 新建)
   - 定义新的 Zod Schema 和 TypeScript 接口

3. **前端页面** (`app/practice/drill/ExamContent.tsx`)
   - 重构 UI 以支持分 Section 展示
   - 添加听力播放按钮（Text-to-Speech）
   - 支持判断题和填空题的渲染

4. **数据库** (如需)
   - `mock_exams` 表现在使用 `questions` JSON 字段，新结构可以直接兼容

### 五、前端 UI 变更

1. **Section 导航**: 顶部添加 Section 切换标签（听力/阅读/词汇）
2. **听力播放器**: 
   - 播放/暂停按钮
   - 语速调节（可选）
   - 使用 Web Speech API
3. **题目类型支持**:
   - 选择题：单选按钮
   - 判断题：True/False/Not Given 按钮组
   - 填空题：文本输入框

### 六、实现步骤

1. 创建新的类型定义文件
2. 更新后端 Prompt 配置
3. 重构 ExamContent.tsx 组件
4. 添加听力播放功能
5. 测试验证

请确认此计划后，我将开始实施具体的代码修改。
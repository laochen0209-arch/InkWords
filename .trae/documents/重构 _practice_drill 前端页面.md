## 重构计划

### 一、目标

根据新的数据结构（包含 Listening, Reading, Vocabulary 多个 Section），重构前端页面，增加考试氛围和更好的用户体验。

### 二、主要变更

#### 1. Listening 部分渲染

* 不显示原文文本

* 只显示 "🔊 播放听力" 按钮

* 点击后使用 window\.speechSynthesis 朗读 transcript

* 语速 0.9，使用英文语音

#### 2. Reading 部分渲染

* 左侧/上方显示阅读文章

* 右侧/下方显示题目

* 分栏布局方便对照阅读

#### 3. 考试氛围增强

* 顶部悬浮倒计时 Timer

* 默认 20 分钟

* 倒计时结束自动提交试卷

#### 4. 状态管理优化

* 按 section 隔离存储用户答案

* 提交时正确汇总所有部分答案

### 三、需要修改的文件

1. **app/practice/drill/ExamContent.tsx** - 完全重构

   * 新的布局结构

   * 倒计时组件

   * 按 section 渲染不同 UI

   * 改进的状态管理

### 四、实现细节

1. **倒计时组件**

   * 使用 useEffect + setInterval

   * 格式：MM:SS

   * 剩余 5 分钟时变红色警告

   * 结束时自动调用 handleSubmit

2. **Listening Section UI**

   * 大按钮居中显示

   * 播放状态指示

   * 可重复播放

3. **Reading Section UI**

   * 两栏布局（lg:grid-cols-2）

   * 文章区域 sticky 定位

   * 题目区域可滚动

4. **答案存储结构**

   ```typescript
   userAnswers: {
     [sectionId: string]: {
       [questionId: string]: string
     }
   }
   ```

请确认此计划后，我将开始实施具体的代码修改。

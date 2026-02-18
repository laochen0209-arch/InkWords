## 修复目标
为 QuestionPanel 组件添加 matching 类型题目的渲染逻辑，解决答题区域空白问题。

## 修改内容

### 1. 添加 matching 类型渲染块
在写作题渲染逻辑之后，添加：

```javascript
{/* --- 4. 配对题 (Matching) --- */}
{currentQ.type === 'matching' && (
  <div className="space-y-3">
    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg mb-4">
      Please match the following pairs:
    </div>
    {Array.isArray(currentQ.options) && currentQ.options.map((opt, idx) => (
      <div key={idx} className="p-4 bg-white border-2 border-stone-200 rounded-xl shadow-sm text-stone-700 font-medium">
        {opt}
      </div>
    ))}
  </div>
)}
```

### 2. 修复提交按钮状态
修改提交按钮的 disabled 逻辑，对于 matching 类型默认启用：

```javascript
disabled={!selectedOption && currentQ.type !== 'matching'}
```

或者更简单：直接移除 disabled 对 matching 的限制

## 修改位置
文件：app/practice/drill/[examId]/page.tsx
在 essay 类型渲染之后（约第 93 行）添加 matching 类型支持
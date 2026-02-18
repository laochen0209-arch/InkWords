## 修改目标

将正确答案显示格式从 "中文 / 英文" 改为 "英文 / 中文"，中文使用浅灰色区分。

## 当前代码逻辑

```javascript
// 中文在前
<strong>{currentQ.correct_answer_cn || currentQ.correct_answer}</strong>
<span>/ {currentQ.correct_answer}</span>
```

## 修改为

```javascript
// 英文在前，中文在后（浅灰色）
<strong>{currentQ.correct_answer}</strong>
{currentQ.correct_answer_cn && (
  <span className="text-gray-500 font-serif">/ {currentQ.correct_answer_cn}</span>
)}
```

## 修改位置

文件：app/practice/drill

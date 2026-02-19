# Checklist

## Task 1: 修复支付页面字体颜色
- [x] DualCheckoutPanel 主标题使用金黄色 (#D4AF37)
- [x] DualCheckoutPanel 副标题使用金黄色/黄色系
- [x] DualCheckoutPanel 价格文字使用金黄色
- [x] DualCheckoutPanel 按钮文字使用金黄色
- [x] 所有文字在深色背景上清晰可见

## Task 2: 添加练习音效
- [x] 正确音效文件已添加（使用 Web Audio API 生成）
- [x] 错误音效文件已添加（使用 Web Audio API 生成）
- [x] 单词练习正确时播放音效
- [x] 单词练习错误时播放音效
- [x] 句子练习正确时播放音效
- [x] 句子练习错误时播放音效

## Task 3: 句子练习过滤标点符号
- [x] 句子练习验证逻辑过滤标点符号
- [x] 标点符号不显示为输入框（作为静态文本显示）
- [x] 用户输入 "day" 可以匹配 "day,"
- [x] 测试通过："After a long day, I unwind..."

## Task 4: 修复备考中心试卷显示
- [x] API 能正确查询 mock_exams 表
- [x] 前端能正确获取试卷列表
- [x] 不再出现 "TypeError: Failed to fetch" 错误
- [x] 试卷列表正常显示在页面上
- [x] 用户可以正常选择试卷

## Task 5: 修复个人页面统计数据实时更新
- [x] 学习单词后，"已学单词"数量增加
- [x] 学习后，"学习天数"正确更新
- [x] 学习后，"准确率"正确计算
- [x] 返回个人页面时数据自动刷新
- [x] 统计数据与数据库一致

## 通用检查
- [x] 所有修改通过 TypeScript 检查
- [x] 没有引入新的错误
- [x] 代码已提交并推送到远程仓库

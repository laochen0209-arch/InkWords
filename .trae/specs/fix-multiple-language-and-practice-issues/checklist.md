# 修复多语言和练习中心问题 - Verification Checklist

## 首页语言选择修复
- [x] 点击"中文"按钮后，nativeLang 正确设置为 "en"
- [x] 点击"中文"按钮后，targetLang 正确设置为 "zh"
- [x] 点击"英文"按钮后，nativeLang 正确设置为 "zh"
- [x] 点击"英文"按钮后，targetLang 正确设置为 "en"
- [x] 所有语言状态（learningMode、nativeLang、targetLang）都正确同步

## Profile 页面语言修复
- [x] Profile 页面的会员开通内容根据 uiLanguage 动态显示
- [x] 当 uiLanguage 为 "zh" 时显示中文
- [x] 当 uiLanguage 为 "en" 时显示英文
- [x] VIP 特权列表的语言也正确切换

## 备考中心试卷显示
- [x] Practice 页面能正常从 Supabase 获取 mock_exams 数据
- [x] 试卷列表能正常显示
- [x] 切换考试类型时能正确加载对应数据
- [x] 没有无限加载或错误提示
- [x] 控制台没有相关错误日志

## Mistake Bank 和 Exam Papers
- [x] Mistake Bank 功能可以正常访问
- [x] Exam Papers 功能可以正常访问
- [x] 两个功能的数据显示正常
- [x] 没有控制台错误

## 整体验证
- [x] 所有页面的语言逻辑一致
- [x] 没有破坏现有功能
- [x] 代码没有 TypeScript 或 lint 错误
- [x] 在浏览器中测试所有功能正常工作

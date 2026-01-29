## 问题分析
根据用户需求，Study页面的单词练习功能需要完整实现以下UI功能：

### 1. 主展示区
- 大标题：显示中文（meaning字段，如"自动化"）
- 副标题：显示英文（word字段，如"automation"）
- 音标：显示英文音标（pronunciation字段）

### 2. 动态输入区域 (Pinyin Input)
- 使用 pinyin-pro 获取中文的拼音数组
- 根据拼音数组长度渲染对应数量的 `<input>`
- 样式：红色下划线风格，居中
- 输入一个音节后自动跳到下一个框

### 3. 提示系统 (Hint)
- 点击"小眼睛"，在输入框上方显示对应的拼音

### 4. Word Details (底部详情)
- Chinese Meaning: 显示中文
- Pinyin: 显示生成的全拼
- Pronunciation: 显示英文音标
- English: 显示英文单词
- Example: 显示英文例句

## 修复内容
1. 检查并确保API返回正确的字段映射
2. 验证拼音输入框的渲染和自动跳转功能
3. 确保提示按钮（小眼睛）正常工作
4. 确保Word Details区域正确显示所有信息

## 需要检查的文件
1. `app/study/page.tsx` - 确保UI功能完整
2. `app/api/study/data/route.ts` - 确保返回正确的数据格式
3. 确保数据库表字段与接口匹配
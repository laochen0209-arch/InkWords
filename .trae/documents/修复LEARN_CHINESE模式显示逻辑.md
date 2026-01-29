## 修复 LEARN_CHINESE 模式的显示和提示逻辑

### 正确理解需求

* **LEARN_CHINESE 模式（学中文）**：
  * 用户母语是英文
  * **显示中文**（要学习的语言）
  * **让用户输入中文拼音/汉字**
  * UI、注释用**英文**

* **LEARN_ENGLISH 模式（学英文）**：
  * 用户母语是中文
  * **显示英文**（要学习的语言）
  * **让用户输入英文单词**
  * UI、注释用**中文**

### 需要修复的问题

#### 1. 修复单词练习的显示（第414行附近）
**当前：** 显示英文 `isLearnChinese ? word.en : word.zh`
**改为：** 显示中文 `isLearnChinese ? word.zh : word.en`

#### 2. 修复单词输入框提示（第417-420行）
**当前：** 提示显示中文 `isLearnChinese ? word.zh[index] : word.en[index]`
**改为：** 提示显示中文 `isLearnChinese ? word.zh[index] : word.en[index]`（学中文输入中文）

#### 3. 修复句子练习的显示（第551行）
**当前：** 显示英文 `isLearnChinese ? sentence.en : sentence.zh`
**改为：** 显示中文 `isLearnChinese ? sentence.zh : sentence.en`

#### 4. 修复句子输入框的目标文本（第561-566行）
**当前：** 目标是中文 `isLearnChinese ? sentence.zh : sentence.en`
**改为：** 目标是中文 `isLearnChinese ? sentence.zh : sentence.en`（学中文输入中文）

#### 5. 修复拼音提示显示
**问题：** 截图中拼音没有显示
**检查：** 第465-469行的拼音提示逻辑

### 关键修复点

1. **显示区域**：学中文模式应该显示**中文**
2. **输入目标**：学中文模式用户输入**中文拼音/汉字**
3. **提示内容**：学中文模式提示显示**中文答案**
4. **拼音帮助**：学中文模式显示拼音帮助用户发音
# n8n 自动翻译工作流配置

## 概述

此工作流实现：当 n8n 爬取新试卷数据并保存到 Supabase 后，**自动调用翻译 API** 为所有中文解析生成英文版本。

## API 端点

### 1. 翻译单个试卷
```
POST https://your-domain.com/api/auto-translate
Content-Type: application/json

{
  "examId": "试卷ID"
}
```

### 2. 翻译所有试卷
```
POST https://your-domain.com/api/auto-translate
Content-Type: application/json

{
  "processAll": true
}
```

### 3. 获取试卷列表
```
GET https://your-domain.com/api/auto-translate
```

## n8n 工作流配置

### 方案 A：在保存试卷后自动翻译（推荐）

在您的 n8n 工作流中，在 **Supabase 节点之后** 添加以下节点：

#### 1. HTTP Request 节点 - 调用翻译 API

```
节点名称: Auto Translate Exam
节点类型: HTTP Request

配置:
- Method: POST
- URL: https://your-domain.com/api/auto-translate
- Body: JSON
- Body Content:
  {
    "examId": "{{ $json.id }}"
  }

注意: {{ $json.id }} 是从 Supabase 节点返回的试卷 ID
```

#### 2. 完整工作流示例

```
[Trigger] → [n8n 爬取数据] → [Supabase Insert] → [HTTP Request: 调用翻译API] → [结束]
                                                        ↓
                                              [可选: 发送通知]
```

### 方案 B：定时检查并翻译

如果您想定期检查所有试卷并翻译未翻译的题目：

#### 1. Schedule Trigger 节点
```
节点名称: Daily Translation Check
节点类型: Schedule Trigger

配置:
- Mode: Every Day
- Time: 02:00 (凌晨2点执行，避开高峰期)
```

#### 2. HTTP Request 节点
```
节点名称: Translate All Exams
节点类型: HTTP Request

配置:
- Method: POST
- URL: https://your-domain.com/api/auto-translate
- Body: JSON
- Body Content:
  {
    "processAll": true
  }
```

#### 3. 可选：发送通知

```
节点名称: Send Notification
节点类型: Telegram / Email / Slack

配置:
- 发送翻译完成的统计信息
```

## 工作流 JSON 配置（可直接导入）

```json
{
  "name": "Auto Translate Exam Analysis",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "minutes": 60
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://your-domain.com/api/auto-translate",
        "body": {
          "processAll": true
        },
        "options": {}
      },
      "name": "Translate All Exams",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "chatId": "YOUR_CHAT_ID",
        "text": "=✅ 翻译完成！\n\n总试卷数: {{ $json.totalExams }}\n成功: {{ $json.results.filter(r => r.success).length }}\n失败: {{ $json.results.filter(r => !r.success).length }}"
      },
      "name": "Send Telegram Notification",
      "type": "n8n-nodes-base.telegram",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Translate All Exams",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Translate All Exams": {
      "main": [
        [
          {
            "node": "Send Telegram Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 集成到现有爬取工作流

如果您已有 n8n 爬取工作流，只需在保存数据后添加翻译节点：

### 修改后的工作流

```
[HTTP Request: 爬取新闻] 
    ↓
[Function: 格式化数据]
    ↓
[Supabase: Insert Exam] 
    ↓
[HTTP Request: 调用翻译API]  ← 新增节点
    ↓
[IF: 翻译成功?]
    ↓ 是
[Telegram: 发送成功通知]
    ↓ 否
[Telegram: 发送失败通知]
```

### 新增节点配置

在 Supabase Insert 节点后添加：

```
节点名称: Auto Translate
节点类型: HTTP Request

配置:
- Method: POST
- URL: https://your-domain.com/api/auto-translate
- Body: JSON
- Body Content:
  {
    "examId": "={{ $json.id }}"
  }

注意: $json.id 是 Supabase 返回的新插入记录的 ID
```

## 错误处理

建议在翻译节点后添加错误处理：

```
[HTTP Request: 翻译] 
    ↓
[IF: 检查响应]
    条件: {{ $json.success === true }}
    
    ↓ 是                    ↓ 否
[成功处理]              [失败处理]
[记录日志]              [发送告警]
[继续流程]              [重试或跳过]
```

## 注意事项

1. **API 限制**: DeepSeek API 有速率限制，脚本已内置 500ms 延迟
2. **超时处理**: 如果试卷题目很多，可能需要几分钟完成，请设置合适的超时时间
3. **失败重试**: 建议配置 n8n 的错误重试机制
4. **费用控制**: DeepSeek API 按 token 收费，大量翻译时注意费用

## 测试

在部署到生产环境前，先测试 API：

```bash
# 测试翻译单个试卷
curl -X POST https://your-domain.com/api/auto-translate \
  -H "Content-Type: application/json" \
  -d '{"examId": "test-exam-id"}'

# 测试获取试卷列表
curl https://your-domain.com/api/auto-translate
```

## 监控

建议监控以下指标：
- 翻译成功率
- 平均翻译时间
- API 调用次数
- 失败重试次数

可以在 n8n 中添加监控节点，将统计信息发送到您的监控系统。

# 支付页面语言切换与 API 中转重构计划

## 问题概述

### 问题 1：支付页面语言切换
**现象**：支付页面 UI 语言不正确，用户母语是中文但显示英文
**原因**：支付页面没有正确读取用户的语言设置

### 问题 2：国内网络环境阻断 Supabase 请求
**现象**：
- 页面报错 `TypeError: Failed to fetch`
- 浏览器控制台报错 `net::ERR_CONNECTION_CLOSED`
- `[Auth] 获取用户资料失败`
- Supabase 数据表有数据但无法加载

**原因**：国内网络环境（GFW）阻断前端直连 Supabase 的请求

---

## 修复方案

### 修复 1：支付页面语言切换

**文件**：`components/DualCheckoutPanel.tsx`

**修改内容**：
1. 添加语言状态获取逻辑
2. 使用 `TRANSLATIONS` 实现多语言支持
3. 根据用户语言设置显示对应界面

### 修复 2：API 路由中转重构

#### 步骤 1：创建试卷数据 API 路由

**新建文件**：`app/api/practice/exams/route.ts`

```typescript
// API 路由功能：
// 1. 接收 examType 查询参数
// 2. 使用服务端 Supabase 客户端查询 mock_exams 表
// 3. 返回试卷数据
// 4. 做好容错处理，返回规范 JSON 错误信息
```

#### 步骤 2：修改前端请求逻辑

**修改文件**：
- `app/practice/PracticeContent.tsx`
- `app/practice/drill/ExamContent.tsx`

**修改内容**：
- 移除前端直接 import Supabase 客户端的代码
- 改为请求内部 API：`fetch('/api/practice/exams?type=${examType}')`
- 添加容错处理，网络错误时优雅提示用户

---

## 详细实施步骤

### 步骤 1：修复支付页面语言切换

1. 在 `DualCheckoutPanel.tsx` 中添加语言状态
2. 使用 `TRANSLATIONS` 实现支付相关文案的多语言
3. 测试语言切换是否正常工作

### 步骤 2：创建 API 路由

**文件**：`app/api/practice/exams/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // 1. 获取查询参数
    const { searchParams } = new URL(request.url)
    const examType = searchParams.get('type')

    // 2. 验证参数
    if (!examType) {
      return NextResponse.json(
        { error: '缺少考试类型参数' },
        { status: 400 }
      )
    }

    // 3. 使用服务端 Supabase 客户端查询数据
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('mock_exams')
      .select('*')
      .eq('exam_type', examType)
      .order('created_at', { ascending: false })

    // 4. 处理查询错误
    if (error) {
      console.error('[API] 查询试卷失败:', error)
      return NextResponse.json(
        { error: '数据加载失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 5. 返回数据
    return NextResponse.json({ data })

  } catch (error) {
    console.error('[API] 服务器错误:', error)
    return NextResponse.json(
      { error: '网络拥堵，请稍后重试' },
      { status: 500 }
    )
  }
}
```

### 步骤 3：修改前端请求逻辑

**文件**：`app/practice/PracticeContent.tsx`

**修改内容**：
```typescript
// 旧代码：前端直接查询 Supabase
// const { data, error } = await supabase...

// 新代码：请求内部 API
try {
  const response = await fetch(`/api/practice/exams?type=${currentType}`)
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.error || '加载失败')
  }
  
  // 处理数据...
} catch (error) {
  toast.error('网络拥堵，请稍后重试')
}
```

---

## 验证清单

- [ ] 支付页面根据用户语言设置正确显示 UI
- [ ] 试卷列表能够正常加载
- [ ] 点击试卷后能够进入试卷详情页
- [ ] 网络错误时显示友好的错误提示，而不是 `TypeError: Failed to fetch`
- [ ] API 路由返回规范的 JSON 格式
- [ ] 部署后国内用户能够正常访问试卷数据

## 注意事项

1. **API 路由使用服务端 Supabase 客户端**（有 Admin 权限）
2. **前端只请求同源内部 API**，不直接连接 Supabase
3. **做好容错处理**，网络错误时优雅降级
4. **保持原有功能**，重构后不破坏现有逻辑

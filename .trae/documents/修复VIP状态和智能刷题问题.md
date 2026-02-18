## 🔴 发现的问题

### 1. 智能刷题提示开会员问题
**文件**: `app/practice/drill/ExamContent.tsx:191-199`

**原因**:
- 调用 `consumePracticeTicket(1)` 时没有传递 `userId`
- API 返回 401 未授权，显示"练习券不足"

**修复**:
- 使用 `useAuth` 获取 `authUser?.id`
- 调用 `consumePracticeTicket(1, authUser?.id)`
- 如果用户未登录，提示登录

### 2. VIP 状态闪烁/消失问题
**文件**: `app/practice/PracticeContent.tsx`

**原因**:
- 多个 useEffect 同时触发数据获取
- 当 `authUser` 为 null 时（加载中），显示非 VIP 状态
- 30秒定时刷新和认证状态监听冲突

**修复**:
- 添加 `authLoading` 检查，等待认证完成后再获取数据
- 当 `authUser` 为 null 时显示加载状态，而不是默认非 VIP
- 优化 useEffect 依赖，避免重复触发

### 3. 页面刷新问题
**原因**:
- `visibilitychange` 和 `focus` 事件监听触发数据刷新
- 多个页面都有类似逻辑

**修复**:
- 暂时移除这些事件监听（或添加防抖）
- 只在必要时刷新数据

## 修复步骤

1. **修复 ExamContent.tsx** - 添加 userId 参数
2. **修复 PracticeContent.tsx** - 优化 VIP 状态显示逻辑
3. **验证修复** - 检查 TypeScript 编译

请确认后我将立即执行修复。
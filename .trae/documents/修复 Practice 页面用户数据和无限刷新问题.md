## 修复计划

### 问题 1 修复：用户数据不显示

**文件**: `app/practice/PracticeContent.tsx`

1. **修复 `fetchUserStats` useCallback 依赖** (第657行)
   - 添加 `[]` 依赖数组确保函数引用稳定
   - 确保 `currentTypeRef` 正确使用

2. **修复 Auth Effect 依赖问题** (第923-953行)
   - 移除 `fetchUserStats` 依赖，改为在 Effect 内部直接定义函数
   - 或者使用 `useRef` 存储 `fetchUserStats` 避免依赖变化

3. **添加数据获取状态锁**
   - 添加 `isFetchingRef` 防止重复请求
   - 确保同一时间只有一个数据获取操作

### 问题 2 修复：页面不断刷新

1. **修复 Effect 依赖数组** (第953行)
   - 将 `fetchUserStats` 从依赖数组中移除
   - 使用 `useRef` 存储函数引用

2. **添加防抖机制**
   - 在 `fetchUserStats` 中添加防抖，防止短时间内多次调用

3. **优化 Auth 状态监听**
   - 添加事件去重，防止重复触发

### 具体修改步骤

#### 修改 1: 添加数据获取锁和防抖
```typescript
// 在组件顶部添加
const isFetchingRef = useRef(false);
const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

#### 修改 2: 重写 `fetchUserStats`
- 使用 `useRef` 存储函数，避免依赖问题
- 添加获取锁防止重复请求

#### 修改 3: 修复 Auth Effect
- 移除 `fetchUserStats` 依赖
- 使用 ref 调用函数

#### 修改 4: 修复定期刷新 Effect
- 同样移除 `fetchUserStats` 依赖

请确认这个修复方案后，我将开始实施具体的代码修改。
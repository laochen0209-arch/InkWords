# 爱发电支付集成 - 实现计划

## [ ] 任务 1：创建爱发电 Webhook 路由文件
- **优先级**: P0
- **依赖**: 无
- **描述**:
  - 创建 `app/api/webhooks/afdian/route.ts` 文件
  - 实现爱发电 Webhook 的验签逻辑
  - 解析请求数据，提取用户ID和订单状态
  - 使用 Supabase Admin 客户端更新用户 VIP 状态
  - 返回爱发电要求的响应格式
- **成功标准**:
  - Webhook 能够正确接收爱发电的 POST 请求
  - 验签逻辑严密，防止伪造支付
  - 支付成功后能够正确更新用户的 `is_pro` 字段
  - 返回 `{ "ec": 200, "em": "success" }` 格式的响应
- **测试要求**:
  - `programmatic` TR-1.1: 文件创建成功，无语法错误
  - `programmatic` TR-1.2: 能够正确读取环境变量 `AFDIAN_USER_ID` 和 `AFDIAN_TOKEN`
  - `human-judgement` TR-1.3: 代码注释完整，包含文件级、类级和函数级注释
- **备注**: 使用 `createAdminClient` 进行数据库操作，确保有足够权限更新用户数据

## [ ] 任务 2：修改前端支付按钮跳链
- **优先级**: P0
- **依赖**: 无
- **描述**:
  - 修改 `components/DualCheckoutPanel.tsx` 中的国内支付按钮逻辑
  - 点击时使用 `window.open` 跳转到爱发电支付页面
  - 跳转链接必须带上 `remark` 参数传递 userId
  - 使用占位符 `YOUR_AFDIAN_USERNAME` 并添加注释提醒替换
- **成功标准**:
  - 国内支付按钮点击后正确跳转到爱发电页面
  - 链接格式正确，包含 `remark` 参数和 userId
  - 代码中有清晰的注释提醒替换用户名
- **测试要求**:
  - `programmatic` TR-2.1: 按钮点击事件处理正确
  - `programmatic` TR-2.2: 链接格式符合要求
  - `human-judgement` TR-2.3: 注释清晰明确
- **备注**: 保持现有代码风格和结构不变

## [ ] 任务 3：添加环境变量示例
- **优先级**: P1
- **依赖**: 无
- **描述**:
  - 在 `.env.local` 文件中添加爱发电相关的环境变量示例
  - 变量名：`AFDIAN_USER_ID` 和 `AFDIAN_TOKEN`
- **成功标准**:
  - 环境变量示例添加正确
  - 注释清晰说明用途
- **测试要求**:
  - `programmatic` TR-3.1: 环境变量添加成功
  - `human-judgement` TR-3.2: 注释说明清晰

## [ ] 任务 4：Commit 并 Push 代码
- **优先级**: P0
- **依赖**: 任务 1, 任务 2, 任务 3
- **描述**:
  - 将所有更改提交到本地仓库
  - 推送到远程仓库
- **成功标准**:
  - 代码成功提交
  - 代码成功推送到远程仓库
- **测试要求**:
  - `programmatic` TR-4.1: git commit 成功
  - `programmatic` TR-4.2: git push 成功

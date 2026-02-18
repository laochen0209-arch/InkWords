## 问题分析

底部导航栏代码中链接是 `/check-in`，但实际跳转到 `/checkin`。这是因为：
1. 之前配置了 301 重定向 `'/check-in' → '/checkin'`
2. 浏览器缓存了这个重定向
3. 即使用户点击 `/check-in` 链接，浏览器会自动重定向到 `/checkin`

## 解决方案

将文件夹从 `app/check-in/` 重命名为 `app/checkin/`，并更新底部导航栏链接为 `/checkin`。

这样：
1. 链接和文件夹名一致
2. 不需要用户清除浏览器缓存
3. 避免连字符可能带来的问题

需要修改：
1. 重命名文件夹 `app/check-in/` → `app/checkin/`
2. 更新 `components/library/bottom-nav-bar.tsx` 中的链接 `/check-in` → `/checkin`
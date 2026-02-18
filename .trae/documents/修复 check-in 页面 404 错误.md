## 问题分析

在 `next.config.ts` 第 54-62 行有重定向配置：
```typescript
async redirects() {
  return [
    {
      source: '/check-in',
      destination: '/checkin',
      permanent: true,
    },
  ];
}
```

这会将 `/check-in` 重定向到 `/checkin`，但 `/checkin` 页面不存在（文件夹名是 `check-in`），所以出现 404 错误。

## 修复方案

删除 `next.config.ts` 中的重定向配置，让 `/check-in` 正常访问。这样：
1. 导航栏链接 `/check-in` 可以正常访问
2. 页面文件 `app/check-in/page.tsx` 会被正确匹配

修改位置：`next.config.ts` 第 53-62 行
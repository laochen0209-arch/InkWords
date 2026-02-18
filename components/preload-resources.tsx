/**
 * @file preload-resources.tsx
 * @description 资源预加载组件
 * @author InkWords Team
 * @date 2026-02-17
 *
 * 功能：
 * - DNS 预解析
 * - 关键资源预加载
 * - 预连接外部域名
 */

export default function PreloadResources() {
  return (
    <>
      {/* 预连接关键域名 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* 预加载关键背景图片 */}
      <link rel="preload" href="/bg.png" as="image" type="image/png" />
    </>
  )
}

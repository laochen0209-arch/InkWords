## 更新 Tidio 在线客服配置

### 需要修改的内容

**文件: .env.local**
- 将 `NEXT_PUBLIC_TIDIO_PUBLIC_KEY=` 更新为实际的 Public Key: `sppbgbq8hct7otujapa0amyqriga0dms`

### 完成后

1. 重启开发服务器以加载新的环境变量
2. 访问帮助页面点击"联系客服"按钮测试
3. Tidio 后台会检测到代码已安装，激活聊天组件
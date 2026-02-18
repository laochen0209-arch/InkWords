/**
 * @file test-webhook.js
 * @description Lemon Squeezy Webhook 测试脚本
 * @author InkWords Team
 * @date 2026-02-13
 * @version 1.0.0
 * 
 * 使用方法:
 * 1. 确保开发服务器正在运行: npm run dev
 * 2. 运行测试脚本: node test-webhook.js
 * 3. 检查控制台输出和数据库变化
 */

const crypto = require('crypto');

// Webhook Secret - 必须和 .env.local 中的一致
const secret = 'ChenJunZhao.';

// 测试用的 payload
const payload = JSON.stringify({
  meta: { 
    event_name: 'subscription_created' 
  },
  data: {
    id: 'test_sub_123',
    attributes: {
      user_email: 'test@example.com', // 确保 Supabase 中有这个用户
      renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  }
});

// 生成签名
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

console.log('🚀 发送测试 Webhook 请求...');
console.log('📧 测试用户:', 'test@example.com');
console.log('🔑 签名:', signature.substring(0, 20) + '...');
console.log('');

// 发送请求
fetch('http://localhost:3000/api/webhook/lemon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature
  },
  body: payload
})
.then(res => {
  console.log('📊 响应状态:', res.status);
  return res.text();
})
.then(text => {
  console.log('📨 响应内容:', text);
  console.log('');
  console.log('✅ 测试完成！');
  console.log('💡 请检查 Supabase 中 test@example.com 用户的 is_pro 是否已更新为 true');
})
.catch(err => {
  console.error('❌ 请求失败:', err.message);
  console.log('');
  console.log('💡 请确保:');
  console.log('   1. 开发服务器正在运行 (npm run dev)');
  console.log('   2. Webhook Secret 配置正确');
  console.log('   3. Supabase 中有 test@example.com 用户');
});

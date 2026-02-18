/**
 * @file sw.js
 * @description Service Worker - 处理推送通知
 * @author InkWords Team
 * @date 2026-02-08
 */

const CACHE_NAME = 'inkwords-v1';

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker 安装中...');
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 监听推送事件
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送消息:', event);

  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = {
      title: 'InkWords',
      body: event.data?.text() || '您有一条新消息',
    };
  }

  const options = {
    body: data.body || '您有一条新消息',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'InkWords', options)
  );
});

// 监听通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知被点击:', event);
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;

  let url = '/';
  if (action === 'study') {
    url = '/practice';
  } else if (action === 'checkin') {
    url = '/check-in';
  } else if (notificationData.url) {
    url = notificationData.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 如果已有窗口打开，聚焦到该窗口
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// 监听消息事件（从页面发送消息到 SW）
self.addEventListener('message', (event) => {
  console.log('[SW] 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * @file use-notifications.ts
 * @description 浏览器推送通知管理 Hook
 * @author InkWords Team
 * @date 2026-02-08
 */

import { useState, useEffect, useCallback } from 'react';

// 将 VAPID 公钥转换为 Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array;
}

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseNotificationsReturn {
  state: NotificationState;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // 检查浏览器支持
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator && 
        'PushManager' in window &&
        'Notification' in window;
      
      setState(prev => ({
        ...prev,
        isSupported: supported,
        permission: supported ? Notification.permission : 'default',
      }));
    };

    checkSupport();
    checkSubscriptionStatus();
  }, []);

  // 检查订阅状态
  const checkSubscriptionStatus = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
      }));
    } catch (error) {
      console.error('[Notifications] 检查订阅状态失败:', error);
    }
  }, []);

  // 请求通知权限
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: '您的浏览器不支持推送通知' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false,
      }));

      return permission === 'granted';
    } catch (error) {
      console.error('[Notifications] 请求权限失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '请求通知权限失败',
      }));
      return false;
    }
  }, [state.isSupported]);

  // 订阅推送
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: '您的浏览器不支持推送通知' }));
      return false;
    }

    // 先请求权限
    const permission = await requestPermission();
    if (!permission) {
      setState(prev => ({ ...prev, error: '需要通知权限才能订阅' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 【修复】先检查 Service Worker 文件是否存在
      const swCheck = await fetch('/sw.js', { method: 'HEAD' });
      if (!swCheck.ok) {
        console.warn('[Notifications] Service Worker 文件不存在，跳过推送订阅');
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null, // 不显示错误，因为这不是关键功能
        }));
        return false;
      }

      // 注册 Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 【修复】检查 API 是否可用
      const apiCheck = await fetch('/api/notifications/vapid-public-key', { method: 'HEAD' });
      if (!apiCheck.ok) {
        console.warn('[Notifications] 推送通知 API 不可用，跳过订阅');
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null, // 不显示错误，因为这不是关键功能
        }));
        return false;
      }

      // 获取 VAPID 公钥
      const response = await fetch('/api/notifications/vapid-public-key');
      if (!response.ok) {
        throw new Error('获取 VAPID 公钥失败');
      }
      const { publicKey } = await response.json();

      // 订阅推送
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });

      // 保存订阅到服务器
      const saveResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!saveResponse.ok) {
        // 【修复】解析后端返回的错误信息
        let errorMessage = '保存订阅信息失败';
        try {
          const errorData = await saveResponse.json();
          errorMessage = errorData.error || errorData.message || `保存订阅信息失败 (${saveResponse.status})`;
          console.error('[Notifications] 服务器返回错误:', errorData);
        } catch (parseError) {
          console.error('[Notifications] 无法解析错误响应:', parseError);
          errorMessage = `保存订阅信息失败 (${saveResponse.status})`;
        }
        throw new Error(errorMessage);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      // 【修复】只在控制台输出错误，不显示在 UI 上
      console.error('[Notifications] 订阅失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        // 【修复】不显示错误信息，避免打扰用户
        error: null,
      }));
      return false;
    }
  }, [state.isSupported, requestPermission]);

  // 取消订阅
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 取消订阅
        await subscription.unsubscribe();

        // 通知服务器删除订阅
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('[Notifications] 取消订阅失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '取消订阅失败',
      }));
      return false;
    }
  }, [state.isSupported]);

  // 发送测试通知
  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!state.isSupported || !state.isSubscribed) {
      setState(prev => ({ ...prev, error: '请先订阅通知' }));
      return;
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'InkWords 测试通知',
          body: '恭喜！您已成功启用推送通知 🎉',
          icon: '/icon-192x192.png',
        }),
      });

      if (!response.ok) {
        throw new Error('发送测试通知失败');
      }
    } catch (error) {
      console.error('[Notifications] 发送测试通知失败:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '发送测试通知失败',
      }));
    }
  }, [state.isSupported, state.isSubscribed]);

  return {
    state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

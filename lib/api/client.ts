/**
 * @file client.ts
 * @description 统一 API 客户端封装
 * @author InkWords Team
 * @date 2026-02-11
 */

import { createBrowserClient } from '@/lib/supabase/client';

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// API 错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  skipAuth?: boolean;
}

/**
 * 获取 Supabase 会话 token
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const supabase = createBrowserClient();

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * 统一 API 请求函数
 */
export async function apiClient<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, skipAuth = false, ...requestConfig } = config;
  
  // 构建 URL
  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // 构建请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...requestConfig.headers,
  };

  // 添加认证头
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url.toString(), {
      ...requestConfig,
      headers,
    });

    // 解析响应
    let data: ApiResponse<T>;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text };
    }

    // 处理错误
    if (!response.ok) {
      throw new ApiError(
        data.error || `请求失败: ${response.status}`,
        response.status,
        data.code
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络错误或其他错误
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败',
      0
    );
  }
}

/**
 * GET 请求
 */
export function get<T = any>(endpoint: string, config?: RequestConfig) {
  return apiClient<T>(endpoint, { ...config, method: 'GET' });
}

/**
 * POST 请求
 */
export function post<T = any>(
  endpoint: string,
  body?: any,
  config?: RequestConfig
) {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 请求
 */
export function put<T = any>(
  endpoint: string,
  body?: any,
  config?: RequestConfig
) {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 请求
 */
export function del<T = any>(endpoint: string, config?: RequestConfig) {
  return apiClient<T>(endpoint, { ...config, method: 'DELETE' });
}

/**
 * 用户相关 API
 */
export const userApi = {
  /**
   * 获取当前用户信息
   */
  getMe: () => get('/api/user/me'),
  
  /**
   * 更新用户信息
   */
  update: (data: any) => put('/api/user/update', data),
  
  /**
   * 修改密码
   */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    post('/api/user/change-password', data),
  
  /**
   * 获取用户统计
   */
  getStats: () => get('/api/user/stats'),
};

/**
 * 学习相关 API
 */
export const studyApi = {
  /**
   * 获取学习数据
   */
  getData: (category: string) =>
    get('/api/study/data', { params: { category } }),
  
  /**
   * 获取仪表盘数据
   */
  getDashboard: () => get('/api/dashboard'),
};

/**
 * 支付相关 API
 */
export const paymentApi = {
  /**
   * 激活 VIP
   */
  activateVip: () => post('/api/payment/activate-vip'),
  
  /**
   * 创建支付会话
   */
  createCheckout: (data: { planType: string; successUrl: string; cancelUrl: string }) =>
    post('/api/payment/create-checkout', data),
};

/**
 * 通知相关 API
 */
export const notificationApi = {
  /**
   * 发送通知
   */
  send: (data: {
    title: string;
    body: string;
    userId?: string;
    icon?: string;
    url?: string;
  }) => post('/api/notifications/send', data),
  
  /**
   * 订阅推送
   */
  subscribe: (subscription: PushSubscription) =>
    post('/api/notifications/subscribe', { subscription }),
  
  /**
   * 取消订阅
   */
  unsubscribe: (endpoint: string) =>
    post('/api/notifications/unsubscribe', { endpoint }),
};

/**
 * 练习相关 API
 */
export const practiceApi = {
  /**
   * 获取练习数据
   */
  getData: (type: string) => get(`/api/practice/${type}`),
  
  /**
   * 提交练习结果
   */
  submitResult: (data: any) => post('/api/practice/submit', data),
};

/**
 * 文库相关 API
 */
export const libraryApi = {
  /**
   * 获取文章列表
   */
  getArticles: (params?: { category?: string; page?: string; limit?: string }) =>
    get('/api/articles', { params }),
  
  /**
   * 获取文章详情
   */
  getArticle: (id: string) => get(`/api/articles/${id}`),
};

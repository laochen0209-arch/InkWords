/**
 * Stripe 配置
 * 
 * 文件说明：
 * 存储 Stripe 价格 ID 和定价信息
 */

/**
 * Stripe Price IDs
 * 从环境变量或硬编码获取
 */
export const STRIPE_PRICE_IDS = {
  /**
   * 月度会员 Price ID
   * $3.99 / 月
   */
  MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_1Sx8ky46GMSOGNUeo2dErMKI',

  /**
   * 年度会员 Price ID
   * $39.99 / 年 (立省 16%)
   */
  YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_1Sx8oX46GMSOGNUer6pZVorJ',
}

/**
 * 定价显示配置
 */
export const PRICING_CONFIG = {
  monthly: {
    id: 'monthly',
    name: '月度会员',
    nameEn: 'Monthly',
    price: 3.99,
    priceDisplay: '$3.99',
    period: '/ 月',
    periodEn: '/ month',
    description: '灵活订阅，随时取消',
    descriptionEn: 'Flexible subscription, cancel anytime',
    features: [
      '无限修习',
      '词书全库',
      '离线缓存',
      '专属客服',
      '优先支持'
    ],
    featuresEn: [
      'Unlimited Learning',
      'Full Vocabulary Library',
      'Offline Access',
      'Dedicated Support',
      'Priority Support'
    ],
    priceId: STRIPE_PRICE_IDS.MONTHLY,
  },
  yearly: {
    id: 'yearly',
    name: '年度会员',
    nameEn: 'Yearly',
    price: 39.99,
    priceDisplay: '$39.99',
    period: '/ 年',
    periodEn: '/ year',
    description: '一次订阅，全年无忧',
    descriptionEn: 'One subscription, worry-free all year',
    badge: '超值推荐',
    badgeEn: 'Best Value',
    savings: '立省 16%',
    savingsEn: 'Save 16%',
    features: [
      '无限修习',
      '词书全库',
      '离线缓存',
      '专属客服',
      '优先支持',
      '年度专享优惠'
    ],
    featuresEn: [
      'Unlimited Learning',
      'Full Vocabulary Library',
      'Offline Access',
      'Dedicated Support',
      'Priority Support',
      'Yearly Exclusive Deals'
    ],
    priceId: STRIPE_PRICE_IDS.YEARLY,
  },
}

/**
 * 获取价格配置
 */
export function getPricingConfig(plan: 'monthly' | 'yearly') {
  return PRICING_CONFIG[plan]
}

/**
 * 获取所有价格配置
 */
export function getAllPricingConfigs() {
  return Object.values(PRICING_CONFIG)
}

/**
 * 使用翻译字典的Hook
 * 提供便捷的翻译访问方式
 */

import { useLanguage } from "@/lib/contexts/language-context"
import { getTranslations, type LearningMode } from "@/lib/i18n"

/**
 * 使用翻译字典的Hook
 * 提供便捷的翻译访问方式
 */
export function useTranslations() {
  const { learningMode } = useLanguage()
  
  return getTranslations(learningMode)
}

/**
 * 获取特定翻译的Hook
 */
export function useT() {
  const { t } = useLanguage()
  
  return t
}

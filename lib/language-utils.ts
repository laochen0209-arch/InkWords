export type NativeLang = "zh" | "en"
export type TargetLang = "zh" | "en"

export interface LanguageSettings {
  nativeLang: NativeLang
  targetLang: TargetLang
}

export function getLanguageSettings(): LanguageSettings {
  const nativeLang = (localStorage.getItem("inkwords_native_lang") as NativeLang) || "zh"
  const targetLang = (localStorage.getItem("inkwords_target_lang") as TargetLang) || "en"
  return { nativeLang, targetLang }
}

export function getUILanguage(nativeLang: NativeLang): "zh" | "en" {
  return nativeLang
}

export function getContentLanguage(targetLang: TargetLang): "zh" | "en" {
  return targetLang
}

export function getSpeechLanguage(targetLang: TargetLang): string {
  return targetLang === "en" ? "en-US" : "zh-CN"
}
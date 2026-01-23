/**
 * 用户数据管理工具
 * 用于管理用户数据的持久化存储
 */

export interface UserData {
  nickname: string
  avatarUrl: string
  phoneNumber: string
  isPhoneBound: boolean
  userId: string
}

const USER_DATA_KEY = "inkwords_user_data"

const DEFAULT_USER_DATA: UserData = {
  nickname: "墨语学习者",
  avatarUrl: "",
  phoneNumber: "138****8888",
  isPhoneBound: true,
  userId: "INK20240001",
}

export function getUserData(): UserData {
  if (typeof window === "undefined") {
    return DEFAULT_USER_DATA
  }
  try {
    const stored = localStorage.getItem(USER_DATA_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to parse user data:", error)
  }
  return DEFAULT_USER_DATA
}

export function setUserData(data: Partial<UserData> | Partial<{ name: string; avatar: string; id: string }>): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    const currentData = getUserData()
    
    let updatedData: Partial<UserData> = {}
    if ('name' in data) {
      updatedData.nickname = (data as { name: string }).name
    }
    if ('avatar' in data) {
      updatedData.avatarUrl = (data as { avatar: string }).avatar
    }
    if ('id' in data) {
      updatedData.userId = (data as { id: string }).id
    }
    
    const finalData = { ...currentData, ...updatedData }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(finalData))
    
    if (typeof window !== 'undefined') {
      const event = new StorageEvent('storage', {
        key: USER_DATA_KEY,
        newValue: JSON.stringify(finalData),
        oldValue: JSON.stringify(currentData)
      })
      window.dispatchEvent(event)
    }
  } catch (error) {
    console.error("Failed to save user data:", error)
  }
}

export function clearUserData(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(USER_DATA_KEY)
  } catch (error) {
    console.error("Failed to clear user data:", error)
  }
}

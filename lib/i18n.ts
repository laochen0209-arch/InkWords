/**
 * 全站国际化字典
 * 包含所有静态文案的中英文版本
 */

export type LearningMode = 'LEARN_ENGLISH' | 'LEARN_CHINESE'

export const TRANSLATIONS = {
  LEARN_ENGLISH: {
    // 导航栏
    nav: {
      home: "首页",
      practice: "备考中心",
      study: "学习",
      library: "文库",
      settings: "设置",
      profile: "我的",
      notifications: "通知"
    },
    
    // 认证相关
    auth: {
      login: "登录",
      register: "注册",
      logout: "退出登录",
      logoutConfirm: "确定要退出登录吗？",
      logoutSuccess: "退出登录成功",
      email_label: "邮箱",
      password_label: "密码",
      login_btn: "登录",
      no_account: "还没有账号？",
      login_title: "欢迎回来",
      welcome_back: "欢迎回来",
      username_label: "用户名",
      confirm_password_label: "确认密码",
      register_btn: "注册",
      register_title: "注册",
      have_account: "已有账号？",
      login_now: "立即登录",
      register_now: "立即注册",
      // 邮箱验证码相关
      verification_code: "验证码",
      send_code: "获取验证码",
      email_invalid: "请输入有效的邮箱地址",
      code_sent: "验证码已发送",
      fill_all_fields: "请填写所有必填字段",
      password_too_short: "密码长度至少为6位",
      password_not_match: "两次输入的密码不一致",
      register_success: "注册成功",
      registering: "注册中...",
      forgot_password: "忘记密码？"
    },
    
    // 欢迎页
    welcome: {
      start: "开始学习",
      slogan: "静心修习",
      selectLanguage: "选择您的学习目标",
      learnEnglish: "学习英语",
      learnChinese: "学习中文",
      footerText: "© 2026 墨语. 保留所有权利."
    },

    // 仪表盘
    dashboard: {
      greeting: {
        morning: "早安",
        afternoon: "午安",
        evening: "晚安"
      },
      checkIn: {
        title: "每日签到",
        streak: "连续签到",
        days: "天",
        button: "立即签到",
        checked: "今日已签",
        success: "签到成功！"
      },
      stats: {
        title: "今日进度",
        timeSpent: "学习时长",
        wordsLearned: "已学单词",
        sentencesMastered: "掌握句子",
        minutes: "分钟"
      },
      quickActions: {
        continuePractice: "继续修习",
        reviewVocabulary: "生词复习",
        startPractice: "开始修习"
      }
    },

    // 学习页
    practice: {
      title: "词句练习",
      words: "词语",
      sentences: "句子",
      observe: "观摩",
      write: "默写",
      dictation: "观摩默写",
      tabs: {
        word: "词语",
        sentence: "句子"
      },
      categories: {
        daily: "日常生活",
        finance: "金融",
        travel: "旅游",
        business: "商务",
        technology: "科技",
        culture: "文化"
      },
      placeholder: {
        enterEnglish: "请输入英文单词...",
        enterPinyin: "请输入拼音...",
        enterTranslation: "请输入英文翻译...",
        enterChinese: "请输入中文翻译..."
      },
      success: {
        correct: "正确！",
        incorrect: "再试一次"
      },
      progress: "进度",
      learned: "已学"
    },
    
    // 文库页
    library: {
      classics: "经典文库",
      news: "新闻阅读",
      novels: "小说阅读",
      filter: "筛选",
      addToShelf: "已加入书架",
      read: "阅读"
    },
    
    // 设置页
    settings: {
      title: "设置",
      subtitle: "个性化你的墨语体验",
      languages: "语言设置",
      appearance: "外观设置",
      account: "账号设置",
      help: "帮助与反馈",
      about: "关于墨语",
      nativeLanguage: "我的母语",
      targetLanguage: "学习语言",
      saved: "学习方向已切换",
      items: {
        account: {
          title: "账号设置",
          description: "管理个人信息、绑定手机号"
        },
        password: {
          title: "登录密码",
          description: "修改密码、保障账号安全"
        },
        notification: {
          title: "通知设置",
          description: "推送提醒、签到通知"
        },
        study: {
          title: "学习设置",
          description: "每日目标、复习频率"
        },
        appearance: {
          title: "外观设置",
          description: "主题切换、字体大小"
        },
        about: {
          title: "关于墨语",
          description: "版本信息、用户协议"
        }
      },
      changePassword: {
        title: "修改密码",
        subtitle: "验证身份后设置新密码",
        currentEmail: "当前邮箱",
        verificationCode: "验证码",
        newPassword: "新密码",
        confirmPassword: "确认新密码",
        sendCode: "发送验证码",
        confirmChange: "确认修改",
        cancel: "取消",
        passwordPlaceholder: "请输入新密码（至少6位）",
        confirmPlaceholder: "请再次输入新密码",
        codePlaceholder: "请输入6位验证码"
      }
    },
    
    // 生词本页
    vocabulary: {
      title: "生词本",
      totalWords: "共收藏",
      masteredWords: "已掌握",
      words: "词",
      empty: "暂无收藏的单词",
      addHint: "在阅读时点击单词即可收藏",
      play: "播放发音",
      remove: "移除",
      master: "已掌握"
    },
    
    // 个人资料页
    profile: {
      title: "我的",
      vip: "会员",
      vipDesc: "解锁所有会员权益",
      subscribe: "立即开通",
      avatarAlt: "用户头像",
      defaultNickname: "墨语用户",
      idLabel: "账号",
      stats: {
        wordsLearned: "已学单词",
        studyDays: "学习天数",
        accuracy: "准确率"
      }
    },
    
    // 订阅页
    subscription: {
      title: "开通墨语会员",
      subtitle: "限时特惠，永久享受",
      badge: "限时特惠",
      priceLabel: "永久会员",
      priceSub: "一次开通，终身受益",
      features: {
        unlimited: "无限修习",
        fullLibrary: "词书全库",
        offline: "离线缓存",
        support: "专属客服",
        priority: "优先支持"
      },
      subscribeBtn: "立即开通",
      successTitle: "恭喜您，开通成功！",
      successMessage: "您已解锁所有会员权益",
      backHome: "返回首页"
    },
    
    // 阅读器
    reader: {
      addToVocabulary: "Added to Vocabulary",
      fontSettings: "Font Settings",
      play: "Play",
      loading: "Loading...",
      loadingFailed: "Loading Failed",
      originalText: "Original Text",
      translation: "Translation",
      vocabulary: "Vocabulary",
      noVocabulary: "No vocabulary yet",
      liked: "Liked",
      like: "Like",
      share: "Share",
      fontSize: {
        base: "Standard",
        lg: "Large",
        xl: "Extra Large"
      },
      fontFamily: {
        serif: "Serif",
        kaiti: "Kaiti"
      },
      close: "Close",
      displayMode: {
        both: "Bilingual",
        chinese: "Chinese Only",
        english: "English Only"
      }
    },
    
    // 通用
    common: {
      cancel: "取消",
      save: "保存",
      close: "关闭",
      confirm: "确认",
      back: "返回",
      loading: "加载中...",
      processing: "处理中...",
      user: "修行者",
      optional: "可选",
      success: "成功"
    }
  },

  LEARN_CHINESE: {
    // 导航栏
    nav: {
      home: "Home",
      practice: "Test Center",
      study: "Study",
      library: "Library",
      settings: "Settings",
      profile: "Profile",
      notifications: "Notifications"
    },
    
    // 认证相关
    auth: {
      login: "Log In",
      register: "Sign Up",
      logout: "Logout",
      logoutConfirm: "Are you sure you want to logout?",
      logoutSuccess: "Logout successful",
      email_label: "Email",
      password_label: "Password",
      login_btn: "Login",
      no_account: "Don't have an account?",
      login_title: "Welcome Back",
      welcome_back: "Welcome Back",
      username_label: "Username",
      confirm_password_label: "Confirm Password",
      register_btn: "Sign Up",
      register_title: "Sign Up",
      have_account: "Already have an account?",
      login_now: "Log In Now",
      register_now: "Sign Up Now",
      // 邮箱验证码相关
      verification_code: "Verification Code",
      send_code: "Get Code",
      email_invalid: "Please enter a valid email address",
      code_sent: "Verification code sent",
      fill_all_fields: "Please fill in all required fields",
      password_too_short: "Password must be at least 6 characters",
      password_not_match: "Passwords do not match",
      register_success: "Registration successful",
      registering: "Registering...",
      forgot_password: "Forgot password?"
    },
    
    // 欢迎页
    welcome: {
      start: "Start Learning",
      slogan: "Cultivate with peace",
      selectLanguage: "Select your learning goal",
      learnEnglish: "Learn English",
      learnChinese: "Learn Chinese",
      footerText: "© 2024 InkWords. All rights reserved."
    },

    // 仪表盘
    dashboard: {
      greeting: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening"
      },
      checkIn: {
        title: "Daily Check-in",
        streak: "Streak",
        days: "days",
        button: "Check In",
        checked: "Checked In Today",
        success: "Check-in successful!"
      },
      stats: {
        title: "Today's Progress",
        timeSpent: "Time Spent",
        wordsLearned: "Words Learned",
        sentencesMastered: "Sentences Mastered",
        minutes: "min"
      },
      quickActions: {
        continuePractice: "Continue Practice",
        reviewVocabulary: "Review Vocabulary",
        startPractice: "Start Practice"
      }
    },

    // 学习页
    practice: {
      title: "Word & Sentence Practice",
      words: "Words",
      sentences: "Sentences",
      observe: "Observe",
      write: "Write",
      dictation: "Observe & Write",
      tabs: {
        word: "Word Practice",
        sentence: "Sentence Practice"
      },
      categories: {
        daily: "Daily Life",
        finance: "Finance",
        travel: "Travel",
        business: "Business",
        technology: "Technology",
        culture: "Culture"
      },
      placeholder: {
        enterEnglish: "Please enter English word...",
        enterPinyin: "Please enter Pinyin...",
        enterTranslation: "Please enter English translation...",
        enterChinese: "Please enter Chinese translation..."
      },
      success: {
        correct: "Correct!",
        incorrect: "Try again"
      },
      progress: "Progress",
      learned: "Learned"
    },
    
    // 文库页
    library: {
      classics: "Classics",
      news: "News Reading",
      novels: "Novels",
      filter: "Filter",
      addToShelf: "Added to Shelf",
      read: "Read"
    },
    
    // 设置页
    settings: {
      title: "Settings",
      subtitle: "Personalize your InkWords experience",
      languages: "Language Settings",
      appearance: "Appearance",
      account: "Account Settings",
      help: "Help & Feedback",
      about: "About InkWords",
      nativeLanguage: "My Native Language",
      targetLanguage: "Target Language",
      saved: "Learning direction switched",
      items: {
        account: {
          title: "Account Settings",
          description: "Manage personal info, link phone number"
        },
        password: {
          title: "Password",
          description: "Change password, secure your account"
        },
        notification: {
          title: "Notifications",
          description: "Push reminders, check-in alerts"
        },
        study: {
          title: "Study Settings",
          description: "Daily goals, review frequency"
        },
        appearance: {
          title: "Appearance",
          description: "Theme switching, font size"
        },
        about: {
          title: "About InkWords",
          description: "Version info, user agreement"
        }
      },
      changePassword: {
        title: "Change Password",
        subtitle: "Verify identity to set new password",
        currentEmail: "Current Email",
        verificationCode: "Verification Code",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        sendCode: "Send Code",
        confirmChange: "Confirm Change",
        cancel: "Cancel",
        passwordPlaceholder: "Enter new password (at least 6 characters)",
        confirmPlaceholder: "Enter new password again",
        codePlaceholder: "Enter 6-digit code"
      }
    },
    
    // 生词本页
    vocabulary: {
      title: "Vocabulary",
      totalWords: "Total Saved",
      masteredWords: "Mastered",
      words: "words",
      empty: "No saved words yet",
      addHint: "Tap words while reading to save them",
      play: "Play pronunciation",
      remove: "Remove",
      master: "Mastered"
    },
    
    // 个人资料页
    profile: {
      title: "Profile",
      vip: "Premium",
      vipDesc: "Unlock all premium features",
      subscribe: "Subscribe Now",
      avatarAlt: "User Avatar",
      defaultNickname: "InkWords User",
      idLabel: "ID",
      stats: {
        wordsLearned: "Words Learned",
        studyDays: "Study Days",
        accuracy: "Accuracy"
      }
    },
    
    // 订阅页
    subscription: {
      title: "Unlock InkWords Premium",
      subtitle: "Limited Time Offer, Lifetime Access",
      badge: "Limited Time",
      priceLabel: "Lifetime Premium",
      priceSub: "One-time payment, lifetime benefits",
      features: {
        unlimited: "Unlimited Learning",
        fullLibrary: "Full Vocabulary Library",
        offline: "Offline Access",
        support: "Dedicated Support",
        priority: "Priority Support"
      },
      subscribeBtn: "Subscribe Now",
      successTitle: "Congratulations!",
      successMessage: "You have unlocked all premium features",
      backHome: "Back to Home"
    },
    
    // 阅读器
    reader: {
      addToVocabulary: "Added to Vocabulary",
      fontSettings: "Font Settings",
      play: "Play",
      loading: "Loading...",
      loadingFailed: "Loading Failed",
      originalText: "Original Text",
      translation: "Translation",
      vocabulary: "Vocabulary",
      noVocabulary: "No vocabulary yet",
      liked: "Liked",
      like: "Like",
      share: "Share",
      fontSize: {
        base: "Standard",
        lg: "Large",
        xl: "Extra Large"
      },
      fontFamily: {
        serif: "Serif",
        kaiti: "Kaiti"
      },
      close: "Close",
      displayMode: {
        both: "Bilingual",
        chinese: "Chinese Only",
        english: "English Only"
      }
    },
    
    // 通用
    common: {
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      confirm: "Confirm",
      back: "Back",
      loading: "Loading...",
      processing: "Processing...",
      user: "Cultivator",
      optional: "Optional",
      success: "Success"
    }
  }
} as const

/**
 * 获取当前模式的翻译
 */
export function getTranslations(mode: LearningMode) {
  return TRANSLATIONS[mode]
}

/**
 * @file drill.ts
 * @description 智能刷题模块类型定义
 * @author InkWords Team
 * @date 2026-02-01
 */

/**
 * 题目类型枚举
 */
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

/**
 * Section 类型枚举
 */
export type SectionType = 'listening' | 'reading' | 'vocabulary';

/**
 * 题目接口
 * 综合模拟试卷中的单个题目
 */
export interface Question {
  /** 题目唯一标识 */
  id: string;
  
  /** 题目类型 */
  type: QuestionType;
  
  /** 题目题干 (旧字段，兼容使用) */
  stem?: string;
  
  /** 题目题干 (新字段，优先使用) */
  content?: string;
  
  /** 选项（选择题使用） */
  options?: string[];
  
  /** 正确答案 */
  answer: string;
  
  /** 答案解析（旧字段，兼容使用） */
  analysis?: string;
  
  /** 答案解析（中文） */
  analysis_cn?: string;
  
  /** 答案解析（英文） */
  analysis_en?: string;
}

/**
 * 试卷部分接口
 * 包含听力、阅读、词汇三个部分
 */
export interface Section {
  /** Section 类型 */
  type: SectionType;
  
  /** Section 标题 */
  title: string;
  
  /** 阅读文章或听力原文内容 */
  content?: string;
  
  /** 听力原文（专门用于朗读） */
  transcript?: string;
  
  /** 该部分的题目列表 */
  questions: Question[];
}

/**
 * 智能刷题试卷接口
 * 完整的综合模拟试卷结构
 */
export interface DrillExam {
  /** 试卷唯一标识 */
  id: string;
  
  /** 考试类型：IELTS/TOEFL/CET-4/CET-6/HSK/BCT/TOCFL */
  exam_type: string;
  
  /** 试卷各部分数组 */
  sections: Section[];
  
  /** 创建时间 */
  created_at?: string;
}

/**
 * 用户答案记录接口
 */
export interface UserAnswers {
  /** Section 索引 -> 题目索引 -> 答案 */
  [sectionIndex: number]: {
    [questionIndex: number]: string;
  };
}

/**
 * 题目类型显示配置
 */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: '选择题',
  true_false: '判断题',
  fill_blank: '填空题'
};

/**
 * Section 类型显示配置
 */
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  listening: '听力理解',
  reading: '阅读理解',
  vocabulary: '词汇运用'
};

/**
 * Section 类型图标配置（用于前端展示）
 */
export const SECTION_TYPE_ICONS: Record<SectionType, string> = {
  listening: 'Headphones',
  reading: 'BookOpen',
  vocabulary: 'Type'
};

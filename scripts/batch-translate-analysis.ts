/**
 * @file batch-translate-analysis.ts
 * @description 批量翻译题目解析 - 将中文解析翻译成英文
 * @author InkWords Team
 * @date 2026-02-08
 * 
 * 使用方法:
 * 1. 确保设置了 DEEPSEEK_API_KEY 环境变量
 * 2. 运行: npx ts-node scripts/batch-translate-analysis.ts
 */

import { createClient } from '@supabase/supabase-js';

// 配置
const BATCH_SIZE = 5; // 每批处理的题目数量
const DELAY_MS = 1000; // API 调用间隔（毫秒）

// 检测文本是否包含中文字符
const containsChinese = (text: string): boolean => {
  if (!text) return false;
  return /[\u4e00-\u9fa5]/.test(text);
};

// 调用 DeepSeek API 翻译
const translateWithDeepSeek = async (text: string): Promise<string> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }

  const prompt = `请将以下中文解析翻译成英文，保持专业性和准确性，只返回翻译结果：

${text}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的教育内容翻译助手，擅长将中文考试解析翻译成英文。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || text;
};

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 处理 mock_exams 表
const processMockExams = async (supabase: any) => {
  console.log('📚 开始处理 mock_exams 表...\n');

  // 获取所有 mock_exams
  const { data: exams, error } = await supabase
    .from('mock_exams')
    .select('id, exam_type, sections');

  if (error) {
    console.error('❌ 获取 mock_exams 失败:', error);
    return;
  }

  console.log(`📊 找到 ${exams.length} 份试卷\n`);

  let totalQuestions = 0;
  let translatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const exam of exams) {
    console.log(`📝 处理试卷: ${exam.id} (${exam.exam_type})`);
    
    if (!exam.sections || !Array.isArray(exam.sections)) {
      console.log('   ⚠️ 没有 sections 数据，跳过\n');
      continue;
    }

    let examModified = false;
    const updatedSections = [];

    for (const section of exam.sections) {
      if (!section.questions || !Array.isArray(section.questions)) {
        updatedSections.push(section);
        continue;
      }

      const updatedQuestions = [];

      for (const question of section.questions) {
        totalQuestions++;

        // 检查是否需要翻译
        if (!question.analysis || !containsChinese(question.analysis)) {
          // 没有中文解析，跳过
          updatedQuestions.push(question);
          skippedCount++;
          continue;
        }

        if (question.analysis_en && question.analysis_en.trim() !== '') {
          // 已经有英文解析，跳过
          console.log(`   ⏭️  题目 ${question.id} 已有英文解析，跳过`);
          updatedQuestions.push(question);
          skippedCount++;
          continue;
        }

        try {
          console.log(`   🔄 翻译题目 ${question.id}...`);
          const translatedText = await translateWithDeepSeek(question.analysis);
          
          updatedQuestions.push({
            ...question,
            analysis_en: translatedText
          });
          
          translatedCount++;
          examModified = true;
          
          console.log(`   ✅ 翻译完成`);
          
          // 延迟避免 API 限制
          await delay(DELAY_MS);
          
        } catch (err) {
          console.error(`   ❌ 翻译失败:`, err);
          updatedQuestions.push(question);
          errorCount++;
        }
      }

      updatedSections.push({
        ...section,
        questions: updatedQuestions
      });
    }

    // 如果有修改，更新数据库
    if (examModified) {
      const { error: updateError } = await supabase
        .from('mock_exams')
        .update({ sections: updatedSections })
        .eq('id', exam.id);

      if (updateError) {
        console.error(`   ❌ 更新试卷 ${exam.id} 失败:`, updateError);
        errorCount++;
      } else {
        console.log(`   💾 试卷 ${exam.id} 已更新\n`);
      }
    } else {
      console.log(`   ⏭️  试卷 ${exam.id} 无需更新\n`);
    }
  }

  console.log('\n📊 mock_exams 处理完成:');
  console.log(`   总题目数: ${totalQuestions}`);
  console.log(`   已翻译: ${translatedCount}`);
  console.log(`   已跳过: ${skippedCount}`);
  console.log(`   失败: ${errorCount}\n`);
};

// 处理 questions 表（Exam Papers 使用）
const processQuestions = async (supabase: any) => {
  console.log('📚 开始处理 questions 表...\n');

  // 获取所有需要翻译的题目
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, explanation, explanation_en, explanation_cn')
    .not('explanation', 'is', null);

  if (error) {
    console.error('❌ 获取 questions 失败:', error);
    return;
  }

  console.log(`📊 找到 ${questions.length} 道题目\n`);

  let translatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // 分批处理
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    console.log(`🔄 处理批次 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)}`);

    for (const question of batch) {
      // 检查是否需要翻译
      if (!containsChinese(question.explanation)) {
        console.log(`   ⏭️  题目 ${question.id} 不是中文，跳过`);
        skippedCount++;
        continue;
      }

      if (question.explanation_en && question.explanation_en.trim() !== '') {
        console.log(`   ⏭️  题目 ${question.id} 已有英文解析，跳过`);
        skippedCount++;
        continue;
      }

      try {
        console.log(`   🔄 翻译题目 ${question.id}...`);
        const translatedText = await translateWithDeepSeek(question.explanation);
        
        // 更新数据库
        const { error: updateError } = await supabase
          .from('questions')
          .update({ explanation_en: translatedText })
          .eq('id', question.id);

        if (updateError) {
          console.error(`   ❌ 更新题目 ${question.id} 失败:`, updateError);
          errorCount++;
        } else {
          console.log(`   ✅ 翻译完成并已保存`);
          translatedCount++;
        }
        
        // 延迟避免 API 限制
        await delay(DELAY_MS);
        
      } catch (err) {
        console.error(`   ❌ 翻译失败:`, err);
        errorCount++;
      }
    }

    console.log('');
  }

  console.log('\n📊 questions 处理完成:');
  console.log(`   总题目数: ${questions.length}`);
  console.log(`   已翻译: ${translatedCount}`);
  console.log(`   已跳过: ${skippedCount}`);
  console.log(`   失败: ${errorCount}\n`);
};

// 主函数
const main = async () => {
  console.log('🚀 开始批量翻译题目解析...\n');
  console.log('================================\n');

  // 检查环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ 错误: 请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量');
    process.exit(1);
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('❌ 错误: 请设置 DEEPSEEK_API_KEY 环境变量');
    process.exit(1);
  }

  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 处理 mock_exams 表
    await processMockExams(supabase);

    // 处理 questions 表
    await processQuestions(supabase);

    console.log('================================');
    console.log('✅ 所有翻译任务完成！');
    
  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error);
    process.exit(1);
  }
};

// 运行主函数
main();

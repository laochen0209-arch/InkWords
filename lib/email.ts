/**
 * 邮件发送工具
 * 
 * 使用 nodemailer 发送邮件
 */

import nodemailer from 'nodemailer'

// 邮件传输配置
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true, // 使用 SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

/**
 * 发送验证码邮件
 * 
 * @param to 收件人邮箱
 * @param code 验证码
 * @param type 邮件类型（register/reset_password）
 */
export async function sendVerificationCode(
  to: string,
  code: string,
  type: 'register' | 'reset_password' = 'register'
): Promise<{ success: boolean; message: string }> {
  try {
    // 检查邮件配置
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
      console.error('邮件服务器配置缺失')
      return {
        success: false,
        message: '邮件服务器配置不完整，请联系管理员',
      }
    }

    const subject = type === 'register' 
      ? '【InkWords】注册验证码' 
      : '【InkWords】密码重置验证码'

    const actionText = type === 'register'
      ? '注册 InkWords 账号'
      : '重置您的 InkWords 密码'

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #C23E32; margin-bottom: 20px;">InkWords 验证码</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            您好！<br><br>
            您正在<strong>${actionText}</strong>，请使用以下验证码完成操作：
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #C23E32; letter-spacing: 8px;">${code}</span>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            <strong>验证码有效期：</strong>5分钟<br>
            <strong>请勿将验证码透露给他人</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; line-height: 1.5;">
            如果您没有进行此操作，请忽略此邮件。<br>
            此邮件由系统自动发送，请勿回复。
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2024 InkWords. All rights reserved.</p>
        </div>
      </div>
    `

    const textContent = `
InkWords 验证码

您好！

您正在${actionText}，请使用以下验证码完成操作：

验证码：${code}

验证码有效期：5分钟
请勿将验证码透露给他人

如果您没有进行此操作，请忽略此邮件。
此邮件由系统自动发送，请勿回复。

© 2024 InkWords. All rights reserved.
    `

    // 发送邮件
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM || 'InkWords'}" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    })

    console.log('邮件发送成功:', info.messageId)

    return {
      success: true,
      message: '验证码已发送到您的邮箱',
    }
  } catch (error: any) {
    console.error('邮件发送失败:', error)
    return {
      success: false,
      message: `邮件发送失败: ${error.message}`,
    }
  }
}

import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

if (smtpUser && smtpPass) {
  console.log(`[Mailer] Initializing real Gmail SMTP transporter for: ${smtpUser}`);
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
} else {
  console.warn('[Mailer Warning] SMTP_USER and SMTP_PASS are not configured in your apps/api/.env file! Real Gmail OTP delivery is inactive.');
}

export async function sendOTPEmail(toEmail: string, studentName: string, otp: string): Promise<boolean> {
  if (!transporter) {
    console.error(`[Mailer Error] Cannot send real OTP email to ${toEmail}. Gmail credentials SMTP_USER and SMTP_PASS are missing in .env.`);
    return false;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fa; padding: 30px 20px; color: #2d3436; line-height: 1.6;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(108,92,231,0.08); border: 1px solid #e8ecf1;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6c5ce7, #8e2de2); padding: 32px 24px; text-align: center; color: #ffffff;">
          <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px;">EduPath AI</div>
          <div style="font-size: 13px; opacity: 0.9; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Hệ thống giáo dục thông minh</div>
        </div>
        
        <!-- Content Body -->
        <div style="padding: 30px 24px;">
          <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #1e293b;">MÃ XÁC THỰC ĐĂNG KÝ TÀI KHOẢN</h2>
          <p style="font-size: 14px; color: #636e72; margin: 0 0 20px 0;">
            Chào <strong>${studentName}</strong>,<br/>
            Cảm ơn em đã lựa chọn đồng hành cùng EduPath AI trên con đường chinh phục giảng đường Đại học mơ ước. Để hoàn tất đăng ký tài khoản, em vui lòng sử dụng mã xác thực OTP dưới đây:
          </p>
          
          <!-- OTP Display Block -->
          <div style="background: #f0edff; border: 1.5px dashed #6c5ce7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6c5ce7; letter-spacing: 1px; margin-bottom: 8px;">Mã xác thực của em</div>
            <div style="font-size: 36px; font-weight: 800; color: #5a4bd1; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace;">${otp}</div>
            <div style="font-size: 11.5px; color: #636e72; margin-top: 10px; font-style: italic;">Mã có hiệu lực trong vòng 10 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai!</div>
          </div>
          
          <p style="font-size: 13px; color: #94a3b8; margin: 24px 0 0 0; line-height: 1.5;">
            Nếu em không thực hiện yêu cầu đăng ký này tại EduPath, em có thể bỏ qua email này một cách an toàn.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e8ecf1; font-size: 11.5px; color: #94a3b8;">
          <div>Đội ngũ hỗ trợ học tập EduPath AI</div>
          <div style="margin-top: 4px; font-weight: 500; color: #6c5ce7;">Học đúng hướng · Thi đúng đích</div>
        </div>
      </div>
    </div>
  `;

  try {
    console.log(`[Mailer] Sending OTP email to: ${toEmail}...`);
    await transporter.sendMail({
      from: `"EduPath Support" <${smtpUser}>`,
      to: toEmail,
      subject: `[EduPath AI] Mã xác thực OTP tài khoản của em: ${otp}`,
      html: htmlContent
    });
    console.log(`[Mailer] Real OTP email successfully delivered to: ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[Mailer Error] Failed to send real OTP email to ${toEmail}:`, err);
    return false;
  }
}

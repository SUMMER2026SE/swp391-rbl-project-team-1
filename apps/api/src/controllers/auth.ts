import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { sendOTPEmail, sendResetPasswordEmail } from '../lib/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'edupath_jwt_refresh_secret_key_2026';

export async function register(req: Request, res: Response) {
  const { email, password, fullName, role, subjectGroup, bio } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Địa chỉ Email này đã được sử dụng!' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create base user and dynamic subclass profiles in transaction
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: role || 'STUDENT',
          isActive: true
        }
      });

      if (u.role === 'STUDENT') {
        await tx.student.create({
          data: {
            userId: u.id,
            subjectGroup: subjectGroup || 'A01'
          }
        });
      } else if (u.role === 'TEACHER') {
        await tx.teacher.create({
          data: {
            userId: u.id,
            isApproved: false, // Teacher requires Admin verification approval!
            bio: bio || ''
          }
        });
      } else if (u.role === 'ADMIN') {
        await tx.admin.create({
          data: {
            userId: u.id
          }
        });
      }

      return u;
    });

    const tokens = signTokens({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });

    return res.status(201).json({
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isPro: user.isPro,
          subjectGroup: user.role === 'STUDENT' ? (subjectGroup || 'A01') : null
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: {
          include: {
            enrollments: {
              select: { courseId: true, paidAt: true, id: true }
            }
          }
        },
        teacher: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa!' });
    }

    // If teacher, verify approved status
    if (user.role === 'TEACHER' && user.teacher && !user.teacher.isApproved) {
      return res.status(403).json({ success: false, error: 'Tài khoản Giáo viên đang chờ Quản trị viên duyệt hồ sơ!' });
    }

    // Sign Access and Refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isPro: user.isPro,
          subjectGroup: user.student?.subjectGroup || null,
          enrollments: user.student?.enrollments || []
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Update user profile (PATCH /auth/profile)
export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  }

  const { fullName, avatarUrl, subjectGroup, phone, city, school, targetScore, targetUniversity, combo } = req.body;

  try {
    // Update base user info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      include: {
        student: {
          include: {
            enrollments: {
              select: { courseId: true, paidAt: true, id: true }
            }
          }
        }
      }
    });

    // Update student subjectGroup if provided (stored as extra fields in Student table)
    if (updatedUser.student && subjectGroup) {
      await prisma.student.update({
        where: { userId },
        data: { subjectGroup }
      });
    }

    console.log(`[Profile Update] Cập nhật hồ sơ thành công cho người dùng ID: ${userId}`);

    return res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        isPro: updatedUser.isPro,
        subjectGroup: subjectGroup || updatedUser.student?.subjectGroup || null,
        enrollments: updatedUser.student?.enrollments || []
      }
    });
  } catch (err: any) {
    console.error('[Profile Update Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  return res.status(200).json({ success: true, data: 'Đăng xuất thành công!' });
}

// In-memory OTP store: email -> { otp, expiresAt, payload }
const otpStore = new Map<string, { otp: string; expiresAt: number; payload?: any }>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signTokens(user: { id: number; email: string; fullName: string; role: string }) {
  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export async function sendOtp(req: Request, res: Response) {
  const { email, fullName, password, role, subjectGroup, bio, phone } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin.' });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email này đã được đăng ký!' });
    }

    const otp = generateOTP();
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      payload: { email, fullName, password, role, subjectGroup, bio, phone }
    });

    // Call real nodemailer SMTP helper
    const emailSent = await sendOTPEmail(email, fullName, otp);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        data: { message: 'Đã gửi mã OTP đến Gmail thực của em. Hãy kiểm tra hộp thư!', expiresInMinutes: 10 }
      });
    } else {
      // Fallback in case of no .env variables or transport failure, keeps sandbox environment working
      return res.status(200).json({
        success: true,
        data: { 
          message: 'Hệ thống gửi thư đang dùng chế độ Sandbox. Dùng mã OTP dưới đây để hoàn tất đăng ký.',
          otp, 
          expiresInMinutes: 10 
        }
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function verifyOtpRegister(req: Request, res: Response) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Thiếu email hoặc mã OTP.' });
  }

  const record = otpStore.get(email.toLowerCase());
  if (!record) {
    return res.status(400).json({ success: false, error: 'Vui lòng yêu cầu mã OTP trước.' });
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ success: false, error: 'Mã OTP đã hết hạn. Hãy yêu cầu lại.' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, error: 'Mã OTP không chính xác.' });
  }

  const { fullName, password, role, subjectGroup, bio } = record.payload || {};

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const assignedRole = role && ['STUDENT', 'TEACHER'].includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'STUDENT';

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, passwordHash, fullName, role: assignedRole as any, isActive: true }
      });
      if (assignedRole === 'STUDENT') {
        await tx.student.create({ data: { userId: u.id, subjectGroup: subjectGroup || 'A01' } });
      } else if (assignedRole === 'TEACHER') {
        await tx.teacher.create({ data: { userId: u.id, isApproved: false, bio: bio || '' } });
      }
      return tx.user.findUnique({
        where: { id: u.id },
        include: { student: true, teacher: true }
      });
    });

    otpStore.delete(email.toLowerCase());

    if (!user) return res.status(500).json({ success: false, error: 'Không tạo được tài khoản.' });

    const tokens = signTokens({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });

    return res.status(201).json({
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isPro: user.isPro,
          subjectGroup: user.student?.subjectGroup || null
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function googleAuth(req: Request, res: Response) {
  const { email, fullName, googleId, avatarUrl, role, subjectGroup } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin Google profile.' });
  }

  try {
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      include: { student: true, teacher: true }
    });

    if (!user) {
      const randomHash = await bcrypt.hash(googleId + Date.now(), 12);
      const assignedRole = role === 'TEACHER' ? 'TEACHER' : 'STUDENT';

      const created = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            passwordHash: randomHash,
            fullName: fullName || email.split('@')[0],
            avatarUrl: avatarUrl || null,
            googleId,
            role: assignedRole,
            isActive: true
          }
        });
        if (assignedRole === 'STUDENT') {
          await tx.student.create({
            data: { userId: u.id, subjectGroup: subjectGroup || 'A01' }
          });
        } else if (assignedRole === 'TEACHER') {
          await tx.teacher.create({
            data: { userId: u.id, isApproved: false, bio: '' }
          });
        }
        return tx.user.findUnique({
          where: { id: u.id },
          include: { student: true, teacher: true }
        });
      });
      user = created;
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl: avatarUrl || user.avatarUrl },
        include: { student: true, teacher: true }
      });
    }

    if (!user) return res.status(500).json({ success: false, error: 'Không tạo được tài khoản.' });
    if (!user.isActive) return res.status(403).json({ success: false, error: 'Tài khoản đã bị khóa!' });
    if (user.role === 'TEACHER' && user.teacher && !user.teacher.isApproved) {
      return res.status(403).json({ success: false, error: 'Tài khoản Giáo viên đang chờ duyệt!' });
    }

    const tokens = signTokens({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isPro: user.isPro,
          subjectGroup: user.student?.subjectGroup || null
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function changePassword(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Chưa được xác thực!' });
  }

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Mật khẩu cũ không chính xác!' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return res.status(200).json({ success: true, data: 'Đổi mật khẩu thành công!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Vui lòng cung cấp địa chỉ Email.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản với Email này.' });
    }

    // Generate a secure reset token containing userId with 15 minutes expiration
    const token = jwt.sign(
      { id: user.id, purpose: 'reset-password' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Build the reset link pointing to the local frontend
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    const sent = await sendResetPasswordEmail(email, user.fullName, resetLink);
    if (!sent) {
      // In local development, if SMTP is not configured, we also simulate and return the token so they can test easily!
      console.warn(`[Forgot Password] SMTP not configured. Simulated reset link: ${resetLink}`);
      return res.status(200).json({ 
        success: true, 
        data: {
          simulated: true,
          resetLink,
          message: 'Hệ thống đang chạy local (không có cấu hình SMTP). Dưới đây là link khôi phục mật khẩu để bạn dễ dàng test thử:'
        } 
      });
    }

    return res.status(200).json({ success: true, data: 'Đường dẫn đặt lại mật khẩu đã được gửi vào Email của bạn!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin mã xác nhận hoặc mật khẩu mới.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.purpose !== 'reset-password') {
      return res.status(400).json({ success: false, error: 'Mã xác thực không hợp lệ!' });
    }

    const userId = decoded.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại.' });
    }

    // Hash and update the password
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return res.status(200).json({ success: true, data: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.' });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, error: 'Đường dẫn đặt lại mật khẩu đã hết hạn (tối đa 15 phút)!' });
    }
    return res.status(400).json({ success: false, error: 'Mã token đặt lại mật khẩu không hợp lệ hoặc đã bị chỉnh sửa!' });
  }
}


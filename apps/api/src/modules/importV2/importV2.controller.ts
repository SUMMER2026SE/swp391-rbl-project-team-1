import type { Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { ImportV2Service } from './importV2.service.js';
import { ImportV2Repository } from './importV2.repository.js';

function handleError(res: Response, err: any) {
  console.error('[ImportV2 Controller Error]', err);
  const msg = err.message || 'Internal Server Error';
  if (msg.startsWith('NOT_FOUND:')) {
    return res.status(404).json({ success: false, errorCode: 'NOT_FOUND', error: msg.replace('NOT_FOUND: ', '') });
  }
  if (msg.startsWith('FORBIDDEN:')) {
    return res.status(403).json({ success: false, errorCode: 'FORBIDDEN', error: msg.replace('FORBIDDEN: ', '') });
  }
  return res.status(500).json({ success: false, errorCode: 'SERVER_ERROR', error: msg });
}

export class ImportV2Controller {
  static async uploadDocument(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'Vui lòng đính kèm tệp tài liệu để upload!' });

    try {
      const session = await ImportV2Service.createSession(userId, file.originalname, file.size, file.path);
      return res.status(202).json({
        success: true,
        message: 'Tệp đang được phân tích bởi MinerU Service & Gemini 2.5 Flash...',
        data: session
      });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async getSessions(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      const sessions = await ImportV2Service.getSessions(userId);
      return res.status(200).json({ success: true, data: sessions });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async getSessionById(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      const session = await ImportV2Service.getSessionById(Number(id), userId);
      return res.status(200).json({ success: true, data: session });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async updateQuestion(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      const question = await ImportV2Repository.getImportQuestionById(Number(id));
      if (!question) return res.status(404).json({ success: false, error: 'Câu hỏi import không tồn tại!' });
      if (question.session.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Bạn không có quyền chỉnh sửa câu hỏi này!' });
      }

      const updated = await ImportV2Service.updateQuestion(question.sessionId, Number(id), req.body);
      return res.status(200).json({ success: true, message: 'Cập nhật câu hỏi thành công!', data: updated });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async autoSaveDraft(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { questions } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      const session = await ImportV2Service.getSessionById(Number(id), userId);
      if (Array.isArray(questions)) {
        for (const q of questions) {
          if (q.id) {
            await ImportV2Service.updateQuestion(Number(id), Number(q.id), q);
          }
        }
      }
      return res.status(200).json({ success: true, message: 'Đã lưu nháp tự động thành công!' });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async rerunStage(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { stageName } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
    if (!stageName) return res.status(400).json({ success: false, error: 'Thiếu tên giai đoạn cần chạy lại (normalizer, segmenter, gemini)!' });

    try {
      const updatedSession = await ImportV2Service.rerunStage(Number(id), stageName);
      return res.status(200).json({ success: true, message: `Đã chạy lại giai đoạn ${stageName} thành công!`, data: updatedSession });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async confirmImport(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { decisions } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      const result = await ImportV2Service.confirmImport(Number(id), userId, decisions);
      return res.status(200).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async deleteSession(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      await ImportV2Service.deleteSession(Number(id), userId);
      return res.status(200).json({ success: true, message: 'Đã xóa phiên nhập đề thành công!' });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async mergeQuestions(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { q1Id, q2Id } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
    if (!q1Id || !q2Id) return res.status(400).json({ success: false, error: 'Thiếu thông tin hai câu hỏi cần gộp!' });

    try {
      const result = await ImportV2Service.mergeQuestions(Number(id), Number(q1Id), Number(q2Id));
      return res.status(200).json({ success: true, message: 'Đã gộp hai câu hỏi thành công!', data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async splitQuestion(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { questionId, splitIndex } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
    if (!questionId) return res.status(400).json({ success: false, error: 'Thiếu thông tin câu hỏi cần tách!' });

    try {
      const result = await ImportV2Service.splitQuestion(Number(id), Number(questionId), Number(splitIndex || 0));
      return res.status(200).json({ success: true, message: 'Đã tách câu hỏi thành công!', data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  static async duplicateQuestion(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { questionId } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

    try {
      const result = await ImportV2Service.duplicateQuestion(Number(id), Number(questionId));
      return res.status(200).json({ success: true, message: 'Đã nhân bản câu hỏi!', data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }
}

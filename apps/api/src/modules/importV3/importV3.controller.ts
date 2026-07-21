import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ImportV3Service } from './importV3.service.js';

export class ImportV3Controller {
  static async getSubjectsAndTopics(req: Request, res: Response) {
    try {
      const subjects = await prisma.subject.findMany({
        include: {
          topics: true
        }
      });
      return res.status(200).json({
        success: true,
        data: subjects
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  static async uploadDocumentV3(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 1;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, error: 'BAD_REQUEST: Vui lòng chọn tệp đề thi!' });
      }

      const session = await ImportV3Service.createSessionV3(
        userId,
        file.originalname,
        file.size,
        file.path
      );

      return res.status(201).json({
        success: true,
        message: 'Tải đề thi Import V3 thành công! Đang xử lý qua Image-First Pipeline...',
        data: session
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getSessionV3(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 1;
      const id = parseInt(req.params.id, 10);
      const session = await ImportV3Service.getSessionByIdV3(id, userId);

      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async recropQuestionV3(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 1;
      const id = parseInt(req.params.id, 10);
      const questionIndex = parseInt(req.params.questionIndex, 10);
      const { topYRatio, bottomYRatio, pageStart, pageEnd, pageStartBottomYRatio, pageEndTopYRatio } = req.body;

      const result = await ImportV3Service.recropQuestionV3(
        id,
        userId,
        questionIndex,
        parseFloat(topYRatio),
        parseFloat(bottomYRatio),
        parseInt(pageStart, 10) || 1,
        parseInt(pageEnd, 10) || 1,
        pageStartBottomYRatio !== undefined ? parseFloat(pageStartBottomYRatio) : undefined,
        pageEndTopYRatio !== undefined ? parseFloat(pageEndTopYRatio) : undefined
      );

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async uploadExplanationImageV3(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 1;
      const id = parseInt(req.params.id, 10);
      const questionIndex = parseInt(req.params.questionIndex, 10);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'BAD_REQUEST: Vui lòng chọn tệp ảnh lời giải!' });
      }

      const result = await ImportV3Service.uploadExplanationImageV3(
        id,
        userId,
        questionIndex,
        file.path,
        file.originalname
      );

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

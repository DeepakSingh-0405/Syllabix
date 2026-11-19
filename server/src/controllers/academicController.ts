import { Request, Response } from 'express';
import { Institution, Program, Branch, Subject, Unit, Topic } from '../models/Academic';
import { escapeRegex } from '../utils/sanitize';
import { seedDatabase } from '../config/seed';

export const getInstitutions = async (_req: Request, res: Response): Promise<void> => {
  try {
    let institutions: any[] = await Institution.find().lean();
    if (institutions.length === 0) {
      await seedDatabase().catch(() => null);
      institutions = await Institution.find().lean();
    }
    res.json({ success: true, data: institutions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semester, branchId, search } = req.query;
    const filter: any = {};

    if (semester) filter.semester = Number(semester);
    if (branchId) filter.branchId = branchId;
    if (search) {
      const safeSearch = escapeRegex(String(search));
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { code: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    let subjects = await Subject.find(filter).lean();

    // If database is empty, seed initial high-yield curriculum subjects matching design.md
    if (subjects.length === 0 && !search && !branchId && !semester) {
      await seedDatabase().catch(() => null);
      subjects = await Subject.find().lean();
    }

    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getSubjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).lean();
    if (!subject) {
      res.status(404).json({ success: false, error: { message: 'Subject not found' } });
      return;
    }

    const units = await Unit.find({ subjectId: id }).sort({ number: 1 }).lean();
    res.json({ success: true, data: { ...subject, units } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

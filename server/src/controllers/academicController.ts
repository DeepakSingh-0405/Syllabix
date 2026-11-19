import { Request, Response } from 'express';
import { Institution, Program, Branch, Subject, Unit, Topic } from '../models/Academic';
import { escapeRegex } from '../utils/sanitize';

export const getInstitutions = async (_req: Request, res: Response): Promise<void> => {
  try {
    let institutions: any[] = await Institution.find().lean();
    if (institutions.length === 0) {
      // Seed default institution
      const defaultInst = await Institution.create({
        name: 'National Institute of Technology',
        domain: 'nit.edu',
        state: 'Delhi',
        verified: true,
      });
      institutions = [defaultInst.toObject()];
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
      const defaultInst = await Institution.findOne() || await Institution.create({
        name: 'National Institute of Technology',
        domain: 'nit.edu',
        state: 'Delhi',
        verified: true,
      });

      const defaultProg = await Program.findOne() || await Program.create({
        institutionId: defaultInst._id,
        name: 'Bachelor of Technology (B.Tech)',
        code: 'BTECH',
        durationYears: 4,
      });

      const defaultBranch = await Branch.findOne() || await Branch.create({
        programId: defaultProg._id,
        name: 'Computer Science and Engineering',
        code: 'CSE',
      });

      const seedData = [
        { code: 'CS-201', name: 'Data Structures & Algorithms', semester: 3, description: 'Core linear and non-linear data structures, trees, graphs, and algorithmic complexity.', credits: 4, isCore: true, topicCount: 24 },
        { code: 'CS-202', name: 'Operating Systems', semester: 4, description: 'Process management, concurrency, virtual memory, file systems, and kernel architecture.', credits: 4, isCore: true, topicCount: 18 },
        { code: 'CS-203', name: 'Database Management Systems', semester: 4, description: 'Relational algebra, SQL, indexing, transaction processing, and concurrency control.', credits: 4, isCore: true, topicCount: 16 },
        { code: 'CS-301', name: 'Computer Networks', semester: 5, description: 'OSI and TCP/IP stack, routing protocols, flow control, and network security foundations.', credits: 3, isCore: true, topicCount: 14 },
        { code: 'CS-302', name: 'Theory of Computation', semester: 5, description: 'Automata theory, regular expressions, context-free grammars, Turing machines, and NP-completeness.', credits: 4, isCore: true, topicCount: 12 },
        { code: 'CS-303', name: 'Machine Learning', semester: 6, description: 'Supervised and unsupervised learning, gradient descent, neural networks, and model evaluation.', credits: 4, isCore: false, topicCount: 20 },
      ];

      for (const item of seedData) {
        await Subject.create({
          ...item,
          branchId: defaultBranch._id,
        });
      }
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

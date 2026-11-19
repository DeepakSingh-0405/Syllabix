import mongoose from 'mongoose';
import { Institution, Program, Branch, Subject, Unit, Topic } from '../models/Academic';
import { User } from '../models/User';
import { MentorProfile } from '../models/Mentorship';
import { StudyGroup } from '../models/StudyGroup';

export interface SeedResult {
  institutions: number;
  programs: number;
  branches: number;
  subjects: number;
  units: number;
  topics: number;
  mentors: number;
  studyGroups: number;
}

/**
 * Idempotently seeds the Syllabix database with baseline academic curriculum,
 * mentor profiles, and collaborative study groups without duplicate insertions.
 */
export async function seedDatabase(): Promise<SeedResult> {
  const result: SeedResult = {
    institutions: 0,
    programs: 0,
    branches: 0,
    subjects: 0,
    units: 0,
    topics: 0,
    mentors: 0,
    studyGroups: 0,
  };

  // 1. Institution (Idempotent by domain)
  let institution = await Institution.findOne({ domain: 'nit.edu' });
  if (!institution) {
    institution = await Institution.create({
      name: 'National Institute of Technology',
      domain: 'nit.edu',
      state: 'Delhi',
      verified: true,
    });
  }
  result.institutions = 1;

  // 2. Program (Idempotent by institutionId + code)
  let program = await Program.findOne({ institutionId: institution._id, code: 'BTECH' });
  if (!program) {
    program = await Program.create({
      institutionId: institution._id,
      name: 'Bachelor of Technology (B.Tech)',
      code: 'BTECH',
      durationYears: 4,
    });
  }
  result.programs = 1;

  // 3. Branch (Idempotent by programId + code)
  let branch = await Branch.findOne({ programId: program._id, code: 'CSE' });
  if (!branch) {
    branch = await Branch.create({
      programId: program._id,
      name: 'Computer Science and Engineering',
      code: 'CSE',
    });
  }
  result.branches = 1;

  // 4. Core Curriculum Subjects (Idempotent by code)
  const seedSubjects = [
    { code: 'CS-201', name: 'Data Structures & Algorithms', semester: 3, description: 'Core linear and non-linear data structures, trees, graphs, and algorithmic complexity.', credits: 4, isCore: true, topicCount: 24 },
    { code: 'CS-202', name: 'Operating Systems', semester: 4, description: 'Process management, concurrency, virtual memory, file systems, and kernel architecture.', credits: 4, isCore: true, topicCount: 18 },
    { code: 'CS-203', name: 'Database Management Systems', semester: 4, description: 'Relational algebra, SQL, indexing, transaction processing, and concurrency control.', credits: 4, isCore: true, topicCount: 16 },
    { code: 'CS-301', name: 'Computer Networks', semester: 5, description: 'OSI and TCP/IP stack, routing protocols, flow control, and network security foundations.', credits: 3, isCore: true, topicCount: 14 },
    { code: 'CS-302', name: 'Theory of Computation', semester: 5, description: 'Automata theory, regular expressions, context-free grammars, Turing machines, and NP-completeness.', credits: 4, isCore: true, topicCount: 12 },
    { code: 'CS-303', name: 'Machine Learning', semester: 6, description: 'Supervised and unsupervised learning, gradient descent, neural networks, and model evaluation.', credits: 4, isCore: false, topicCount: 20 },
  ];

  const subjectDocs: any[] = [];
  for (const item of seedSubjects) {
    let subject = await Subject.findOne({ code: item.code });
    if (!subject) {
      subject = await Subject.create({
        ...item,
        branchId: branch._id,
      });
    }
    subjectDocs.push(subject);
  }
  result.subjects = subjectDocs.length;

  // 5. Units & Topics for CS-201 (Idempotent by subjectId + number)
  const dsaSubject = subjectDocs.find(s => s.code === 'CS-201');
  if (dsaSubject) {
    const unitsData = [
      { number: 1, title: 'Linear Data Structures, Stacks & Queues' },
      { number: 2, title: 'Non-Linear Structures, Trees & Binary Search' },
      { number: 3, title: 'Graph Algorithms & Shortest Path Traversals' },
      { number: 4, title: 'Dynamic Programming & Algorithmic Complexity' },
    ];

    for (const u of unitsData) {
      let unit = await Unit.findOne({ subjectId: dsaSubject._id, number: u.number });
      if (!unit) {
        unit = await Unit.create({
          subjectId: dsaSubject._id,
          number: u.number,
          title: u.title,
        });
      }
      result.units++;

      // Seed baseline topic per unit
      const topicTitle = `${u.title} - Core Foundations`;
      const existingTopic = await Topic.findOne({ unitId: unit._id, title: topicTitle });
      if (!existingTopic) {
        await Topic.create({
          unitId: unit._id,
          title: topicTitle,
          prerequisiteTopicIds: [],
        });
      }
      result.topics++;
    }
  }

  // 6. Mentor User & Profile (Idempotent by email or supabaseUserId)
  let mentorUser = await User.findOne({ email: 'mentor.aryan@nit.edu' });
  if (!mentorUser) {
    mentorUser = await User.create({
      supabaseUserId: 'mentor-seed-001',
      email: 'mentor.aryan@nit.edu',
      name: 'Aryan Sharma (Final Year CSE)',
      role: 'mentor',
      reputationPoints: 340,
    });
  }

  const existingProfile = await MentorProfile.findOne({ userId: mentorUser._id });
  if (!existingProfile) {
    await MentorProfile.create({
      userId: mentorUser._id,
      expertiseSubjectIds: subjectDocs.slice(0, 3).map(s => s._id),
      bio: 'Specialist in Data Structures, OS concurrency, and university exam preparation.',
      availability: 'Mon-Thu 6:00 PM - 8:00 PM IST',
      rating: 4.95,
      sessionsCompleted: 28,
      verified: true,
    });
  }
  result.mentors = 1;

  // 7. Collaborative Study Group (Idempotent by name)
  if (dsaSubject) {
    const groupName = `${dsaSubject.code} — Mid-Semester Exam Circle`;
    let group = await StudyGroup.findOne({ name: groupName });
    if (!group) {
      await StudyGroup.create({
        name: groupName,
        subjectId: dsaSubject._id,
        ownerId: mentorUser._id,
        visibility: 'public',
        schedule: 'Daily 7:00 PM - 9:00 PM IST',
        activeTopic: 'Unit 2 & 3 Problem Solving and Proofs',
        memberIds: [mentorUser._id],
      });
    }
    result.studyGroups = 1;
  }

  return result;
}

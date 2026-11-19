import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import { Subject } from './types';
import { api } from './lib/api';
import { CanvasBackground } from './components/3d/CanvasBackground';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UploadModal } from './components/UploadModal';

// Dedicated Screen Pages
import { DirectoryPage } from './pages/DirectoryPage';
import { StudyRoomsPage } from './pages/StudyRoomsPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { AssistantPage } from './pages/AssistantPage';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Global modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSubject, setUploadSubject] = useState<Subject | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpenUpload = (sub?: Subject) => {
    setUploadSubject(sub || null);
    setIsUploadOpen(true);
  };

  // Fallback initial curriculum subjects (matching design.md) in case backend is offline
  const fallbackSubjects: Subject[] = useMemo(() => [
    { _id: '1', code: 'CS-201', name: 'Data Structures & Algorithms', semester: 3, description: 'Core linear and non-linear data structures, trees, graphs, heaps, hash tables, and asymptotic algorithmic complexity.', credits: 4, isCore: true, topicCount: 24, branch: 'CSE' },
    { _id: '2', code: 'CS-202', name: 'Operating Systems', semester: 4, description: 'Process synchronization, thread scheduling, CPU scheduling, virtual memory paging, deadlock avoidance, and kernel architecture.', credits: 4, isCore: true, topicCount: 18, branch: 'CSE' },
    { _id: '3', code: 'CS-203', name: 'Database Management Systems', semester: 4, description: 'Relational algebra, SQL query optimization, 1NF-BCNF normalization, concurrency protocols, and ACID transactions.', credits: 4, isCore: true, topicCount: 16, branch: 'CSE' },
    { _id: '4', code: 'CS-301', name: 'Computer Networks', semester: 5, description: 'Physical and data link layer framing, sliding window protocols, IP addressing, TCP congestion control, and network security.', credits: 3, isCore: true, topicCount: 14, branch: 'CSE' },
    { _id: '5', code: 'CS-302', name: 'Theory of Computation', semester: 5, description: 'Deterministic & non-deterministic automata, pumping lemmas, context-free grammars, Turing machines, and NP-completeness proofs.', credits: 4, isCore: true, topicCount: 12, branch: 'CSE' },
    { _id: '6', code: 'CS-303', name: 'Machine Learning', semester: 6, description: 'Supervised loss functions, gradient descent, support vector machines, decision trees, neural networks, and model validation.', credits: 4, isCore: false, topicCount: 20, branch: 'CSE' },
    { _id: '7', code: 'CS-304', name: 'Compiler Design', semester: 6, description: 'Lexical analysis, LL/LR parsing tables, syntax-directed translation, intermediate representation, and machine code optimization.', credits: 4, isCore: false, topicCount: 15, branch: 'CSE' },
    { _id: '8', code: 'CS-401', name: 'Distributed Systems', semester: 7, description: 'Consensus algorithms (Raft, Paxos), vector clocks, distributed shared memory, RPC mechanics, and fault tolerance paradigms.', credits: 4, isCore: false, topicCount: 16, branch: 'CSE' },
    { _id: '9', code: 'CS-402', name: 'Cloud Computing & DevOps', semester: 7, description: 'Virtualization, microservices architecture, container orchestration, Kubernetes, CI/CD pipelines, and infrastructure as code.', credits: 3, isCore: false, topicCount: 14, branch: 'CSE' },
    { _id: '10', code: 'IT-201', name: 'Web Technologies & Architecture', semester: 3, description: 'Full-stack client-server protocols, asynchronous DOM, REST endpoints, and reactive web application design.', credits: 4, isCore: true, topicCount: 18, branch: 'IT' },
    { _id: '11', code: 'IT-302', name: 'Information Security & Cryptography', semester: 5, description: 'Symmetric & asymmetric encryption, cryptographic hashes, public key infrastructure, and vulnerability defense.', credits: 4, isCore: false, topicCount: 16, branch: 'IT' },
    { _id: '12', code: 'EC-201', name: 'Digital Electronics & Logic Design', semester: 3, description: 'Combinational logic design, sequential circuits, flip-flops, karnaugh maps, and microprocessor architecture.', credits: 4, isCore: true, topicCount: 20, branch: 'ECE' },
    { _id: '13', code: 'EC-301', name: 'Signals and Systems', semester: 5, description: 'Continuous and discrete time signals, Fourier analysis, Laplace transforms, Z-transform, and system stability.', credits: 4, isCore: true, topicCount: 15, branch: 'ECE' },
    { _id: '14', code: 'ME-201', name: 'Engineering Thermodynamics', semester: 3, description: 'First and second laws of thermodynamics, entropy analysis, Carnot cycle, and energy conservation equations.', credits: 4, isCore: true, topicCount: 16, branch: 'ME' },
    { _id: '15', code: 'CE-201', name: 'Structural Analysis & Mechanics', semester: 3, description: 'Truss mechanics, shear force & bending moment diagrams, deflection calculations, and stress analysis.', credits: 4, isCore: true, topicCount: 14, branch: 'CE' },
  ], []);

  const fetchSubjects = async () => {
    try {
      const data = await api.get<Subject[]>('/subjects');
      if (data && data.length > 0) {
        setSubjects(data);
      } else {
        setSubjects(fallbackSubjects);
      }
    } catch {
      setSubjects(fallbackSubjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [fallbackSubjects]);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    let frameId = 0;

    const animateScroll = (time: number) => {
      if (!lenis || motionPreference.matches) {
        frameId = 0;
        return;
      }

      lenis.raf(time);
      frameId = requestAnimationFrame(animateScroll);
    };

    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      lenis?.destroy();
      lenis = null;
    };

    const start = () => {
      if (motionPreference.matches || lenis) return;
      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        anchors: true,
        allowNestedScroll: true,
      });
      frameId = requestAnimationFrame(animateScroll);
    };

    const updateMotion = () => {
      if (motionPreference.matches) stop();
      else start();
    };

    start();
    motionPreference.addEventListener('change', updateMotion);
    return () => {
      motionPreference.removeEventListener('change', updateMotion);
      stop();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent text-text-primary flex flex-col">
      <CanvasBackground />

      <Navbar
        onOpenUpload={() => handleOpenUpload()}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <DirectoryPage
                subjects={subjects}
                loading={loading}
                onNavigateToAssistant={(code) => {
                  navigate(`/assistant${code ? `?subject=${code}` : ''}`);
                }}
                onOpenUpload={handleOpenUpload}
              />
            }
          />

          <Route
            path="/study-rooms"
            element={<StudyRoomsPage subjects={subjects} />}
          />

          <Route
            path="/mentorship"
            element={<MentorshipPage subjects={subjects} />}
          />

          <Route
            path="/assistant"
            element={<AssistantPage subjects={subjects} />}
          />

          <Route
            path="/discussions"
            element={<DiscussionsPage subjects={subjects} />}
          />

          <Route
            path="/leaderboard"
            element={<LeaderboardPage />}
          />

          <Route
            path="/analytics"
            element={<AnalyticsPage />}
          />
        </Routes>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadSubject(null);
        }}
        subjects={subjects}
        onUploadSuccess={fetchSubjects}
        initialSubject={uploadSubject}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

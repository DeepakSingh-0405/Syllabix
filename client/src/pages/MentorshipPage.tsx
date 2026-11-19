import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Subject } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Award, Star, Calendar, CheckCircle2, Send, Clock } from 'lucide-react';

interface Mentor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    reputationPoints: number;
    avatarUrl?: string;
  };
  expertiseSubjectIds: {
    _id: string;
    name: string;
    code: string;
  }[];
  bio: string;
  availability: string;
  rating: number;
  sessionsCompleted: number;
  verified: boolean;
}

interface MentorshipMessage {
  _id?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string | Date;
}

interface MentorshipPageProps {
  subjects: Subject[];
}

export const MentorshipPage: React.FC<MentorshipPageProps> = ({ subjects }) => {
  const { session, profile } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Chat & Booking Tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'book'>('chat');
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSubjectId, setBookingSubjectId] = useState(subjects[0]?._id || '');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    mentorName: string;
    subjectCode: string;
    subjectName: string;
    message: string;
    availability: string;
    timestamp: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMentors = async () => {
    try {
      const data = await api.get<Mentor[]>('/mentors');
      if (data && data.length > 0) {
        setMentors(data);
        if (!selectedMentorId) setSelectedMentorId(data[0]._id);
      } else {
        // Fallback realistic verified mentors
        const initialMentors: Mentor[] = [
          {
            _id: 'm1',
            userId: {
              _id: 'u_mentor1',
              name: 'Prof. Aryan Sharma (Senior Scholar)',
              email: 'aryan.cse@university.edu',
              reputationPoints: 340,
            },
            expertiseSubjectIds: [
              { _id: 's1', code: 'CS-201', name: 'Data Structures & Algorithms' },
              { _id: 's2', code: 'CS-202', name: 'Operating Systems' },
            ],
            bio: 'Final-year research scholar. Specialized in balanced trees, asynchronous process synchronization, and university exam preparation strategies.',
            availability: 'Mon - Thu 6:00 PM - 8:30 PM IST',
            rating: 4.95,
            sessionsCompleted: 42,
            verified: true,
          },
          {
            _id: 'm2',
            userId: {
              _id: 'u_mentor2',
              name: 'Sneha Patel (Teaching Assistant)',
              email: 'sneha.patel@university.edu',
              reputationPoints: 260,
            },
            expertiseSubjectIds: [
              { _id: 's3', code: 'CS-203', name: 'Database Management Systems' },
              { _id: 's6', code: 'CS-303', name: 'Machine Learning' },
            ],
            bio: 'Master of Technology scholar. Guided 30+ juniors through SQL normalization, BCNF proofs, and machine learning backpropagation mathematics.',
            availability: 'Weekends 10:00 AM - 1:00 PM IST',
            rating: 4.9,
            sessionsCompleted: 31,
            verified: true,
          },
          {
            _id: 'm3',
            userId: {
              _id: 'u_mentor3',
              name: 'Rohan Verma (Competitive Programming Lead)',
              email: 'rohan.verma@university.edu',
              reputationPoints: 195,
            },
            expertiseSubjectIds: [
              { _id: 's1', code: 'CS-201', name: 'Data Structures & Algorithms' },
              { _id: 's4', code: 'CS-301', name: 'Computer Networks' },
            ],
            bio: 'Candidate Master on Codeforces. Focusing on graph algorithms, dynamic programming state spaces, and network framing mechanics.',
            availability: 'Daily 9:00 PM - 10:30 PM IST',
            rating: 4.85,
            sessionsCompleted: 19,
            verified: true,
          },
        ];
        setMentors(initialMentors);
        if (!selectedMentorId) setSelectedMentorId(initialMentors[0]._id);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [subjects]);

  // Load chat messages when mentor is selected
  useEffect(() => {
    if (!selectedMentorId) return;
    const currentMentor = mentors.find((m) => m._id === selectedMentorId);
    const mentorName = currentMentor?.userId?.name || 'Mentor';

    setMessages([
      {
        senderId: 'mentor-init',
        senderName: mentorName,
        text: `Hello! I'm ${mentorName}. I'm here to assist with syllabus queries, exam doubts, and conceptual roadblocks. How can I help you today?`,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }, [selectedMentorId, mentors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send 1-on-1 Message to Mentor
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');

    const newMsg: MentorshipMessage = {
      senderId: session?.user?.id || 'current-user',
      senderName: profile?.name || session?.user?.email?.split('@')[0] || 'Me (Mentee)',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulated mentor real-time response after 1.5 seconds for interactivity
    setTimeout(() => {
      const activeMentor = mentors.find((m) => m._id === selectedMentorId);
      const mentorReply: MentorshipMessage = {
        senderId: 'mentor-reply',
        senderName: activeMentor?.userId?.name || 'Mentor',
        text: `Thanks for reaching out! Regarding that topic, let's look at the standard syllabus derivation and exam past papers. Feel free to book a dedicated 1-on-1 session if you'd like a live breakdown.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, mentorReply]);
    }, 1200);
  };

  // Submit Session Booking with feedback & error handling
  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMessage.trim() || isBookingSubmitting) return;

    const activeMentor = mentors.find((m) => m._id === selectedMentorId);
    if (!activeMentor) return;

    const effectiveSubject = subjects.find((s) => s._id === bookingSubjectId) || subjects[0] || {
      _id: 'sub_default',
      code: 'CS-GEN',
      name: 'General Academic Guidance',
    };

    setIsBookingSubmitting(true);
    setBookingError(null);

    try {
      await api.post('/mentors/request', {
        mentorUserId: activeMentor.userId._id,
        subjectId: effectiveSubject._id,
        message: bookingMessage.trim(),
      });

      setConfirmedBooking({
        mentorName: activeMentor.userId?.name || 'Verified Mentor',
        subjectCode: effectiveSubject.code,
        subjectName: effectiveSubject.name,
        message: bookingMessage.trim(),
        availability: activeMentor.availability,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setBookingMessage('');
    } catch (err: any) {
      console.warn('[MentorshipPage] Booking session request failed:', err);
      const isOffline = api.isBackendUnavailable(err);
      if (isOffline) {
        // In local demo or offline mode, simulate successful confirmation
        setConfirmedBooking({
          mentorName: activeMentor.userId?.name || 'Verified Mentor',
          subjectCode: effectiveSubject.code,
          subjectName: effectiveSubject.name,
          message: bookingMessage.trim(),
          availability: activeMentor.availability,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        setBookingMessage('');
      } else {
        setBookingError(err?.message || 'Failed to submit mentorship booking request. Please try again.');
      }
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const selectedMentor = mentors.find((m) => m._id === selectedMentorId) || mentors[0];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-space-4 py-space-4 flex flex-col flex-1 min-h-[calc(100vh-60px)]">
      {/* Page Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2 pb-space-3 border-b border-border-default mb-space-3">
        <div>
          <h1 className="text-[20px] font-semibold text-text-secondary flex items-center gap-2">
            <Award className="w-5 h-5 text-text-secondary" />
            <span>Senior-junior mentorship hub</span>
          </h1>
          <p className="text-[13px] text-text-tertiary">
            Connect directly with verified high-reputation scholars and course mentors
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border-default bg-surface-muted text-[12px] text-text-tertiary">
          <CheckCircle2 className="w-3.5 h-3.5 text-text-secondary" />
          <span>Verified university tutors</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-4 flex-1">
        {/* Left Column: Mentor Roster (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-2">
          <div className="text-text-tertiary text-[12px] uppercase font-medium tracking-wider px-1">
            <span>Verified mentors ({mentors.length})</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface-muted border border-border-default rounded-md animate-pulse" />
              ))
            ) : (
              mentors.map((mentor) => {
                const isSelected = mentor._id === selectedMentorId;
                return (
                  <button
                    key={mentor._id}
                    type="button"
                    onClick={() => {
                      setSelectedMentorId(mentor._id);
                      setActiveTab('chat');
                    }}
                    className={`w-full text-left p-space-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-surface-interactive border-border-interactive shadow-sm'
                        : 'bg-surface-muted border-border-default hover:border-border-interactive hover:bg-surface-interactive/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-secondary text-[14px] line-clamp-1">
                        {mentor.userId?.name || 'Verified Mentor'}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-text-secondary text-[12px] font-medium">
                        <Star className="w-3.5 h-3.5 fill-current text-text-secondary" />
                        <span>{mentor.rating.toFixed(1)}</span>
                      </span>
                    </div>

                    <p className="text-[12px] text-text-tertiary line-clamp-2">
                      {mentor.bio}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {mentor.expertiseSubjectIds?.map((sub) => (
                        <span
                          key={sub._id || sub.code}
                          className="font-mono text-[10px] bg-surface-base px-1.5 py-0.5 rounded border border-border-default text-text-secondary"
                        >
                          {sub.code}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1 border-t border-border-default/50">
                      <span>{mentor.sessionsCompleted} sessions completed</span>
                      <span className="font-medium text-text-secondary">{mentor.userId?.reputationPoints || 100} pts</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Mentor Workspace & Live Chat (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-surface-muted border border-border-interactive rounded-lg overflow-hidden h-[calc(100vh-210px)]">
          {selectedMentor ? (
            <>
              {/* Mentor Workspace Header */}
              <div className="p-space-3 border-b border-border-default bg-surface-base flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-semibold text-text-secondary">
                      {selectedMentor.userId?.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-surface-interactive border border-border-interactive px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-text-secondary" />
                      <span>Verified scholar</span>
                    </span>
                  </div>
                  <p className="text-[12px] text-text-tertiary mt-0.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                    <span>Availability: {selectedMentor.availability}</span>
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-md border border-border-default">
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1 text-[12px] font-medium rounded transition-colors ${
                      activeTab === 'chat'
                        ? 'bg-surface-interactive text-text-secondary shadow-sm'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    1-on-1 Live Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('book')}
                    className={`px-3 py-1 text-[12px] font-medium rounded transition-colors ${
                      activeTab === 'book'
                        ? 'bg-surface-interactive text-text-secondary shadow-sm'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    Book Session
                  </button>
                </div>
              </div>

              {/* View 1: 1-on-1 Live Chat */}
              {activeTab === 'chat' ? (
                <>
                  <div className="flex-1 overflow-y-auto p-space-4 space-y-space-3 bg-surface-base/40">
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === (session?.user?.id || 'current-user');
                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-medium text-text-secondary">
                              {msg.senderName}
                            </span>
                            <span className="text-[11px] text-text-tertiary">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`max-w-xl p-space-3 rounded-lg text-[13px] leading-relaxed border ${
                              isMe
                                ? 'bg-surface-interactive border-border-interactive text-text-secondary'
                                : 'bg-surface-muted border-border-default text-text-primary'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-space-3 border-t border-border-default bg-surface-base flex items-center gap-space-2"
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Ask ${selectedMentor.userId?.name?.split(' ')[0]} a question...`}
                      className="flex-1 bg-surface-muted border border-border-interactive text-text-secondary text-[13px] px-space-3 py-2 rounded-md placeholder:text-text-disabled focus-visible:ring-2 focus-visible:ring-border-interactive outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[13px] px-space-3 py-2 rounded-md hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                /* View 2: Book Guidance Session */
                <div className="flex-1 overflow-y-auto p-space-4 space-y-space-4 bg-surface-base/40">
                  <div className="p-4 bg-surface-base border border-border-default rounded-md space-y-2">
                    <h3 className="text-[16px] font-semibold text-text-secondary">
                      Session Details with {selectedMentor.userId?.name}
                    </h3>
                    <p className="text-[14px] text-text-tertiary leading-relaxed">
                      {selectedMentor.bio}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <span className="text-[12px] text-text-tertiary font-medium">Areas of guidance:</span>
                      {selectedMentor.expertiseSubjectIds?.map((sub) => (
                        <span key={sub._id} className="text-[11px] text-text-secondary bg-surface-muted px-2 py-0.5 rounded border border-border-default font-mono">
                          {sub.code} — {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Confirmed Booking Feedback Card */}
                  {confirmedBooking ? (
                    <div className="p-5 bg-surface-base border border-border-interactive rounded-lg shadow-sm space-y-4 animate-in fade-in duration-300">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-surface-interactive border border-border-interactive rounded-full shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-text-secondary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[16px] font-semibold text-text-secondary">
                            Session Request Confirmed
                          </h4>
                          <p className="text-[12px] text-text-tertiary">
                            Your guidance request was dispatched to {confirmedBooking.mentorName} at {confirmedBooking.timestamp}.
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface-muted p-3.5 rounded-md border border-border-default space-y-2 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-text-tertiary">Subject:</span>
                          <span className="font-semibold text-text-secondary font-mono">{confirmedBooking.subjectCode} — {confirmedBooking.subjectName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-tertiary">Mentor Availability:</span>
                          <span className="text-text-secondary">{confirmedBooking.availability}</span>
                        </div>
                        <div className="pt-1.5 border-t border-border-default/60">
                          <span className="text-text-tertiary block mb-1">Doubt / Topic Covered:</span>
                          <p className="text-text-secondary italic line-clamp-2">
                            "{confirmedBooking.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setConfirmedBooking(null)}
                          className="px-3 py-1.5 rounded-md text-[12px] font-medium text-text-tertiary hover:text-text-secondary border border-border-default bg-surface-muted hover:bg-surface-interactive transition-colors"
                        >
                          Book Another Session
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('chat');
                            setConfirmedBooking(null);
                          }}
                          className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[12px] px-4 py-1.5 rounded-md hover:opacity-90 transition-all shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Open 1-on-1 Live Chat</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {bookingError && (
                        <div className="p-3 bg-surface-muted border border-border-interactive text-text-secondary text-[12px] rounded-md flex items-center justify-between gap-2">
                          <span>{bookingError}</span>
                          <button
                            type="button"
                            onClick={() => setBookingError(null)}
                            className="text-text-tertiary hover:text-text-secondary text-[11px] underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      <form onSubmit={handleBookSession} className="space-y-space-3 bg-surface-base p-4 border border-border-default rounded-md">
                        <div>
                          <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                            Select subject
                          </label>
                          <select
                            value={bookingSubjectId}
                            onChange={(e) => setBookingSubjectId(e.target.value)}
                            className="w-full bg-surface-muted text-text-secondary text-[12px] px-3 py-2 rounded border border-border-interactive focus-visible:ring-2"
                          >
                            {subjects.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.code} — {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                            Specific exam doubt or syllabus topic
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={bookingMessage}
                            onChange={(e) => setBookingMessage(e.target.value)}
                            placeholder="e.g. Need clarification on Unit 3 Dynamic Programming state transitions and previous mid-sem exam problems..."
                            className="w-full bg-surface-muted text-text-secondary text-[12px] px-3 py-2 rounded border border-border-interactive focus-visible:ring-2 resize-none"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={isBookingSubmitting || !bookingMessage.trim()}
                            className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[12px] px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{isBookingSubmitting ? 'Submitting Request...' : 'Confirm session booking'}</span>
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-tertiary text-[14px]">
              Select a mentor from the directory to start a session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

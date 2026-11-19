import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Subject } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ThumbsUp, CheckCircle2, Plus, Send, Clock, Loader2 } from 'lucide-react';

interface DiscussionComment {
  _id: string;
  authorId: {
    _id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    reputationPoints?: number;
  };
  body: string;
  isAcceptedAnswer: boolean;
  upvotes: number;
  createdAt: string;
}

interface Discussion {
  _id: string;
  title: string;
  body: string;
  authorId: {
    _id: string;
    name: string;
    role: string;
    reputationPoints?: number;
  };
  subjectId: {
    _id: string;
    code: string;
    name: string;
  };
  tags: string[];
  upvotes: number;
  resolved?: boolean;
  status?: 'open' | 'resolved' | 'closed';
  acceptedAnswerId?: string;
  comments?: DiscussionComment[];
  commentCount?: number;
  createdAt: string;
}

interface DiscussionsPageProps {
  subjects: Subject[];
}

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({ subjects }) => {
  const { session, profile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [activeDiscussionId, setActiveDiscussionId] = useState<string>('');

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // New doubt modal state
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?._id || '');
  const [newTags, setNewTags] = useState('');
  const [asking, setAsking] = useState(false);

  const fetchCommentsForDiscussion = useCallback(async (discussionId: string) => {
    if (!discussionId || discussionId.startsWith('d') || discussionId.startsWith('disc-')) {
      // Local seed or optimistic discussion
      return;
    }
    setCommentsLoading(true);
    try {
      const data = await api.get<DiscussionComment[]>(`/discussions/${discussionId}/comments`);
      if (Array.isArray(data)) {
        setDiscussions((prev) =>
          prev.map((d) => (d._id === discussionId ? { ...d, comments: data } : d))
        );
      }
    } catch (err) {
      console.warn('[DiscussionsPage] Error fetching comments for discussion:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const fetchDiscussions = async () => {
    try {
      const endpoint = selectedSubjectId === 'all' ? '/discussions' : `/discussions?subjectId=${selectedSubjectId}`;
      const data = await api.get<Discussion[]>(endpoint);
      if (data && data.length > 0) {
        setDiscussions(data);
        if (!activeDiscussionId) setActiveDiscussionId(data[0]._id);
      } else {
        // Fallback realistic academic discussions
        const seedDiscussions: Discussion[] = [
          {
            _id: 'd1',
            title: 'Difference between B-Tree and B+ Tree node structural pointers in DBMS?',
            body: 'In Unit 3 database indexing, how do B+ trees guarantee sequential scan performance compared to traditional B-trees where records reside in internal nodes?',
            authorId: { _id: 'u1', name: 'Aarav Mehta', role: 'student' },
            subjectId: { _id: 's3', code: 'CS-203', name: 'Database Management Systems' },
            tags: ['indexing', 'b-trees', 'unit-3'],
            upvotes: 14,
            resolved: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            comments: [
              {
                _id: 'c1',
                authorId: { _id: 'u2', name: 'Prof. Aryan Sharma', role: 'mentor' },
                body: 'In a B+ Tree, only the leaf nodes store pointers to actual data records; internal nodes only store navigation keys. Crucially, all leaf nodes are linked via a doubly-linked list, allowing O(log n) initial search followed by O(1) sequential traversal across ranges without traversing parent nodes.',
                isAcceptedAnswer: true,
                upvotes: 22,
                createdAt: new Date(Date.now() - 72000000).toISOString(),
              },
            ],
          },
          {
            _id: 'd2',
            title: 'How to prove Peterson’s Algorithm satisfies bounded waiting in OS concurrency?',
            body: 'Can someone provide the formal invariance proof that process P_i will enter the critical section after at most one turn of process P_j?',
            authorId: { _id: 'u3', name: 'Sneha Patel', role: 'student' },
            subjectId: { _id: 's2', code: 'CS-202', name: 'Operating Systems' },
            tags: ['concurrency', 'petersons-algorithm', 'unit-2'],
            upvotes: 9,
            resolved: false,
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            comments: [
              {
                _id: 'c2',
                authorId: { _id: 'u4', name: 'Rohan Verma', role: 'student' },
                body: 'When P_i is waiting in while(flag[j] && turn == j), if P_j exits CS, it resets flag[j] = false. If P_j tries to immediately re-enter, it sets turn = i, which allows P_i to pass through the while condition. Thus bounded waiting holds with a bound of 1.',
                isAcceptedAnswer: false,
                upvotes: 8,
                createdAt: new Date(Date.now() - 36000000).toISOString(),
              },
            ],
          },
          {
            _id: 'd3',
            title: 'Is Dijkstra’s algorithm greedy or dynamic programming in CS-201?',
            body: 'Our lecture slides categorized Dijkstra under greedy approaches, but our textbook claims optimal substructure makes it DP. What is the standard university exam classification?',
            authorId: { _id: 'u5', name: 'Divya Iyer', role: 'student' },
            subjectId: { _id: 's1', code: 'CS-201', name: 'Data Structures & Algorithms' },
            tags: ['graphs', 'dijkstra', 'greedy'],
            upvotes: 18,
            resolved: true,
            createdAt: new Date(Date.now() - 25920000).toISOString(),
            comments: [
              {
                _id: 'c3',
                authorId: { _id: 'u2', name: 'Prof. Aryan Sharma', role: 'mentor' },
                body: 'In academic curricula, Dijkstra is fundamentally classified as a Greedy Algorithm because at each iteration it commits irrevocably to the unvisited node with minimal tentative distance without backtracking. While it exhibits optimal substructure, it does not recompute overlapping subproblems.',
                isAcceptedAnswer: true,
                upvotes: 31,
                createdAt: new Date(Date.now() - 18000000).toISOString(),
              },
            ],
          },
        ];
        setDiscussions(seedDiscussions);
        if (!activeDiscussionId) setActiveDiscussionId(seedDiscussions[0]._id);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedSubjectId]);

  useEffect(() => {
    if (activeDiscussionId) {
      fetchCommentsForDiscussion(activeDiscussionId);
    }
  }, [activeDiscussionId, fetchCommentsForDiscussion]);

  // Handle Ask New Doubt
  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    setAsking(true);
    try {
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const targetSub = subjects.find((s) => s._id === newSubjectId) || subjects[0];
      const created = await api.post<Discussion>('/discussions', {
        subjectId: targetSub?._id,
        title: newTitle.trim(),
        body: newBody.trim(),
        tags: tagsArray,
      });

      if (created && created._id) {
        setDiscussions((prev) => [created, ...prev]);
        setActiveDiscussionId(created._id);
      }
      setShowAskModal(false);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
    } catch {
      // Local optimistic fallback
      const localDisc: Discussion = {
        _id: 'disc-' + Date.now(),
        title: newTitle.trim(),
        body: newBody.trim(),
        authorId: {
          _id: session?.user?.id || 'current-user',
          name: profile?.name || session?.user?.email?.split('@')[0] || 'Me (Scholar)',
          role: profile?.role || 'student',
        },
        subjectId: {
          _id: newSubjectId,
          code: subjects.find((s) => s._id === newSubjectId)?.code || 'CS-COURSE',
          name: subjects.find((s) => s._id === newSubjectId)?.name || 'Course',
        },
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        upvotes: 1,
        resolved: false,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setDiscussions((prev) => [localDisc, ...prev]);
      setActiveDiscussionId(localDisc._id);
      setShowAskModal(false);
      setNewTitle('');
      setNewBody('');
    } finally {
      setAsking(false);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeDiscussionId) return;

    const text = commentText.trim();
    setCommentText('');
    setSubmittingComment(true);

    const newComment: DiscussionComment = {
      _id: 'comm-' + Date.now(),
      authorId: {
        _id: session?.user?.id || 'current-user',
        name: profile?.name || session?.user?.email?.split('@')[0] || 'Me (Scholar)',
        role: profile?.role || 'student',
      },
      body: text,
      isAcceptedAnswer: false,
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };

    setDiscussions((prev) =>
      prev.map((d) => (d._id === activeDiscussionId ? { ...d, comments: [...(d.comments || []), newComment] } : d))
    );

    try {
      const created = await api.post<DiscussionComment>(`/discussions/${activeDiscussionId}/comments`, { body: text });
      if (created && created._id) {
        setDiscussions((prev) =>
          prev.map((d) =>
            d._id === activeDiscussionId
              ? {
                  ...d,
                  comments: (d.comments || []).map((c) => (c._id === newComment._id ? created : c)),
                  commentCount: (d.commentCount || 0) + 1,
                }
              : d
          )
        );
      }
    } catch {
      // Retained optimistically
    } finally {
      setSubmittingComment(false);
    }
  };

  const activeDiscussion = discussions.find((d) => d._id === activeDiscussionId) || discussions[0];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-space-4 py-space-4 flex flex-col flex-1 min-h-[calc(100vh-60px)]">
      {/* Page Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2 pb-space-3 border-b border-border-default mb-space-3">
        <div>
          <h1 className="text-[20px] font-semibold text-text-secondary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-text-secondary" />
            <span>Community doubts & Q&A</span>
          </h1>
          <p className="text-[13px] text-text-tertiary">
            Peer problem solving with reputation points (+15 pts for accepted answers)
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full min-w-0 rounded-md border border-border-interactive bg-surface-muted px-2.5 py-1.5 text-[12px] text-text-secondary focus-visible:ring-2 sm:w-auto"
          >
            <option value="all">All academic courses</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAskModal(true)}
            className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-text-secondary px-space-3 py-1.5 text-[13px] font-medium text-surface-base transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ask question</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-4 flex-1">
        {/* Left Column: Doubt Feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-2">
          <div className="text-text-tertiary text-[12px] uppercase font-medium tracking-wider px-1">
            <span>Course questions ({discussions.length})</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface-muted border border-border-default rounded-md animate-pulse" />
              ))
            ) : discussions.length === 0 ? (
              <div className="p-6 bg-surface-muted border border-border-default rounded-md text-center text-text-tertiary text-[13px]">
                No questions found for this course filter.
              </div>
            ) : (
              discussions.map((d) => {
                const isSelected = d._id === activeDiscussionId;
                return (
                  <button
                    key={d._id}
                    type="button"
                    onClick={() => setActiveDiscussionId(d._id)}
                    className={`w-full text-left p-space-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-surface-interactive border-border-interactive shadow-sm'
                        : 'bg-surface-muted border-border-default hover:border-border-interactive hover:bg-surface-interactive/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-text-secondary bg-surface-base px-2 py-0.5 rounded border border-border-default">
                        {d.subjectId?.code || 'CS-COURSE'}
                      </span>
                      {d.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-surface-base border border-border-interactive px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-text-secondary" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">
                          {d.comments?.length || 0} answers
                        </span>
                      )}
                    </div>

                    <h2 className="text-[14px] font-semibold text-text-secondary line-clamp-2 leading-snug">
                      {d.title}
                    </h2>

                    <p className="text-[12px] text-text-tertiary line-clamp-2 leading-relaxed">
                      {d.body}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1 border-t border-border-default/50">
                      <span>Asked by {d.authorId?.name}</span>
                      <span className="flex items-center gap-1 font-medium text-text-secondary">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{d.upvotes}</span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Discussion Thread & Solutions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-surface-muted border border-border-interactive rounded-lg overflow-hidden h-[calc(100vh-210px)]">
          {activeDiscussion ? (
            <>
              {/* Question Header */}
              <div className="p-space-4 border-b border-border-default bg-surface-base space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-text-secondary bg-surface-interactive px-2 py-0.5 rounded border border-border-default">
                    {activeDiscussion.subjectId?.code} — {activeDiscussion.subjectId?.name}
                  </span>
                  <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(activeDiscussion.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <h2 className="text-[16px] font-semibold text-text-secondary">
                  {activeDiscussion.title}
                </h2>

                <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-line font-light">
                  {activeDiscussion.body}
                </p>

                {activeDiscussion.tags && activeDiscussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activeDiscussion.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-text-tertiary bg-surface-muted px-2 py-0.5 rounded border border-border-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Answers & Solutions List */}
              <div className="flex-1 overflow-y-auto p-space-4 space-y-space-3 bg-surface-base/40">
                <div className="flex items-center justify-between pb-1 border-b border-border-default">
                  <span className="text-[12px] uppercase font-semibold text-text-tertiary tracking-wider flex items-center gap-2">
                    <span>Community solutions ({activeDiscussion.comments?.length || 0})</span>
                    {commentsLoading && <Loader2 className="w-3 h-3 animate-spin text-text-tertiary" />}
                  </span>
                </div>

                {commentsLoading ? (
                  <div className="space-y-3 py-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-24 bg-surface-muted border border-border-default rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : activeDiscussion.comments && activeDiscussion.comments.length > 0 ? (
                  activeDiscussion.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className={`p-space-3 rounded-lg border space-y-2 ${
                        comment.isAcceptedAnswer
                          ? 'bg-surface-interactive border-border-interactive shadow-sm'
                          : 'bg-surface-muted border-border-default'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-text-secondary">
                            {comment.authorId?.name}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-text-tertiary px-1.5 py-0.2 bg-surface-base rounded border border-border-default">
                            {comment.authorId?.role || 'student'}
                          </span>
                          {comment.authorId?.reputationPoints !== undefined && (
                            <span className="text-[11px] font-medium text-text-tertiary">
                              {comment.authorId.reputationPoints} pts
                            </span>
                          )}
                        </div>
                        {comment.isAcceptedAnswer && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-surface-base border border-border-interactive px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-text-secondary" />
                            <span>Accepted answer (+15 pts)</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-line font-light">
                        {comment.body}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-text-tertiary border-t border-border-default/40">
                        <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1 text-text-secondary">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.upvotes} upvotes</span>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-text-tertiary text-[13px]">
                    No answers submitted yet. Be the first to help your fellow students!
                  </div>
                )}
              </div>

              {/* Add Answer Input Form */}
              <form
                onSubmit={handleAddComment}
                className="p-space-3 border-t border-border-default bg-surface-base flex items-center gap-space-2"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post an academic explanation or proof..."
                  className="flex-1 bg-surface-muted border border-border-interactive text-text-secondary text-[13px] px-space-3 py-2 rounded-md placeholder:text-text-disabled focus-visible:ring-2 focus-visible:ring-border-interactive outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[13px] px-space-3 py-2 rounded-md hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Answer</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-tertiary text-[14px]">
              Select a question to view full solution discussion.
            </div>
          )}
        </div>
      </div>

      {/* Ask Doubt Modal */}
      {showAskModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-space-4 bg-surface-base/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg bg-surface-muted border border-border-interactive rounded-lg shadow-md p-space-4 sm:p-6 flex flex-col">
            <h2 className="text-[18px] font-semibold text-text-secondary mb-1">
              Ask an academic question
            </h2>
            <p className="text-[12px] text-text-tertiary mb-space-3">
              Get answers from course mentors and students with verified course citations
            </p>

            <form onSubmit={handleAskDoubt} className="space-y-space-3">
              <div>
                <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                  Subject
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full bg-surface-base text-text-secondary text-[14px] px-3 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
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
                  Question title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to compute time complexity of Bellman-Ford algorithm?"
                  className="w-full bg-surface-base text-text-secondary text-[14px] px-3 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                  Details & context
                </label>
                <textarea
                  required
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe where you are stuck, boundary cases, or specific exam question details..."
                  className="w-full bg-surface-base text-text-secondary text-[13px] px-3 py-2 rounded-md border border-border-interactive focus-visible:ring-2 resize-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. graphs, dynamic-programming, unit-2"
                  className="w-full bg-surface-base text-text-secondary text-[14px] px-3 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
                />
              </div>

              <div className="flex justify-end gap-space-2 pt-space-3 border-t border-border-default mt-space-3">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-md bg-surface-base text-text-secondary border border-border-default hover:bg-surface-interactive text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={asking}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-text-secondary text-surface-base text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {asking ? 'Posting...' : 'Post question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

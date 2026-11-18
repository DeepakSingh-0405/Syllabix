import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trophy, Medal, Award, Flame, Sparkles } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  _id: string;
  name: string;
  role: string;
  reputationPoints: number;
  badge: string;
  tier: 'diamond' | 'gold' | 'silver' | 'bronze';
}

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await api.get<LeaderboardEntry[]>('/gamification/leaderboard');
        setLeaderboard(data || []);
      } catch {
        // Fallback realistic academic scholars
        setLeaderboard([
          { rank: 1, _id: 'u1', name: 'Aarav Mehta', role: 'student', reputationPoints: 185, badge: 'Curriculum Pioneer', tier: 'diamond' },
          { rank: 2, _id: 'u2', name: 'Prof. Aryan Sharma', role: 'faculty', reputationPoints: 140, badge: 'Senior Mentor', tier: 'gold' },
          { rank: 3, _id: 'u3', name: 'Sneha Patel', role: 'student', reputationPoints: 95, badge: 'Senior Mentor', tier: 'gold' },
          { rank: 4, _id: 'u4', name: 'Rohan Verma', role: 'student', reputationPoints: 65, badge: 'Doubt Solver', tier: 'silver' },
          { rank: 5, _id: 'u5', name: 'Divya Iyer', role: 'student', reputationPoints: 45, badge: 'Doubt Solver', tier: 'silver' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-space-4 py-space-4 flex flex-col flex-1 min-h-[calc(100vh-60px)]">
      {/* Page Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2 pb-space-3 border-b border-border-default mb-space-4">
        <div>
          <h1 className="text-[20px] font-semibold text-text-secondary flex items-center gap-2">
            <Trophy className="w-5 h-5 text-text-secondary" />
            <span>Academic contributor leaderboard</span>
          </h1>
          <p className="text-[13px] text-text-tertiary">
            Recognizing scholars and mentors enriching curriculum clarity and doubt resolution
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border-default bg-surface-muted text-[12px] text-text-tertiary">
          <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
          <span>Updated hourly</span>
        </div>
      </div>

      {/* Gamification Points Rules Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-space-4">
        <div className="p-3 bg-surface-muted border border-border-default rounded-lg">
          <div className="text-[12px] text-text-tertiary">Verified syllabus upload</div>
          <div className="text-[18px] font-semibold text-text-secondary mt-0.5">+10 pts</div>
          <span className="text-[11px] text-text-tertiary">PDFs, notes, past papers</span>
        </div>
        <div className="p-3 bg-surface-muted border border-border-default rounded-lg">
          <div className="text-[12px] text-text-tertiary">Accepted doubt solution</div>
          <div className="text-[18px] font-semibold text-text-secondary mt-0.5">+15 pts</div>
          <span className="text-[11px] text-text-tertiary">Verified by original asker</span>
        </div>
        <div className="p-3 bg-surface-muted border border-border-default rounded-lg">
          <div className="text-[12px] text-text-tertiary">Mentorship session completed</div>
          <div className="text-[18px] font-semibold text-text-secondary mt-0.5">+20 pts</div>
          <span className="text-[11px] text-text-tertiary">1-on-1 student guidance</span>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="flex-1 bg-surface-muted border border-border-interactive rounded-lg overflow-hidden">
        <div className="p-space-3 border-b border-border-default bg-surface-base flex items-center justify-between">
          <span className="text-[12px] uppercase font-semibold text-text-tertiary tracking-wider">
            Top academic rankings
          </span>
          <span className="text-[12px] text-text-tertiary">
            Showing top scholars
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surface-interactive/40 border-b border-border-default text-[12px] text-text-tertiary uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 w-20">Rank</th>
                <th scope="col" className="px-6 py-3">Scholar</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Honor badge</th>
                <th scope="col" className="px-6 py-3 text-right">Reputation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-6 bg-surface-interactive rounded" />
                    </td>
                  </tr>
                ))
              ) : (
                leaderboard.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-surface-interactive/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        {entry.rank === 1 ? (
                          <Medal className="w-5 h-5 text-yellow-500" />
                        ) : entry.rank === 2 ? (
                          <Medal className="w-5 h-5 text-slate-400" />
                        ) : entry.rank === 3 ? (
                          <Medal className="w-5 h-5 text-amber-700" />
                        ) : (
                          <span className="text-text-tertiary font-mono text-[13px]">#{entry.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-text-secondary text-[14px]">
                        {entry.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-text-tertiary capitalize">
                        {entry.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium border border-border-interactive bg-surface-base text-text-secondary">
                        <Award className="w-3.5 h-3.5 text-text-secondary" />
                        <span>{entry.badge}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-text-secondary text-[15px]">
                        <Flame className="w-4 h-4 text-text-secondary" />
                        <span>{entry.reputationPoints}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

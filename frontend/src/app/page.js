'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { assignmentService, mcqService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BookOpen, Clock, AlertTriangle, 
  ChevronRight, LayoutDashboard, MessageSquare, 
  Settings, LogOut, Timer, GraduationCap,
  Play, Pause, RotateCcw, CheckCircle2, ShieldCheck, 
  HelpCircle, Trash2
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ dueToday: 0, pending: 0, completed: 0 });

  // MCQ State
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (activeTab === 'study') fetchQuestions();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      const { data } = await assignmentService.fetchAll();
      setAssignments(data);

      if (user.role === 'teacher') {
        const { data: teacherStats } = await assignmentService.fetchTeacherStats();
        setStats({
          totalSubmissions: teacherStats.totalSubmissions,
          pendingGrading: teacherStats.pendingGrading,
          flagged: teacherStats.flagged
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const dueToday = data.filter(a => a.deadline.startsWith(today)).length;
        const pending = data.filter(a => a.status === 'pending').length;
        const completed = data.filter(a => a.status === 'completed').length;
        setStats({ dueToday, pending, completed });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await mcqService.fetchPractice();
      setQuestions(data);
    } catch (err) {
      console.error('MCQ Fetch error:', err);
    }
  };

  if (loading || !user) return <div className="h-screen flex items-center justify-center font-bold text-lavender animate-pulse">AssignFlow Loading...</div>;

  const renderTeacherDashboard = () => {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Analytics Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-text-dark flex items-center gap-2">
              <ShieldCheck className="text-lavender" /> Class Health Analytics
            </h3>
            <span className="text-xs font-bold text-text-mid bg-white px-4 py-2 rounded-full border border-lavender/10">Updated live</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-white p-8">
              <p className="text-xs font-black text-text-mid uppercase tracking-widest mb-6">Submission Velocity</p>
              <div className="space-y-4">
                {[
                  { label: 'Algorithms', val: 85, color: 'bg-lavender' },
                  { label: 'Web Dev', val: 40, color: 'bg-salmon' },
                  { label: 'Database', val: 65, color: 'bg-mint' }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-3 bg-bg rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} className={`h-full ${item.color} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-lavender text-white p-8 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">AI Insights</p>
                <h4 className="text-2xl font-black mb-4">Class Performance is 12% higher this week.</h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="bg-white/20 px-3 py-2 rounded-xl">3 Flagged Items</div>
                <div className="bg-white/20 px-3 py-2 rounded-xl">12 Pending Grades</div>
              </div>
            </div>
          </div>
        </section>

        {/* MCQ Oversight */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-text-dark flex items-center gap-2">
              <GraduationCap className="text-lavender" /> MCQ Assessments
            </h3>
            <button 
              onClick={() => router.push('/mcq/create')}
              className="text-lavender font-bold text-sm bg-lavender-light px-4 py-2 rounded-xl hover:bg-lavender hover:text-white transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Create New Quiz
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Weekly Quiz 1', 'Data Structures Intro', 'Final Mock'].map((quiz, i) => (
              <div key={i} className="card bg-white p-6 hover:shadow-xl transition-all group">
                <div className="w-10 h-10 bg-bg rounded-xl flex items-center justify-center text-lavender mb-4 group-hover:bg-lavender group-hover:text-white transition-colors">
                  <HelpCircle size={20} />
                </div>
                <h4 className="font-black text-text-dark mb-1">{quiz}</h4>
                <p className="text-xs text-text-mid font-bold mb-4">15 Questions • 88% Completion</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-bg text-text-dark text-[10px] font-black uppercase rounded-lg hover:bg-lavender-light transition-all">View Results</button>
                  <button className="p-2 bg-bg text-salmon rounded-lg hover:bg-salmon-light"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Assignments */}
        <section>
          <h3 className="text-xl font-black text-text-dark mb-6">Active Submissions</h3>
          <div className="space-y-4">
            {assignments.map((a, i) => (
              <AssignmentRow key={a._id} assignment={a} index={i} onClick={() => router.push(`/assignments/${a._id}`)} />
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderContent = () => {
    if (user.role === 'teacher' && activeTab === 'dashboard') {
      return renderTeacherDashboard();
    }

    switch(activeTab) {
      case 'assignments':
        return (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-text-dark">All Assignments</h3>
            </div>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="card text-center py-20">No assignments yet.</div>
              ) : (
                assignments.map((a, i) => <AssignmentRow key={a._id} assignment={a} index={i} onClick={() => router.push(`/assignments/${a._id}`)} />)
              )}
            </div>
          </section>
        );
      case 'study':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Pomodoro Timer */}
            <div className="card bg-lavender text-white p-10 flex flex-col items-center justify-center shadow-2xl shadow-lavender/30">
              <Timer className="mb-4 opacity-50" size={32} />
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest">Focus Session</h3>
              <div className="text-7xl font-black mb-10 font-mono tracking-tighter">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsActive(!isActive)} className="bg-white text-lavender p-4 rounded-2xl shadow-xl hover:scale-110 transition-all">
                  {isActive ? <Pause /> : <Play />}
                </button>
                <button onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }} className="bg-lavender-mid text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-all">
                  <RotateCcw />
                </button>
              </div>
            </div>

            {/* MCQ Practice */}
            <div className="card bg-white p-8 border-2 border-lavender/10">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="text-lavender" />
                <h3 className="text-xl font-black text-text-dark">Practice Quiz</h3>
              </div>
              {questions.length > 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-bg rounded-2xl border border-lavender-mid/10">
                    <p className="font-bold text-text-dark mb-4 text-sm">{questions[currentQIndex].question}</p>
                    <div className="space-y-2">
                      {questions[currentQIndex].options.map((opt, i) => (
                        <QuizOption key={i} label={opt} onClick={() => alert(i === questions[currentQIndex].correctAnswer ? 'Correct! 🌟' : 'Wrong! Try again.')} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-text-light">Question {currentQIndex + 1} of {questions.length}</p>
                    <button 
                      onClick={() => setCurrentQIndex((currentQIndex + 1) % questions.length)}
                      className="text-lavender font-black text-sm hover:underline"
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center font-bold text-text-mid animate-pulse">Loading questions...</div>
              )}
            </div>
          </div>
        );
      case 'tutor':
        return (
          <div className="card h-[600px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-lavender-light rounded-3xl flex items-center justify-center text-lavender animate-bounce">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-2xl font-black text-text-dark">AI Study Buddy</h2>
            <p className="text-text-mid max-w-sm">Coming soon! Your personal AI tutor is currently studying to help you better.</p>
          </div>
        );
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {user.role === 'teacher' ? (
                <>
                  <StatCard icon={CheckCircle2} color="mint" label="Total Submissions" value={stats.totalSubmissions} />
                  <StatCard icon={AlertTriangle} color="amber" label="Pending Grade" value={stats.pendingGrading} />
                  <StatCard icon={ShieldCheck} color="salmon" label="Duplicates Flagged" value={stats.flagged} />
                </>
              ) : (
                <>
                  <StatCard icon={Clock} color="salmon" label="Due Today" value={stats.dueToday} />
                  <StatCard icon={AlertTriangle} color="amber" label="Pending" value={stats.pending} />
                  <StatCard icon={BookOpen} color="mint" label="Completed" value={stats.completed} />
                </>
              )}
            </div>

            <section>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-black text-text-dark">Recent Assignments</h3>
                <button onClick={() => setActiveTab('assignments')} className="text-lavender font-bold text-sm hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="card text-center py-20 bg-white/50 border-dashed border-2">
                    <p className="text-text-mid font-bold">No assignments found. Let's create one!</p>
                  </div>
                ) : (
                  assignments.slice(0, 5).map((a, i) => (
                    <AssignmentRow key={a._id} assignment={a} index={i} onClick={() => router.push(`/assignments/${a._id}`)} />
                  ))
                )}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="hidden lg:flex w-64 bg-white border-r border-lavender-mid/20 flex-col p-6 space-y-8 h-screen sticky top-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-white shadow-lg shadow-lavender/30">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-xl font-black text-text-dark">AssignFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={BookOpen} label="Assignments" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} />
          <SidebarLink icon={GraduationCap} label="Study Tools" active={activeTab === 'study'} onClick={() => setActiveTab('study')} />
          <SidebarLink icon={MessageSquare} label="AI Tutor" active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} />
          <SidebarLink icon={Settings} label="Settings" />
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-salmon font-bold rounded-xl hover:bg-salmon-light transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <p className="text-text-mid font-bold uppercase tracking-widest text-xs">{activeTab}</p>
            <h2 className="text-3xl font-black text-text-dark">
              {activeTab === 'dashboard' ? `Welcome, ${user.displayName}! 👋` : activeTab === 'study' ? 'Study Zone' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'teacher' && (
              <>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/mcq/create')}
                  className="bg-mint text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-mint/30 flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <GraduationCap size={18} /> New MCQ
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/assignments/create')}
                  className="btn-primary shadow-lg shadow-lavender/30 flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Plus size={18} /> New Task
                </motion.button>
              </>
            )}
            <div className="w-12 h-12 rounded-2xl bg-lavender-mid/20 flex items-center justify-center font-black text-lavender border-2 border-lavender/10">
              {user.displayName[0]}
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

function QuizOption({ label, active = false }) {
  return (
    <div className={`p-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${active ? 'border-lavender bg-lavender-light text-lavender' : 'border-white bg-white text-text-mid hover:border-lavender-mid'}`}>
      {label}
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active ? 'bg-lavender text-white shadow-lg shadow-lavender/30' : 'text-text-mid hover:bg-lavender-light hover:text-lavender'}`}>
      <Icon size={20} /> {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    salmon: 'bg-salmon-light text-salmon',
    amber: 'bg-amber-light text-amber',
    mint: 'bg-mint-light text-mint',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-text-mid text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-text-dark">{value}</p>
      </div>
    </div>
  );
}

function AssignmentRow({ assignment, index, onClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="card group hover:border-lavender hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-lavender group-hover:bg-lavender group-hover:text-white transition-colors">
          <BookOpen size={20} />
        </div>
        <div>
          <h4 className="font-black text-text-dark">{assignment.title}</h4>
          <p className="text-text-mid text-xs font-bold">{assignment.subject} • Due {new Date(assignment.deadline).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${assignment.priority === 'high' ? 'bg-salmon-light text-salmon' : 'bg-blue-light text-blue'}`}>
          {assignment.priority}
        </span>
        <ChevronRight size={18} className="text-text-light group-hover:text-lavender transition-colors" />
      </div>
    </motion.div>
  );
}

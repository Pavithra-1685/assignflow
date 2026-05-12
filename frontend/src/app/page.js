'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { assignmentService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BookOpen, Clock, AlertTriangle, 
  ChevronRight, LayoutDashboard, MessageSquare, 
  Settings, LogOut 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ dueToday: 0, pending: 0, completed: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data } = await assignmentService.fetchAll();
      setAssignments(data);
      
      // Calculate basic stats
      const today = new Date().toISOString().split('T')[0];
      const dueToday = data.filter(a => a.deadline.startsWith(today)).length;
      const pending = data.filter(a => a.status === 'pending').length;
      const completed = data.filter(a => a.status === 'completed').length;
      setStats({ dueToday, pending, completed });
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  if (loading || !user) return <div className="h-screen flex items-center justify-center font-bold text-lavender animate-pulse">AssignFlow Loading...</div>;

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-lavender-mid/20 flex-col p-6 space-y-8 h-screen sticky top-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-white shadow-lg shadow-lavender/30">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-xl font-black text-text-dark">AssignFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
          <SidebarLink icon={BookOpen} label="Assignments" />
          <SidebarLink icon={MessageSquare} label="AI Tutor" />
          <SidebarLink icon={Settings} label="Settings" />
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-salmon font-bold rounded-xl hover:bg-salmon-light transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <p className="text-text-mid font-bold uppercase tracking-widest text-xs">Overview</p>
            <h2 className="text-3xl font-black text-text-dark">Welcome, {user.displayName}! 👋</h2>
          </div>
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/assignments/create')}
              className="btn-primary shadow-lg shadow-lavender/30 flex items-center gap-2"
            >
              <Plus size={18} /> New Task
            </motion.button>
            <div className="w-12 h-12 rounded-2xl bg-lavender-mid/20 flex items-center justify-center font-black text-lavender border-2 border-lavender/10">
              {user.displayName[0]}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={Clock} color="salmon" label="Due Today" value={stats.dueToday} />
          <StatCard icon={AlertTriangle} color="amber" label="Pending" value={stats.pending} />
          <StatCard icon={BookOpen} color="mint" label="Completed" value={stats.completed} />
        </div>

        {/* Recent Assignments */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-black text-text-dark">Recent Assignments</h3>
            <button className="text-lavender font-bold text-sm hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="card text-center py-20 bg-white/50 border-dashed border-2">
                <p className="text-text-mid font-bold">No assignments found. Let's create one!</p>
              </div>
            ) : (
              assignments.slice(0, 5).map((a, i) => (
                <AssignmentRow key={a._id} assignment={a} index={i} />
              ))
            )}
          </div>
        </section>
      </main>

      {/* AI Chat Toggle - Mobile Floating */}
      <button className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-lavender rounded-3xl shadow-2xl shadow-lavender/50 flex items-center justify-center text-white z-50">
        <MessageSquare size={28} />
      </button>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active = false }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active ? 'bg-lavender text-white shadow-lg shadow-lavender/30' : 'text-text-mid hover:bg-lavender-light hover:text-lavender'}`}>
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

function AssignmentRow({ assignment, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
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

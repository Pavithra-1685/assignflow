'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignmentService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Book, 
  FileText, Send, AlertCircle,
  Hash, ClipboardList, Plus
} from 'lucide-react';

export default function CreateAssignmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    deadline: '',
    priority: 'medium',
    whatsappGroupId: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && user.role !== 'teacher')) {
    return <div className="h-screen flex items-center justify-center font-bold text-lavender animate-pulse">Verifying Permissions...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (attachment) {
        data.append('attachment', attachment);
      }

      await assignmentService.create(data);
      router.push('/'); // Go back to dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-6 lg:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-lavender font-bold mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-white p-8 lg:p-12 shadow-2xl shadow-lavender/10"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-lavender rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ClipboardList size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-text-dark">New Assignment</h1>
              <p className="text-text-mid font-bold">Set up a new task for your students</p>
            </div>
          </div>

          {error && (
            <div className="bg-salmon-light border border-salmon-mid text-salmon px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 font-bold">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-style">Assignment Title</label>
                <div className="relative">
                  <input 
                    type="text" required
                    className="input-field pl-10"
                    placeholder="E.g. Final Research Paper"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                  <FileText className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
                </div>
              </div>
              <div>
                <label className="label-style">Subject</label>
                <div className="relative">
                  <input 
                    type="text" required
                    className="input-field pl-10"
                    placeholder="E.g. Computer Science"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                  <Book className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <label className="label-style">Description (Optional)</label>
              <textarea 
                className="input-field min-h-[120px] py-4"
                placeholder="Details about the assignment..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-style">Deadline</label>
                <div className="relative">
                  <input 
                    type="date" required
                    className="input-field pl-10"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                  <Calendar className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
                </div>
              </div>
              <div>
                <label className="label-style">Priority</label>
                <select 
                  className="input-field"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label-style">WhatsApp Group ID (Optional Notification)</label>
              <div className="relative">
                <input 
                  type="text"
                  className="input-field pl-10 font-mono text-sm"
                  placeholder="e.g. 12036302... @g.us"
                  value={formData.whatsappGroupId}
                  onChange={(e) => setFormData({...formData, whatsappGroupId: e.target.value})}
                />
                <Hash className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
              </div>
            </div>

            <div>
              <label className="label-style">Attachment (Handout/PDF)</label>
              <div className="border-2 border-dashed border-lavender-mid/30 rounded-2xl p-8 text-center hover:border-lavender transition-colors bg-bg/30">
                <input 
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mx-auto mb-3">
                    <Plus className="text-lavender" />
                  </div>
                  <p className="text-sm font-bold text-text-dark">
                    {attachment ? attachment.name : "Click to upload a file"}
                  </p>
                  <p className="text-xs text-text-mid mt-1">PDF, DOCX or Images up to 10MB</p>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 mt-4 shadow-xl shadow-lavender/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
              {loading ? 'Creating...' : 'Launch Assignment'}
            </button>
          </form>
        </motion.div>
      </div>

      <style jsx>{`
        .label-style {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-text-mid);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

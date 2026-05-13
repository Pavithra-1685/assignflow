'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assignmentService, submissionService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, FileText, 
  CheckCircle, AlertTriangle, Upload,
  ExternalLink, User, ShieldCheck
} from 'lucide-react';

export default function AssignmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        assignmentService.fetchOne(id),
        user.role === 'teacher' ? submissionService.fetchByAssignment(id) : Promise.resolve({ data: [] })
      ]);
      setAssignment(assignRes.data);
      setSubmissions(subRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load assignment details');
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('submission', file);
      await submissionService.submit(id, formData);
      alert('Assignment submitted successfully! AI Duplicate Detection is now processing your work.');
      setFile(null);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (subId, marks) => {
    try {
      await submissionService.grade(subId, { marks: Number(marks) });
      fetchDetails();
    } catch (err) {
      alert('Failed to update grade');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-lavender animate-pulse">Loading Details...</div>;
  if (!assignment) return <div className="p-10 text-center font-bold text-salmon">Assignment not found</div>;

  return (
    <div className="min-h-screen bg-bg p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-lavender font-bold mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-white p-8 lg:p-10 shadow-2xl shadow-lavender/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-lavender-light text-lavender px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                    {assignment.subject}
                  </span>
                  <h1 className="text-3xl font-black text-text-dark">{assignment.title}</h1>
                </div>
                <div className="text-right">
                  <p className="text-text-mid text-xs font-bold uppercase">Deadline</p>
                  <p className="text-salmon font-black flex items-center gap-2">
                    <Clock size={16} /> {new Date(assignment.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-text-mid font-medium leading-relaxed mb-8">{assignment.description || 'No description provided.'}</p>
              
              {assignment.attachment && (
                <a href={assignment.attachment} target="_blank" className="flex items-center gap-3 p-4 bg-bg rounded-2xl border border-lavender-mid/20 hover:border-lavender transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lavender shadow-sm group-hover:bg-lavender group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-dark">Assignment Handout</p>
                    <p className="text-xs text-text-mid">Click to view/download PDF</p>
                  </div>
                  <ExternalLink size={18} className="text-text-light" />
                </a>
              )}
            </motion.div>

            {/* Teacher View: Submissions List */}
            {user.role === 'teacher' && (
              <section className="space-y-6">
                <h3 className="text-xl font-black text-text-dark flex items-center gap-3">
                  <CheckCircle className="text-mint" /> Student Submissions ({submissions.length})
                </h3>
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="card bg-white/50 border-dashed border-2 p-12 text-center text-text-mid font-bold">
                      No submissions yet.
                    </div>
                  ) : (
                    submissions.map((sub) => (
                      <div key={sub._id} className="card bg-white p-4 flex items-center justify-between border-l-4 border-l-mint">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-mint-light text-mint flex items-center justify-center font-black">
                            {sub.student?.displayName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-text-dark">{sub.student?.displayName}</p>
                            <p className="text-xs text-text-mid">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {sub.duplicateScore > 0.5 && (
                            <div className="flex items-center gap-1 text-salmon font-black text-[10px] bg-salmon-light px-2 py-1 rounded-full uppercase">
                              <AlertTriangle size={12} /> High Similarity ({Math.round(sub.duplicateScore * 100)}%)
                            </div>
                          )}
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                placeholder="Marks"
                                className="w-20 p-2 bg-bg border border-lavender-mid/20 rounded-lg text-sm font-bold text-center"
                                defaultValue={sub.marks}
                                onBlur={(e) => handleGrade(sub._id, e.target.value)}
                              />
                              <a href={sub.fileUrl} target="_blank" className="btn-primary py-2 px-4 text-xs">View</a>
                            </div>
                            {sub.marks && <span className="text-[10px] text-mint font-black uppercase">Graded</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: Student Upload / Quiz */}
          <div className="space-y-8">
            {user.role === 'student' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card bg-lavender text-white p-8 shadow-2xl shadow-lavender/30">
                {assignment.mcqQuestions?.length > 0 ? (
                  <>
                    <GraduationCap size={40} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-black mb-2">Interactive Quiz</h3>
                    <p className="text-lavender-light text-xs font-bold mb-6">Complete the questions below to submit your assignment.</p>
                    
                    <div className="space-y-6">
                      {assignment.mcqQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="p-4 bg-white/10 rounded-2xl border border-white/20">
                          <p className="font-bold text-sm mb-4">{q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIndex) => (
                              <button 
                                key={oIndex}
                                className="w-full p-3 bg-white/5 hover:bg-white/20 rounded-xl text-left text-xs font-bold transition-all border border-transparent hover:border-white/30"
                                onClick={() => alert(oIndex === q.correctAnswer ? 'Correct! 🌟' : 'Keep trying!')}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button className="w-full bg-white text-lavender py-4 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                        Finalize Submission
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={40} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-black mb-2">Submit Your Work</h3>
                    <p className="text-lavender-light text-xs font-bold mb-6">AI Duplicate Detection will automatically scan your work upon submission.</p>
                    
                    <form onSubmit={handleUpload} className="space-y-4">
                      <input type="file" id="submit-file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                      <label htmlFor="submit-file" className="w-full h-32 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
                        <Upload size={24} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">{file ? file.name : 'Select PDF/DOCX'}</p>
                      </label>
                      
                      <button disabled={!file || submitting} className="w-full bg-white text-lavender py-4 rounded-xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                        {submitting ? 'Scanning & Uploading...' : 'Submit Now'}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            <div className="card bg-white p-6">
              <h4 className="text-xs font-black text-text-mid uppercase tracking-widest mb-4">Integrity Guard</h4>
              <div className="flex items-center gap-3 text-mint font-bold text-sm">
                <CheckCircle size={18} /> OpenAI Analysis Active
              </div>
              <div className="flex items-center gap-3 text-blue font-bold text-sm mt-2">
                <CheckCircle size={18} /> Pinecone Vector Search
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

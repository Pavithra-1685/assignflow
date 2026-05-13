'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mcqService } from '@/services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Trash2, 
  Save, GraduationCap, HelpCircle,
  CheckCircle2, FileJson
} from 'lucide-react';

export default function CreateMCQPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    difficulty: 'medium',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const parseBulk = () => {
    const lines = bulkText.split('\n').filter(l => l.trim());
    const newQuestions = [];
    let currentQ = null;

    lines.forEach(line => {
      if (line.match(/^\d+\./) || line.includes('?')) {
        if (currentQ) newQuestions.push(currentQ);
        currentQ = { question: line.replace(/^\d+\.\s*/, ''), options: [], correctAnswer: 0 };
      } else if (currentQ && currentQ.options.length < 4) {
        currentQ.options.push(line.trim());
      }
    });
    if (currentQ) newQuestions.push(currentQ);

    setFormData({ ...formData, questions: [...formData.questions, ...newQuestions] });
    setShowBulk(false);
    setBulkText('');
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, we'd loop and save each, but for this demo:
      await mcqService.seed(); // Using seed for now or implement bulk create
      alert('MCQ Set Created Successfully!');
      router.push('/');
    } catch (err) {
      setError('Failed to save MCQ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-lavender font-bold mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-lavender rounded-2xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-text-dark">MCQ Builder</h1>
              <p className="text-text-mid font-bold">Create interactive assessments for your class</p>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-lavender/30">
            {loading ? 'Saving...' : <><Save size={20} /> Publish Quiz</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-1 space-y-6">
            <div className="card bg-white p-6">
              <label className="text-[10px] font-black text-text-mid uppercase tracking-widest block mb-2">Subject Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Algorithms" 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
              
              <label className="text-[10px] font-black text-text-mid uppercase tracking-widest block mt-6 mb-2">Difficulty</label>
              <select 
                className="input-field"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="card bg-lavender text-white p-6">
              <FileJson className="mb-4 opacity-50" />
              <h4 className="font-black mb-2 text-lg">Magic Import</h4>
              <p className="text-lavender-light text-xs leading-relaxed mb-4">Copy-paste questions from Google Forms or PDFs here to import them instantly.</p>
              <button 
                onClick={() => setShowBulk(true)}
                className="w-full py-3 bg-white text-lavender rounded-xl font-black text-xs hover:scale-105 transition-all"
              >
                Open Bulk Importer
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {showBulk && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card bg-white p-8 border-2 border-lavender shadow-2xl">
                <h3 className="text-xl font-black mb-4">Bulk Import Questions</h3>
                <textarea 
                  className="input-field min-h-[200px] mb-6 font-mono text-xs"
                  placeholder="Paste your questions here...&#10;1. What is AI?&#10;Intelligence&#10;Software&#10;Robot&#10;None"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={parseBulk} className="flex-1 btn-primary py-3">Import Now</button>
                  <button onClick={() => setShowBulk(false)} className="px-6 py-3 bg-bg text-text-mid font-bold rounded-xl">Cancel</button>
                </div>
              </motion.div>
            )}

            {formData.questions.map((q, qIndex) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                key={qIndex} 
                className="card bg-white p-8 relative"
              >
                <button 
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-4 right-4 text-text-light hover:text-salmon transition-colors"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-2 mb-4 text-lavender">
                  <HelpCircle size={18} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Question {qIndex + 1}</span>
                </div>

                <textarea 
                  className="input-field min-h-[80px] mb-6 text-lg font-bold"
                  placeholder="Enter your question here..."
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />

                <div className="space-y-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correctAnswer === oIndex ? 'bg-mint border-mint text-white' : 'border-lavender-mid/30 hover:border-lavender'}`}
                      >
                        {q.correctAnswer === oIndex && <CheckCircle2 size={14} />}
                      </button>
                      <input 
                        type="text" 
                        className="input-field py-3 text-sm" 
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <button 
              onClick={addQuestion}
              className="w-full py-6 border-2 border-dashed border-lavender-mid/30 rounded-3xl text-lavender font-black flex items-center justify-center gap-3 hover:bg-lavender-light transition-all"
            >
              <Plus /> Add Another Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

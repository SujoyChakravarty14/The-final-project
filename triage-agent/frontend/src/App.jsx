import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, Info, User, Calendar, Hash, Mail, MessageSquare, Loader2, Copy, Check, ChevronRight, Activity } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [draftText, setDraftText] = useState('');

  const handleTriage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:8000/api/triage', { message });
      setResult(response.data);
      setDraftText(response.data.draft_response);
      toast.success("Analysis complete");
      
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to connect to backend.');
      toast.error("Failed to analyze message");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type = 'text') => {
    navigator.clipboard.writeText(text);
    if (type === 'response') {
      setCopiedResponse(true);
      toast.success("Response copied!");
      setTimeout(() => setCopiedResponse(false), 2000);
    } else {
      toast.success(`Copied: ${text}`);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-4 h-4 mr-1.5" />;
      case 'medium': return <Info className="w-4 h-4 mr-1.5" />;
      case 'low': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  const getEntityIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('name')) return <User className="w-4 h-4" />;
    if (t.includes('date')) return <Calendar className="w-4 h-4" />;
    if (t.includes('id')) return <Hash className="w-4 h-4" />;
    if (t.includes('email')) return <Mail className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const presetMessages = [
    "I set up a recurring donation last Tuesday but haven't received my tax receipt. My donor ID is 84920.",
    "The website is completely down and I can't access the volunteer schedule for tomorrow's event!",
    "I'd like to learn more about your upcoming charity gala in December. Do you have VIP tables available?",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen dot-bg font-sans text-slate-900 overflow-x-hidden selection:bg-brand-100 selection:text-brand-900 pb-32">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            fontWeight: '500'
          },
        }} 
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-display font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Nexus</span>
              <span className="text-slate-300 font-normal mx-2">/</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">Triage Engine</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              System Online
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-6 py-12 relative z-10 flex flex-col items-center">
        
        {/* Title Section */}
        <div className="mb-10 text-center space-y-3 w-full">
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-600 pb-1">
            Automated Triage
          </h2>
          <p className="text-indigo-800/80 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Input a raw support ticket or email below. The AI will instantly classify its urgency, identify the primary intent, and extract key entities.
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full space-y-4">
          <div className="bg-white rounded-xl shadow-subtle border border-slate-200 overflow-hidden transition-all focus-within:ring-1 focus-within:ring-slate-900 focus-within:border-slate-900">
            <div className="flex flex-col items-center justify-center px-4 py-4 bg-white/50 border-b border-indigo-100 gap-3">
              <label className="text-xs font-bold text-violet-700 flex items-center justify-center w-full uppercase tracking-widest">
                <MessageSquare className="w-4 h-4 mr-2 text-violet-500" />
                Raw Payload
              </label>
              <div className="flex gap-2">
                {presetMessages.map((msg, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessage(msg);
                      toast("Test data loaded");
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                  >
                    Load Data {idx + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the user's message here..."
              className="w-full min-h-[400px] p-8 bg-white border-none focus:ring-0 resize-y text-indigo-950 text-lg font-medium leading-[1.8] placeholder-indigo-300 placeholder-italic"
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleTriage}
              disabled={loading || !message.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 group border border-transparent"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Run Analysis
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </>
              )}
            </button>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 mt-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-12"
            >
              <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                Querying language model...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="w-full mt-10 space-y-6"
            >
              <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Analysis Results</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Classification and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-subtle border border-slate-200 flex flex-col items-center text-center">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-center">
                    <Info className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Classification
                  </p>
                  <h3 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600">{result.intent}</h3>
                </motion.div>
                
                <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-subtle border border-slate-200 flex flex-col items-center text-center">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Priority
                  </p>
                  <div className={`inline-flex px-3 py-1 rounded-md border text-sm font-medium ${getUrgencyColor(result.urgency)}`}>
                    {getUrgencyIcon(result.urgency)}
                    {result.urgency}
                  </div>
                </motion.div>
              </div>

              {/* Entities Section */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-subtle border border-slate-200">
                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-center">
                  <Hash className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Extracted Entities
                </h3>
                
                {result.entities && result.entities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.entities.map((entity, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => copyToClipboard(entity.value, entity.entity_type)}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center hover:border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer group"
                      >
                        <div className="text-slate-400 mr-3 group-hover:text-slate-600 transition-colors">
                          {getEntityIcon(entity.entity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              {entity.entity_type}
                            </p>
                            <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="font-medium text-slate-900 text-sm truncate">{entity.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-center">
                    <p className="text-slate-500 text-sm">No specific entities detected.</p>
                  </div>
                )}
              </motion.div>

              {/* Draft Response */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-subtle border border-slate-200 overflow-hidden focus-within:ring-1 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all">
                <div className="flex flex-col items-center justify-center px-5 py-4 bg-slate-50/50 border-b border-slate-200 gap-3">
                  <h3 className="text-[11px] font-bold text-violet-700 uppercase tracking-widest flex items-center justify-center w-full">
                    <Mail className="w-4 h-4 mr-2 text-violet-500" />
                    Generated Draft
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(draftText, 'response')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-900 flex items-center gap-1.5 px-3 py-1.5 hover:bg-indigo-50 rounded transition-colors"
                  >
                    {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedResponse ? 'Copied' : 'Copy Text'}
                  </button>
                </div>
                
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="w-full min-h-[800px] p-8 bg-white border-none focus:ring-0 resize-y text-indigo-950 text-lg font-medium leading-[1.8] whitespace-pre-wrap"
                />
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;

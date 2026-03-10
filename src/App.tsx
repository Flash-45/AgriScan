import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Camera, 
  ChevronRight,
  ShieldCheck,
  Sprout,
  AlertCircle,
  Info,
  Bell,
  User,
  CloudUpload,
  Sun,
  Scan,
  Maximize,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeCropImage, chatWithAgriExpert, type DiagnosisResult } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDiagnosis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeCropImage(image);
      setDiagnosis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await chatWithAgriExpert(userMsg);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Chat failed:', error);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2D3436] font-sans">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00D100] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">AgriScan AI</span>
          </div>
          
          <div className="flex items-center gap-10">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">My Crops</a>
              <a href="#" className="hover:text-gray-900 transition-colors">History</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Advisory</a>
            </nav>
            
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell size={20} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {!diagnosis && !isAnalyzing ? (
            <motion.div 
              key="upload-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center"
            >
              <div className="w-full max-w-xl space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] rounded-3xl border-2 border-dashed border-[#00D100]/30 bg-[#F0FFF0]/50 hover:bg-[#F0FFF0] hover:border-[#00D100]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 group relative overflow-hidden"
                >
                  {image ? (
                    <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-[#00D100]/10 text-[#00D100] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CloudUpload size={40} />
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Upload or Capture Image</h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                          Drag and drop a clear photo of a plant leaf, stem, or fruit. Supported formats: JPG, PNG, HEIC.
                        </p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => image ? handleAnalyze() : fileInputRef.current?.click()}
                    className="flex-1 bg-[#00D100] text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#00B800] transition-all active:scale-[0.98] shadow-lg shadow-green-100"
                  >
                    <Camera size={20} />
                    {image ? "Analyze Now" : "Browse Files"}
                  </button>
                  <button className="flex-1 bg-white border border-gray-200 text-gray-900 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98]">
                    <Scan size={20} />
                    Take Photo
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: Sun, label: 'Ensure good lighting' },
                    { icon: Maximize, label: 'Focus on the symptoms' },
                    { icon: Maximize, label: 'Keep leaf flat' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50/50 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                      <div className="text-[#00D100]">
                        <item.icon size={20} />
                      </div>
                      <p className="text-[11px] font-bold text-gray-600 leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-24 flex flex-col items-center justify-center text-center gap-8"
            >
              <div className="relative">
                <Loader2 size={80} className="text-[#00D100] animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sprout size={32} className="text-[#00D100]" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Analysis Active</h2>
                <p className="text-gray-500">Our AI is scanning your crop for potential diseases...</p>
              </div>
            </motion.div>
          ) : diagnosis && (
            <motion.div 
              key="results-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Diagnosis Results</h2>
                  <div className="px-4 py-1.5 bg-[#E6F9E6] text-[#00D100] text-[11px] font-bold tracking-widest rounded-full">
                    ANALYSIS ACTIVE
                  </div>
                </div>

                <div className="relative bg-[#F8FAFC] rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF4D4D]" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Detected Disease</p>
                    <h3 className="text-3xl font-bold text-gray-900">{diagnosis.diseaseName}</h3>
                    <p className="text-gray-500 italic font-medium">{diagnosis.scientificName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-gray-900">{diagnosis.confidence}%</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Confidence</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-900">
                    <Info size={20} className="text-[#00D100]" />
                    <h4 className="font-bold">About this condition</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {diagnosis.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-gray-900">
                    <ShieldCheck size={20} className="text-[#00D100]" />
                    <h4 className="font-bold">Recommended Actions</h4>
                  </div>
                  <div className="space-y-4">
                    {diagnosis.actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          action.type === 'danger' ? "bg-red-50 text-red-500" :
                          action.type === 'warning' ? "bg-amber-50 text-amber-500" :
                          "bg-green-50 text-green-500"
                        )}>
                          {action.type === 'danger' ? <X size={14} strokeWidth={3} /> :
                           action.type === 'warning' ? <Sparkles size={14} strokeWidth={3} /> :
                           <CheckCircle2 size={14} strokeWidth={3} />}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{action.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => { setDiagnosis(null); setImage(null); }}
                    className="flex-1 h-14 rounded-2xl border border-gray-200 font-bold text-gray-900 hover:bg-gray-50 transition-all"
                  >
                    New Analysis
                  </button>
                  <button className="flex-[2] h-14 rounded-2xl border border-gray-200 font-bold text-gray-900 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                    <MessageCircle size={20} />
                    Consult Local Specialist
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            >
              <div className="p-5 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00D100]/10 text-[#00D100] rounded-xl flex items-center justify-center">
                    <Sprout size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">AgriScan Assistant</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#00D100] rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expert AI</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-white text-[#00D100] rounded-2xl shadow-sm flex items-center justify-center mx-auto border border-gray-100">
                      <Sparkles size={28} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">How can I help you today?</p>
                      <p className="text-xs text-gray-500 px-8">
                        Ask me about crop diseases, pest control, or soil health.
                      </p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-[#00D100] text-white rounded-tr-none" 
                        : "bg-white text-gray-900 border border-gray-100 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 size={16} className="animate-spin text-[#00D100]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-5 bg-white border-t border-gray-100">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-5 pr-14 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#00D100] transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00D100] text-white rounded-xl flex items-center justify-center hover:bg-[#00B800] disabled:opacity-50 transition-all shadow-lg shadow-green-100"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all active:scale-90",
            isChatOpen ? "bg-gray-900 rotate-90" : "bg-[#00D100] hover:bg-[#00B800]"
          )}
        >
          {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>
    </div>
  );
}

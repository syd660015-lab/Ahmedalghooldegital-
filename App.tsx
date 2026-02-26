
import React, { useState } from 'react';
import { 
  UserCircle, 
  Link, 
  BrainCircuit, 
  AlertCircle, 
  Sparkles, 
  BarChart3, 
  ShieldAlert, 
  Map,
  Loader2,
  ChevronLeft,
  Activity,
  Zap,
  Download,
  Copy,
  Check,
  Users,
  History,
  Trash2,
  X
} from 'lucide-react';
import { performAnalysis } from './services/geminiService';
import { AnalysisStatus, AnalysisMode, HistoryItem } from './types';
import ReportRenderer from './components/ReportRenderer';

const App: React.FC = () => {
  const [fbUrl, setFbUrl] = useState('');
  const [fbUrl2, setFbUrl2] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.PSYCHOLOGICAL);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    const savedHistory = localStorage.getItem('analysis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newItem: HistoryItem) => {
    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('analysis_history', JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('analysis_history', JSON.stringify(updatedHistory));
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setFbUrl(item.url);
    setFbUrl2(item.url2 || '');
    setMode(item.mode);
    setReport(item.report);
    setStatus(AnalysisStatus.SUCCESS);
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbUrl) return;
    if (mode === AnalysisMode.COMPARISON && !fbUrl2) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);
    setReport(null);

    try {
      const result = await performAnalysis(fbUrl, additionalInfo, mode, fbUrl2);
      setReport(result);
      setStatus(AnalysisStatus.SUCCESS);
      
      saveToHistory({
        id: crypto.randomUUID(),
        url: fbUrl,
        url2: fbUrl2,
        mode,
        report: result,
        timestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message || "فشل التحليل. يرجى التأكد من البيانات والمحاولة مرة أخرى.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setReport(null);
    setError(null);
    setCopied(false);
    setFbUrl2('');
  };

  const handleDownload = () => {
    if (!report) return;
    
    // Clean report from chart tags
    const cleanReport = report.replace(/\[CHART_DATA\][\s\S]*?\[\/CHART_DATA\]/, '');
    
    const element = document.createElement("a");
    const file = new Blob([cleanReport], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    const fileName = mode === AnalysisMode.PSYCHOLOGICAL 
      ? 'تقرير_نفسي' 
      : mode === AnalysisMode.BEHAVIORAL 
        ? 'تقرير_سلوكي' 
        : 'تقرير_مقارنة';
    element.download = `${fileName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!report) return;
    const cleanReport = report.replace(/\[CHART_DATA\][\s\S]*?\[\/CHART_DATA\]/, '');
    navigator.clipboard.writeText(cleanReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="max-w-4xl w-full text-center mb-12 relative">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute right-0 top-0 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-all flex items-center gap-2 text-slate-300"
          title="سجل التحليلات"
        >
          <History className="w-5 h-5" />
          <span className="hidden sm:inline font-bold">السجل</span>
        </button>
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
          <BrainCircuit className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          محلل الشخصية الرقمية
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          نظام متقدم يستخدم الذكاء الاصطناعي لتحليل السلوك الرقمي والأنماط النفسية عبر الملفات الشخصية.
        </p>
      </header>

      <main className="max-w-4xl w-full">
        {status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl">
            {/* Mode Selector */}
            <div className="flex bg-slate-800 p-1 rounded-xl mb-8">
              <button
                onClick={() => setMode(AnalysisMode.PSYCHOLOGICAL)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${mode === AnalysisMode.PSYCHOLOGICAL ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span className="font-bold text-xs sm:text-sm">تحليل نفسي</span>
              </button>
              <button
                onClick={() => setMode(AnalysisMode.BEHAVIORAL)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${mode === AnalysisMode.BEHAVIORAL ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Activity className="w-4 h-4" />
                <span className="font-bold text-xs sm:text-sm">أنماط السلوك</span>
              </button>
              <button
                onClick={() => setMode(AnalysisMode.COMPARISON)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${mode === AnalysisMode.COMPARISON ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users className="w-4 h-4" />
                <span className="font-bold text-xs sm:text-sm">مقارنة</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={mode === AnalysisMode.COMPARISON ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-400" />
                    {mode === AnalysisMode.COMPARISON ? 'رابط الملف الأول' : 'رابط الملف الشخصي (Facebook)'}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.facebook.com/user1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-left dir-ltr"
                    value={fbUrl}
                    onChange={(e) => setFbUrl(e.target.value)}
                  />
                </div>

                {mode === AnalysisMode.COMPARISON && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Link className="w-4 h-4 text-cyan-400" />
                      رابط الملف الثاني
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.facebook.com/user2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-left dir-ltr"
                      value={fbUrl2}
                      onChange={(e) => setFbUrl2(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  ملاحظات إضافية أو وصف للمحتوى
                </label>
                <textarea
                  rows={4}
                  placeholder={mode === AnalysisMode.PSYCHOLOGICAL 
                    ? "مثال: المستخدم يميل لنشر صور الطبيعة، يقتبس من الفلسفة الوجودية..." 
                    : mode === AnalysisMode.BEHAVIORAL
                      ? "مثال: ينشر بكثافة في المساء، يتفاعل مع المنشورات السياسية فقط، يشارك الفيديوهات القصيرة..."
                      : "مثال: الشخص الأول أكثر تحفظاً، الشخص الثاني يميل للصدام الفكري..."}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 resize-none"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-pulse">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className={`w-full bg-gradient-to-r ${mode === AnalysisMode.PSYCHOLOGICAL ? 'from-blue-600 to-indigo-600' : mode === AnalysisMode.BEHAVIORAL ? 'from-indigo-600 to-purple-600' : 'from-cyan-600 to-blue-600'} hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]`}
              >
                {mode === AnalysisMode.PSYCHOLOGICAL ? <BrainCircuit className="w-5 h-5" /> : mode === AnalysisMode.BEHAVIORAL ? <Activity className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                بدء {mode === AnalysisMode.COMPARISON ? 'المقارنة التحليلية' : mode === AnalysisMode.PSYCHOLOGICAL ? 'التحليل النفسي' : 'تحليل السلوك'}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard 
                icon={mode === AnalysisMode.PSYCHOLOGICAL ? <BarChart3 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                title={mode === AnalysisMode.PSYCHOLOGICAL ? "مؤشر SCI" : "معدل IF"}
                desc={mode === AnalysisMode.PSYCHOLOGICAL ? "قياس مركزية الذات" : "وتيرة التفاعل الرقمي"}
              />
              <FeatureCard 
                icon={<ShieldAlert className="w-5 h-5" />}
                title={mode === AnalysisMode.PSYCHOLOGICAL ? "معامل SAF" : "مؤشر CDI"}
                desc={mode === AnalysisMode.PSYCHOLOGICAL ? "تحليل القلق الاجتماعي" : "تنوع المحتوى المستهلك"}
              />
              <FeatureCard 
                icon={<Map className="w-5 h-5" />}
                title="خارطة الطريق"
                desc="توصيات مخصصة للنمط"
              />
            </div>
          </div>
        ) : status === AnalysisStatus.LOADING ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-16 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
              <Loader2 className={`w-20 h-20 ${mode === AnalysisMode.PSYCHOLOGICAL ? 'text-blue-500' : 'text-indigo-500'} animate-spin relative`} />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {mode === AnalysisMode.PSYCHOLOGICAL ? 'جاري التحليل النفسي العميق' : mode === AnalysisMode.BEHAVIORAL ? 'جاري تتبع الأنماط السلوكية' : 'جاري إجراء المقارنة البينية'}
            </h2>
            <div className="space-y-3 max-w-sm">
              <LoadingStep step={mode === AnalysisMode.COMPARISON ? "استخلاص نقاط التشابه..." : mode === AnalysisMode.PSYCHOLOGICAL ? "تحليل الأنماط اللغوية..." : "استخلاص معدلات النشاط..."} delay={0} />
              <LoadingStep step={mode === AnalysisMode.COMPARISON ? "قياس فجوة السلوك الرقمي..." : mode === AnalysisMode.PSYCHOLOGICAL ? "حساب مؤشرات الشخصية..." : "حساب عمق المشاركة..."} delay={2000} />
              <LoadingStep step={mode === AnalysisMode.COMPARISON ? "تحليل التفاعل المتبادل..." : mode === AnalysisMode.PSYCHOLOGICAL ? "استخراج الدوافع الخفية..." : "تحليل فجوات الاستهلاك..."} delay={4000} />
              <LoadingStep step="توليد التقرير النهائي..." delay={6000} />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl relative">
            <div className="absolute top-8 left-8 flex items-center gap-4">
              <button 
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                title="نسخ التقرير"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                <span className="text-sm hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
              <button 
                onClick={handleDownload}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                title="تحميل التقرير"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm hidden sm:inline">تحميل</span>
              </button>
              <div className="w-px h-4 bg-slate-800 mx-1"></div>
              <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm hidden sm:inline">تحليل جديد</span>
              </button>
            </div>
            
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-2 ${mode === AnalysisMode.PSYCHOLOGICAL ? 'bg-blue-500/20 text-blue-400' : mode === AnalysisMode.BEHAVIORAL ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'} rounded-lg`}>
                  {mode === AnalysisMode.PSYCHOLOGICAL ? <UserCircle className="w-8 h-8" /> : mode === AnalysisMode.BEHAVIORAL ? <Activity className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    تقرير {mode === AnalysisMode.PSYCHOLOGICAL ? 'الشخصية الرقمية' : mode === AnalysisMode.BEHAVIORAL ? 'أنماط السلوك الرقمي' : 'المقارنة التحليلية'}
                  </h3>
                  <p className="text-sm text-slate-400">{new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                </div>
              </div>

              {report && <ReportRenderer content={report} />}
              
              <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-slate-300">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  دقة التحليل
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  هذا التقرير يعتمد على البيانات المتوفرة والأنماط الإحصائية الملحوظة. الأرقام والمعادلات هي تمثيل رياضي للسلوك الرقمي بناءً على تقنيات الذكاء الاصطناعي.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-slate-500 text-sm flex flex-col items-center gap-4 border-t border-slate-800/50 pt-10 w-full max-w-4xl mx-auto pb-12">
        <div className="flex flex-col items-center text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">تصميم وبرمجة</p>
          <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            دكتور. أحمد حمدي عاشور الغول
          </p>
          <p className="text-sm text-slate-500">
            دكتوراه في علم النفس التربوي - جامعة العريش
          </p>
        </div>
        <div className="h-px w-12 bg-slate-800"></div>
        <p className="text-slate-600 font-medium">© {new Date().getFullYear()} مختبر التحليل الرقمي</p>
      </footer>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold">سجل التحليلات</h2>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center">
                  <History className="w-12 h-12 mb-4 opacity-20" />
                  <p>لا يوجد تحليلات سابقة بعد</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => selectHistoryItem(item)}
                    className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${item.mode === AnalysisMode.PSYCHOLOGICAL ? 'bg-blue-500/20 text-blue-400' : item.mode === AnalysisMode.BEHAVIORAL ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {item.mode === AnalysisMode.PSYCHOLOGICAL ? <BrainCircuit className="w-4 h-4" /> : item.mode === AnalysisMode.BEHAVIORAL ? <Activity className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <button 
                        onClick={(e) => deleteFromHistory(item.id, e)}
                        className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold truncate dir-ltr text-left">{item.url.replace('https://www.facebook.com/', '')}</p>
                      {item.url2 && <p className="text-xs text-slate-500 truncate dir-ltr text-left">vs {item.url2.replace('https://www.facebook.com/', '')}</p>}
                      <p className="text-[10px] text-slate-500 mt-2">
                        {new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-colors group">
    <div className="mb-3 text-blue-400 group-hover:scale-110 transition-transform origin-right">
      {icon}
    </div>
    <h4 className="font-bold text-sm mb-1">{title}</h4>
    <p className="text-xs text-slate-500">{desc}</p>
  </div>
);

const LoadingStep: React.FC<{ step: string, delay: number }> = ({ step, delay }) => {
  const [visible, setVisible] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex items-center gap-3 transition-all duration-700 justify-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${visible ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
      <p className="text-sm text-slate-400">{step}</p>
    </div>
  );
};

export default App;

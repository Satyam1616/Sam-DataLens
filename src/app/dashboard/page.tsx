"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, BarChart3, PieChart, LineChart as LineChartIcon, Database, LayoutDashboard, Settings, MessageSquare, Menu, X, ArrowUpRight, Save, CheckCircle2, User as UserIcon, LogOut, Trash2 } from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isChart?: boolean;
  chartData?: any;
  saved?: boolean;
};

const COLORS = ['#00e0ff', '#bd00ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am SAM AI Lens. Ask me questions about the global sales data, such as "Show me revenue by region" or "What is the profit trend?"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch schema on load
    fetch('/api/schema')
      .then(res => res.json())
      .then(data => setSchema(data['tables'][0]))
      .catch(console.error);

    // Fetch history if authenticated
    if (status === "authenticated") {
      fetch('/api/queries')
        .then(res => res.json())
        .then(data => setHistory(data.data || []))
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // Add text response
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-txt',
        role: 'assistant',
        content: data.insight
      }]);

      // Add chart if applicable
      if (data.data && data.data.length > 0) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-chart',
          role: 'assistant',
          content: '',
          isChart: true,
          chartData: data,
          saved: false
        }]);
      }

    } catch (error) {
       setMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: "Sorry, I encountered an error processing that query."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuery = async (msgId: string, chartData: any) => {
    setSavingId(msgId);
    try {
      // Find the last user question that prompted this chart
      const parentUserMsg = messages
         .slice(0, messages.findIndex(m => m.id === msgId))
         .reverse()
         .find(m => m.role === 'user');
      
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: parentUserMsg?.content || "Saved AI Insight",
          sql: "", // If we were using live LLM, we'd pull it from chartData.sql
          chartType: chartData.chartType,
          chartData: chartData
        })
      });

      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, saved: true } : m));
        // Refresh history
        const historyRes = await fetch('/api/queries');
        const historyData = await historyRes.json();
        setHistory(historyData.data || []);
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/queries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const renderChart = (chartConfig: any) => {
    const { chartType, data, xAxisKey, seriesKeys } = chartConfig;
    
    if (chartType === 'metric') {
        return (
            <div className="grid grid-cols-2 gap-4">
                {data.map((item: any, i: number) => (
                    <div key={i} className="glass p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-gray-400 text-sm font-medium mb-2">{item.name}</span>
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            {typeof item.value === 'number' ? `$${item.value.toLocaleString()}` : item.value}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#888" tick={{fill: '#888'}} />
            <YAxis stroke="#888" tickFormatter={(val) => `$${(val/1000)}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(val: any) => `$${Number(val).toLocaleString()}`}
            />
            <Legend />
            {seriesKeys.map((key: string, i: number) => (
               <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={60} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#888" />
            <YAxis stroke="#888" tickFormatter={(val) => `$${(val/1000)}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              formatter={(val: any) => `$${Number(val).toLocaleString()}`}
            />
            <Legend />
            {seriesKeys.map((key: string, i: number) => (
               <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{r: 4, fill: '#050505', strokeWidth: 2}} activeDot={{r: 6}} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey={seriesKeys[0]}
              nameKey={xAxisKey}
              label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              formatter={(val: any) => `$${Number(val).toLocaleString()}`}
            />
            <Legend />
          </RechartsPie>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex justify-center items-center text-primary"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-background/60 backdrop-blur-sm z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-[85vw] sm:w-80 border-r' : 'w-0 border-r-0'} 
        absolute md:relative h-full transition-all duration-300 flex-shrink-0 
        border-border bg-card/95 md:bg-muted/30 backdrop-blur-xl md:backdrop-blur-none 
        flex flex-col overflow-hidden z-30 shadow-2xl md:shadow-none`}>
        <div className="p-6 border-b border-border flex items-center justify-between min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(0,224,255,0.3)]">S</div>
            <span className="font-bold text-lg tracking-wide text-foreground">SAM AI Lens</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database size={14} /> Data Sources
            </h3>
            <div className="glass rounded-lg border border-border p-4 bg-card/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="font-medium text-sm">Enterprise Data Warehouse</span>
              </div>
              
              {schema && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">Active Table:</span>
                  <div className="text-sm font-medium text-foreground mb-2">{schema.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {schema.rowCount} rows indexed
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                     {schema.columns.map((col: any) => (
                       <span key={col.name} className="px-2 py-1 text-[10px] bg-background rounded border border-border text-muted-foreground">
                         {col.name}
                       </span>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
             <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Saved History</h3>
             <ul className="space-y-2 text-sm text-muted-foreground">
               {history.length === 0 ? (
                 <li className="text-xs text-muted-foreground italic p-2">No queries saved yet.</li>
               ) : (
                 history.slice(0, 5).map(q => (
                    <li key={q.id} className="flex flex-col gap-1 px-3 py-2 rounded-md bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between text-foreground font-medium">
                        <span className="truncate pr-2">{q.question}</span>
                        <button 
                          onClick={(e) => handleDeleteHistory(q.id, e)} 
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground/80 uppercase">{new Date(q.createdAt).toLocaleDateString()}</span>
                        {q.chartType === 'line' ? <LineChartIcon size={12} className="text-primary flex-shrink-0"/> : 
                         q.chartType === 'pie' ? <PieChart size={12} className="text-secondary flex-shrink-0"/> :
                         <BarChart3 size={12} className="text-primary flex-shrink-0"/>}
                      </div>
                    </li>
                 ))
               )}
             </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-muted/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
                <Menu size={20} />
              </button>
            )}
            <h1 className="font-medium text-lg text-foreground">Interactive Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                AI Engine Active
             </div>
             {session?.user && (
               <div className="flex items-center gap-3 glass px-3 py-1.5 rounded-full border border-border bg-card/50">
                 <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                   <UserIcon size={12} className="text-white" />
                 </div>
                 <span className="text-sm font-medium hidden md:block text-foreground">{session.user.name}</span>
                 <button onClick={() => signOut()} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
                   <LogOut size={16} />
                 </button>
               </div>
             )}
          </div>
        </header>

        {/* Chat / Visualization Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'assistant' && !msg.isChart && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mr-2 md:mr-4 shadow-lg">
                    <span className="text-xs font-bold text-white">M</span>
                  </div>
                )}
                
                <div className={`
                  max-w-[95%] md:max-w-[85%] 
                  ${msg.isChart ? 'w-full' : ''} 
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl rounded-tr-sm px-5 py-4 text-foreground' 
                    : msg.isChart
                      ? 'glass p-6 rounded-2xl border-border bg-card/50 w-full'
                      : 'bg-muted border border-border rounded-2xl rounded-tl-sm px-5 py-4 text-foreground'
                  }
                `}>
                  {msg.isChart ? (
                    <div className="w-full">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                         <h3 className="font-medium text-base md:text-lg flex items-center gap-2 text-foreground">
                            {msg.chartData.chartType === 'line' ? <LineChartIcon className="text-primary"/> : 
                             msg.chartData.chartType === 'pie' ? <PieChart className="text-secondary"/> :
                             <BarChart3 className="text-primary"/>} 
                            Generated Visualization
                         </h3>
                         
                         <button 
                            onClick={() => handleSaveQuery(msg.id, msg.chartData)}
                            disabled={msg.saved || savingId === msg.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                              msg.saved 
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' 
                                : 'bg-background hover:bg-muted text-foreground border border-border'
                            }`}
                         >
                           {savingId === msg.id ? (
                             <div className="w-3 h-3 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
                           ) : msg.saved ? (
                             <><CheckCircle2 size={14} /> Saved</>
                           ) : (
                             <><Save size={14} /> Save Chart</>
                           )}
                         </button>
                      </div>
                      
                      <div className="w-full bg-card rounded-xl p-4 border border-border">
                        {renderChart(msg.chartData)}
                      </div>
                      
                      {msg.chartData.suggestedQuestions && (
                        <div className="mt-6 pt-4 border-t border-border">
                           <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Suggested follow-ups</p>
                           <div className="flex flex-wrap gap-2">
                              {msg.chartData.suggestedQuestions.map((sq: string, idx: number) => (
                                <button 
                                  key={idx}
                                  onClick={() => handleSend(sq)}
                                  className="text-xs px-3 py-2 rounded-full bg-background border border-border hover:bg-muted transition-colors text-foreground flex items-center gap-1 text-left"
                                >
                                  {sq} <ArrowUpRight size={12} className="flex-shrink-0" />
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="leading-relaxed text-foreground">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-xs font-bold text-white">M</span>
                 </div>
                 <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0ms'}}/>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '150ms'}}/>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '300ms'}}/>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-10">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-30"></div>
            <div className="relative glass border border-border rounded-2xl p-2 flex items-end shadow-2xl bg-card">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your data (e.g., 'Show total revenue by region')"
                className="w-full bg-transparent text-foreground placeholder-muted-foreground border-none focus:ring-0 resize-none max-h-32 min-h-[44px] p-3 text-sm flex-1 outline-none"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="m-1 p-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,224,255,0.4)] transition-all flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

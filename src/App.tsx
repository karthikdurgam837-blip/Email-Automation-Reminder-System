import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Users, FileText, Send, Calendar, Activity, 
  Plus, Search, CheckCircle2, AlertCircle, Clock, ChevronRight,
  ExternalLink, Trash2, Edit2, Play, Pause, RefreshCw,
  Sparkles, Terminal, X, SendHorizonal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateEmailTemplate, chatWithAssistant } from './services/aiAssistant';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'overview' | 'contacts' | 'templates' | 'campaigns' | 'reminders' | 'logs';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar / Rail */}
      <div className="fixed left-0 top-0 h-full w-64 border-r border-[#141414] bg-[#F0EFEC] z-10 hidden md:block">
        <div className="p-6 border-bottom border-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#141414] rounded-sm flex items-center justify-center">
              <Mail size={18} className="text-[#E4E3E0]" />
            </div>
            <h1 className="font-bold tracking-tighter text-xl">NEXUSMAIL</h1>
          </div>
          <div className="mt-1 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            AI Automation Engine
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-1">
          <NavItem icon={Activity} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={Users} label="Contacts" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          <NavItem icon={FileText} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
          <NavItem icon={Send} label="Campaigns" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
          <NavItem icon={Calendar} label="Reminders" active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} />
          <NavItem icon={Search} label="Activity Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
        </nav>

        <div className="mt-12 px-4">
          <button 
            onClick={() => setIsAiOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm border border-[#141414]/20 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group font-mono text-xs uppercase tracking-widest"
          >
            <Terminal size={16} />
            AI Terminal
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-[#141414]/10 bg-[#E4E3E0]/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">Nexus AI: Latent</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-8 min-h-screen">
        <Header activeTab={activeTab} loading={loading} setLoading={setLoading} />
        
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabContent tab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* AI Terminal Overlay */}
      <AITerminal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

function AITerminal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Nexus-1 AI Online. Command sequence ready. How can I optimize your automation flows today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: userMsg }] });
      
      const aiResponse = await chatWithAssistant(history);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse || 'Connection interrupted.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Critical Error: AI interface failure.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] pointer-events-auto"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#141414] text-[#E4E3E0] z-[70] shadow-2xl flex flex-col font-mono border-l border-white/20"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-green-500" />
                <span className="text-xs uppercase tracking-widest font-bold">Nexus AI Terminal</span>
                <span className="text-[8px] bg-green-500/20 text-green-500 px-1 py-0.5 rounded ml-2 animate-pulse">ACTIVE</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors text-white">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-white/20 selection:bg-green-500 selection:text-[#141414]">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end text-right" : "mr-auto items-start text-left"
                )}>
                  <div className="text-[8px] uppercase opacity-30 tracking-widest">{m.role === 'user' ? 'ROOT' : 'NEXUS-1'}</div>
                  <div className={cn(
                    "p-3 rounded-sm text-xs leading-relaxed break-words",
                    m.role === 'user' ? "bg-white/10 text-white" : "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col gap-2 items-start opacity-50">
                  <div className="text-[8px] uppercase tracking-widest">NEXUS-1</div>
                  <div className="animate-pulse bg-green-500/10 border border-green-500/20 p-2 text-[10px]">Processing sequence...</div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input 
                  autoFocus
                  placeholder="Enter command or question..."
                  className="w-full bg-transparent border border-white/20 focus:border-green-500 outline-none px-4 py-3 text-xs pr-12 transition-colors uppercase tracking-wider"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-green-500 transition-colors"
                >
                  <SendHorizonal size={16} />
                </button>
              </div>
              <div className="mt-3 flex justify-between text-[8px] opacity-30 uppercase">
                <span>Enter to Execute</span>
                <span>Nexus AI v1.0.4</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 group text-sm font-medium",
        active 
          ? "bg-[#141414] text-[#E4E3E0]" 
          : "hover:bg-[#141414]/5 text-[#141414]/70 hover:text-[#141414]"
      )}
    >
      <Icon size={18} className={cn(active ? "text-[#E4E3E0]" : "text-[#141414]/50 group-hover:text-[#141414]")} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function Header({ activeTab, loading, setLoading }: { activeTab: Tab, loading: boolean, setLoading: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic font-serif capitalize">
          {activeTab}
        </h2>
        <p className="text-sm text-[#141414]/50 font-mono mt-1">
          Manage your email nodes and automation threads.
        </p>
      </div>
      <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              setLoading(true);
              try {
                // 1. Contacts
                const c1 = await fetch('/api/contacts', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ name: 'Alpha Node', email: 'alpha@nexus.io', timezone: 'UTC' }) 
                }).then(r => r.json());
                
                const c2 = await fetch('/api/contacts', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ name: 'Beta Node', email: 'beta@nexus.io', timezone: 'PST' }) 
                }).then(r => r.json());
                
                // 2. Templates
                const t1 = await fetch('/api/templates', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ name: 'System_Audit', subject: 'Audit Sequence: {title}', body: '<h1>Security Protocol 42</h1><p>Node {name}, your sync for {title} is finalized.</p>' }) 
                }).then(r => r.json());
                
                // 3. Campaigns
                const camp = await fetch('/api/campaigns', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ name: 'Protocol_X', templateId: t1.id, senderName: 'Nexus Core', senderEmail: 'core@nexus.id' }) 
                }).then(r => r.json());
                
                // 4. Reminders (Firing now and later)
                await fetch('/api/reminders', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ title: 'Maintenance_Cycle', contactId: c1.id, campaignId: camp.id, startAt: Date.now() }) 
                });
                
                await fetch('/api/reminders', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ title: 'Backup_Sequence', contactId: c2.id, campaignId: camp.id, startAt: Date.now() + 5000 }) 
                });
                
                alert('Nodes Injected. The NexusEngine will fire the simulated sequences in the next 10-15 seconds. Monitor the Activity Logs.');
              } catch (e: any) {
                console.error(e);
                alert('Infection Error: ' + (e.message || 'Unknown network error.'));
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors font-mono text-xs uppercase tracking-widest disabled:opacity-50"
          >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          Seed Demo
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] border border-[#141414] hover:opacity-90 transition-colors font-mono text-xs uppercase tracking-widest">
          <Plus size={14} />
          New Thread
        </button>
      </div>
    </header>
  );
}

// --- Views ---

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'overview': return <Overview />;
    case 'contacts': return <ContactsView />;
    case 'templates': return <TemplatesView />;
    case 'campaigns': return <CampaignsView />;
    case 'reminders': return <RemindersView />;
    case 'logs': return <LogsView />;
    default: return <Overview />;
  }
}

function Overview() {
  const stats = [
    { label: 'DELIVERED', value: '1,284', trend: '+12%', icon: CheckCircle2, color: 'text-green-600' },
    { label: 'OPEN RATE', value: '42.8%', trend: '+2.4%', icon: Activity, color: 'text-blue-600' },
    { label: 'QUEUE', value: '15', trend: 'Active', icon: Clock, color: 'text-orange-500' },
    { label: 'FAILS', value: '2', trend: '-20%', icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-[#F0EFEC] border border-[#141414]/10 rounded-sm hover:border-[#141414]/30 transition-colors group">
            <div className="flex items-center justify-between">
              <stat.icon size={20} className={cn("opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
              <span className="text-[10px] font-mono tracking-widest opacity-60 uppercase">{stat.trend}</span>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold font-mono tracking-tighter truncate">{stat.value}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-40 mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-[#F0EFEC] border border-[#141414]/10 rounded-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif italic text-xl">Delivery Velocity</h3>
            <div className="flex items-center gap-4 text-[10px] font-mono opacity-40 uppercase tracking-widest">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#141414]" /> Sent</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#141414]/20" /> Failed</div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-2 border-b border-[#141414]/10 pb-2">
             {[30, 45, 25, 60, 40, 55, 70, 45, 30, 60, 80, 50].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                 <div 
                   className="w-full bg-[#141414] hover:bg-[#141414] transition-all rounded-t-sm" 
                   style={{ height: `${h}%` }}
                 />
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141414] text-[#E4E3E0] text-[8px] px-1 py-0.5 rounded-sm">
                   {h * 12}
                 </div>
               </div>
             ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono opacity-30 uppercase tracking-tighter">
            <span>01 May</span>
            <span>15 May</span>
            <span>31 May</span>
          </div>
        </div>

        <div className="p-8 bg-[#F0EFEC] border border-[#141414]/10 rounded-sm">
          <h3 className="font-serif italic text-xl mb-6">Recent Nodes</h3>
          <div className="space-y-4">
            {[
              { name: 'Karthik Durgam', email: 'k***@gmail.com', status: 'Success' },
              { name: 'John Doe', email: 'j***@apple.com', status: 'Pending' },
              { name: 'Sarah Miller', email: 's***@nexus.io', status: 'Success' },
              { name: 'Dev Build', email: 'd***@local.id', status: 'Failed' },
            ].map((node, i) => (
               <div key={i} className="flex items-center justify-between py-2 border-b border-[#141414]/5 last:border-0 group">
                 <div>
                   <div className="text-sm font-medium">{node.name}</div>
                   <div className="text-[10px] font-mono opacity-40">{node.email}</div>
                 </div>
                 <div className={cn(
                   "text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest",
                   node.status === 'Success' ? 'bg-green-100 text-green-700' :
                   node.status === 'Failed' ? 'bg-red-100 text-red-700' :
                   'bg-gray-100 text-gray-700'
                 )}>
                   {node.status}
                 </div>
               </div>
            ))}
            <button className="w-full mt-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors flex items-center justify-center gap-2">
              View Activity Scroll <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsView() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', timezone: 'UTC' });

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(setContacts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', email: '', timezone: 'UTC' });
    setIsAdding(false);
    fetch('/api/contacts').then(r => r.json()).then(setContacts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif italic text-2xl">Contact Directory</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest"
        >
          {isAdding ? 'Cancel' : 'Register Contact'}
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-6 bg-white border border-[#141414] rounded-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase opacity-50">Full Name</label>
              <input 
                required
                className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase opacity-50">Email Address</label>
              <input 
                required
                type="email"
                className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button className="w-full h-[38px] bg-[#141414] text-white font-mono text-xs uppercase transition-colors hover:opacity-90">Commit to Node</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="overflow-x-auto border border-[#141414]/10 rounded-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0EFEC] border-b border-[#141414]/10">
              <th className="p-4 font-serif italic font-medium text-sm">Target Name</th>
              <th className="p-4 font-serif italic font-medium text-sm">Channel</th>
              <th className="p-4 font-serif italic font-medium text-sm">Zone</th>
              <th className="p-4 font-serif italic font-medium text-sm">Status</th>
              <th className="p-4 font-serif italic font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-[#141414]/5 hover:bg-[#F0EFEC]/50 transition-colors group">
                <td className="p-4 text-sm font-medium">{contact.name}</td>
                <td className="p-4 text-sm font-mono opacity-60">{contact.email}</td>
                <td className="p-4 text-xs font-mono opacity-40">{contact.timezone}</td>
                <td className="p-4">
                  <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest",
                    contact.unsubscribed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  )}>
                    {contact.unsubscribed ? 'Inscribed' : 'Active'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="p-1 opacity-20 hover:opacity-100 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
                  <button className="p-1 opacity-20 hover:opacity-100 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-sm font-mono opacity-30 italic">No nodes identified in the directory...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplatesView() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '' });

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(setTemplates);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', subject: '', body: '' });
    setIsAdding(false);
    fetch('/api/templates').then(r => r.json()).then(setTemplates);
  };

  const previewBody = formData.body
    .replace(/{name}/g, '<span class="text-blue-500 font-bold">John Doe</span>')
    .replace(/{title}/g, '<span class="text-blue-500 font-bold">Class Reminder</span>');

  const [isAiDrafting, setIsAiDrafting] = useState(false);

  const handleAiDraft = async () => {
    const prompt = window.prompt("Describe the message blueprint you want to create (e.g. 'A friendly welcome email for students')");
    if (!prompt) return;
    
    setIsAiDrafting(true);
    try {
      const draft = await generateEmailTemplate(prompt);
      setFormData({
        name: draft.name,
        subject: draft.subject,
        body: draft.body
      });
    } catch (e) {
      alert("AI Pulse Failure: Could not generate content.");
    } finally {
      setIsAiDrafting(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h3 className="font-serif italic text-2xl">Message Blueprints</h3>
        <div className="flex gap-2">
          <button 
            disabled={isAiDrafting}
            onClick={handleAiDraft}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors font-mono text-xs uppercase tracking-widest disabled:opacity-50"
          >
            <Sparkles size={14} className={cn(isAiDrafting && "animate-pulse")} />
            {isAiDrafting ? 'Drafting...' : 'AI Blueprint'}
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest border border-[#141414]"
          >
            {isAdding ? 'Cancel' : 'Draft Blueprint'}
          </button>
        </div>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[#141414] rounded-sm space-y-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">Blueprint Editor</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Blueprint Alias</label>
                <input 
                  className="w-full px-3 py-2 border border-[#141414]/10 focus:border-[#141414] outline-none font-mono text-sm"
                  placeholder="e.g. Onboarding_v1"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Subject Line (supports {'{name}'})</label>
                <input 
                  className="w-full px-3 py-2 border border-[#141414]/10 focus:border-[#141414] outline-none font-mono text-sm"
                  placeholder="Hello {name}, welcome!"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Markup Body</label>
                <textarea 
                  rows={8}
                  className="w-full px-3 py-2 border border-[#141414]/10 focus:border-[#141414] outline-none font-mono text-sm resize-none"
                  placeholder="<h1>Hello {name}</h1>\n<p>Your {title} is ready.</p>"
                  value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                />
            </div>
            <button onClick={handleSubmit} className="w-full py-3 bg-[#141414] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#141414]/90 transition-all">Store Node Blueprint</button>
          </div>

          <div className="p-6 bg-[#F0EFEC] border border-[#141414]/10 rounded-sm">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 mb-6 underline decoration-[#141414]/20 underline-offset-4">Live Render Preview</h4>
            <div className="bg-white p-8 border border-[#141414]/5 rounded-sm shadow-sm min-h-[300px]">
              <div className="border-b border-[#141414]/5 pb-4 mb-6">
                <div className="text-[10px] font-mono opacity-30 uppercase mb-1">Subject</div>
                <div className="text-sm font-medium italic">{formData.subject.replace(/{name}/g, 'John Doe') || '...'}</div>
              </div>
              <div 
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewBody || '<em>No markup provided yet...</em>' }}
              />
            </div>
            <div className="mt-4 flex items-center gap-4 text-[9px] font-mono opacity-40 uppercase">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Variables Active</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> HTML Parser On</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="p-6 bg-white border border-[#141414]/10 rounded-sm hover:border-[#141414] transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">{tpl.name}</h4>
                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <button className="p-1 text-[#141414]/40 hover:text-[#141414]"><Edit2 size={14}/></button>
                  <button className="p-1 text-[#141414]/40 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-widest border-b border-[#141414]/5 pb-1">Subject</div>
                <div className="text-xs italic opacity-80 truncate">{tpl.subject}</div>
                <div className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-widest border-b border-[#141414]/5 pb-1 mt-4">Node Profile</div>
                <div className="text-[10px] opacity-40 line-clamp-3 leading-relaxed font-mono">
                  Bytes: {new Blob([tpl.body]).size} | Ref: {tpl.id.slice(0,8)}
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-[8px] font-mono opacity-30 uppercase border-t border-[#141414]/5 pt-4">
              <span>EST. {format(tpl.createdAt, 'MMM d, yyyy')}</span>
              <span className="flex items-center gap-1"><FileText size={8} /> Template Node</span>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full p-12 bg-white/50 border border-dashed border-[#141414]/20 rounded-sm text-center text-sm font-mono opacity-30 italic">
            No message blueprints drafted...
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignsView() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', templateId: '', senderName: 'NexusMail', senderEmail: 'noreply@nexus.io' });

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
    fetch('/api/templates').then(r => r.json()).then(setTemplates);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', templateId: '', senderName: 'NexusMail', senderEmail: 'noreply@nexus.io' });
    setIsAdding(false);
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h3 className="font-serif italic text-2xl">Broadcast Campaigns</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest"
        >
          {isAdding ? 'Cancel' : 'Initiate Campaign'}
        </button>
      </div>

      {isAdding && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white border border-[#141414] rounded-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Campaign Name</label>
                <input 
                  className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Select Blueprint</label>
                <select 
                   className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm bg-white"
                   value={formData.templateId}
                   onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                >
                  <option value="">Select a template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Sender Display Name</label>
                <input 
                  className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                  value={formData.senderName}
                  onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase opacity-50">Sender Primary Channel (Email)</label>
                <input 
                  className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                  value={formData.senderEmail}
                  onChange={e => setFormData({ ...formData, senderEmail: e.target.value })}
                />
              </div>
            </div>
            <button onClick={handleSubmit} className="px-6 py-2 bg-[#141414] text-white font-mono text-xs uppercase">Lock Campaign</button>
         </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map(camp => (
          <div key={camp.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-[#141414]/10 rounded-sm hover:border-[#141414]/50 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-[#F0EFEC] flex items-center justify-center border border-[#141414]/10">
                <Send size={20} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{camp.name}</h4>
                <div className="text-[10px] font-mono opacity-40 uppercase flex items-center gap-3">
                  <span>SENDER: {camp.senderName} ({camp.senderEmail})</span>
                  <span className="w-1 h-1 rounded-full bg-[#141414]/20" />
                  <span>ID: {camp.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-8">
              <div className="text-right">
                <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Blueprint</div>
                <div className="text-xs font-medium">{templates.find(t => t.id === camp.templateId)?.name || 'Unknown'}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Threads</div>
                <div className="text-xs font-medium">1.2K</div>
              </div>
              <button className="p-3 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemindersView() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', contactId: '', campaignId: '', startAt: Date.now() + 3600000, cron: '' });

  useEffect(() => {
    fetch('/api/reminders').then(r => r.json()).then(setReminders);
    fetch('/api/contacts').then(r => r.json()).then(setContacts);
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ title: '', contactId: '', campaignId: '', startAt: Date.now() + 3600000, cron: '' });
    setIsAdding(false);
    fetch('/api/reminders').then(r => r.json()).then(setReminders);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif italic text-2xl">Automation Reminders</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest"
        >
          {isAdding ? 'Cancel' : 'Schedule Reminder'}
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white border border-[#141414] rounded-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase opacity-50">Reminder Niche (Title)</label>
              <input 
                className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase opacity-50">Target Node (Contact)</label>
              <select 
                className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm bg-white"
                value={formData.contactId}
                onChange={e => setFormData({ ...formData, contactId: e.target.value })}
              >
                <option value="">Select contact...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase opacity-50">Launch Campaign</label>
              <select 
                className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm bg-white"
                value={formData.campaignId}
                onChange={e => setFormData({ ...formData, campaignId: e.target.value })}
              >
                <option value="">Select campaign...</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
             <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase opacity-50">Pulse (Cron Expression - Optional)</label>
              <input 
                placeholder="e.g. 0 9 * * *"
                className="w-full px-3 py-2 border border-[#141414]/20 focus:border-[#141414] outline-none font-mono text-sm"
                value={formData.cron}
                onChange={e => setFormData({ ...formData, cron: e.target.value })}
              />
            </div>
          </div>
          <button onClick={handleSubmit} className="px-6 py-2 bg-[#141414] text-white font-mono text-xs uppercase italic">Activate Automation</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map(rem => (
          <div key={rem.id} className="p-6 bg-[#F0EFEC] border border-[#141414]/10 rounded-sm relative group overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   <h4 className="font-bold text-lg">{rem.title}</h4>
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white border border-[#141414]/10 hover:bg-[#141414] hover:text-white transition-colors"><Edit2 size={12}/></button>
                    <button className="p-1.5 bg-white border border-[#141414]/10 hover:bg-orange-500 hover:text-white transition-colors"><Pause size={12}/></button>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono mb-4">
                <div>
                  <div className="opacity-40 uppercase tracking-widest mb-1">TARGET NODE</div>
                  <div className="font-bold truncate">{rem.contactName}</div>
                </div>
                <div>
                  <div className="opacity-40 uppercase tracking-widest mb-1">CAMPAIGN FLOW</div>
                  <div className="font-bold truncate">{rem.campaignName}</div>
                </div>
                <div>
                  <div className="opacity-40 uppercase tracking-widest mb-1">RECURRENCE</div>
                  <div className="font-bold">{rem.cron || 'One-time Execution'}</div>
                </div>
                <div>
                  <div className="opacity-40 uppercase tracking-widest mb-1">LAST FIRING</div>
                  <div className="font-bold">{rem.lastFiredAt ? format(rem.lastFiredAt, 'HH:mm:ss') : 'Initialization Pending'}</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[4] rotate-12 group-hover:opacity-[0.07] group-hover:scale-[3] transition-all origin-center">
              <Calendar size={100} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsView() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = () => fetch('/api/messages').then(r => r.json()).then(setLogs);
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif italic text-2xl">Activity Log Scroll</h3>
        <div className="flex items-center gap-2 text-[10px] font-mono opacity-40 uppercase tracking-widest">
           Refreshes every 5s <RefreshCw size={10} className="animate-spin" />
        </div>
      </div>

      <div className="bg-[#141414] text-[#E4E3E0] rounded-sm font-mono text-[11px] overflow-hidden">
        <div className="grid grid-cols-5 p-4 border-b border-white/10 uppercase tracking-widest opacity-40">
          <div className="col-span-2">TIMESTAMP / THREAD ID</div>
          <div>TARGET CONTACT</div>
          <div>SUBJECT CHANNEL</div>
          <div className="text-right">STATUS</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-white">
          {logs.map((log) => (
            <div key={log.id} className="grid grid-cols-5 p-4 border-b border-white/5 hover:bg-white/5 transition-all">
              <div className="col-span-2 flex flex-col gap-1">
                <span className="opacity-60">{format(log.scheduledAt, 'yyyy-MM-dd HH:mm:ss.SS')}</span>
                <span className="text-[9px] opacity-20">{log.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>{log.contactName}</span>
                <span className="text-[9px] opacity-40 italic">{log.contactEmail}</span>
              </div>
              <div className="truncate pr-4 opacity-80">{log.subject}</div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={cn(
                  "px-2 py-0.5 rounded-sm uppercase tracking-tighter text-[9px]",
                  log.status === 'sent' ? 'bg-green-900/50 text-green-400 border border-green-400/20' :
                  log.status === 'failed' ? 'bg-red-900/50 text-red-400 border border-red-400/20' :
                  'bg-blue-900/50 text-blue-400 border border-blue-400/20'
                )}>
                  {log.status === 'sent' && !log.error ? 'Simulated' : log.status}
                </span>
                {log.error && <div className="text-[8px] text-red-500 mt-1 truncate max-w-[120px]">{log.error}</div>}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-24 text-center opacity-20 italic">No activity detected on the wire...</div>
          )}
        </div>
      </div>
    </div>
  );
}

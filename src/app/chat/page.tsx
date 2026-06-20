"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/components/app-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { useTheme } from "next-themes";
import { 
  Moon, Sun, Send, Save, Menu, Sparkles, PanelLeftClose, PanelLeftOpen, 
  Paperclip, Mic, Square, Plus, MessageSquare, Trash2, X, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const realisticResponses: Record<string, string> = {
  "Explain quantum computing in simple terms": "Imagine a coin spinning in the air. A regular computer uses bits that are like a coin sitting on a table—it's either Heads (1) or Tails (0). Quantum computers use qubits, which are like the spinning coin. While it's spinning, it exists in a state of both Heads and Tails simultaneously (superposition). This allows quantum computers to explore many possibilities at once, making them incredibly fast at solving complex problems.",
  "Write a python script to fetch weather data": "Here is a simple Python script using the `requests` library to fetch weather data:\n\n```python\nimport requests\n\nAPI_KEY = 'your_api_key_here'\nCITY = 'London'\nurl = f'http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric'\n\nresponse = requests.get(url)\nif response.status_code == 200:\n    data = response.json()\n    print(f\"Temperature in {CITY}: {data['main']['temp']}°C\")\n    print(f\"Weather: {data['weather'][0]['description']}\")\nelse:\n    print('Failed to fetch weather data')\n```",
  "Help me brainstorm ideas for a sci-fi novel": "Here are 3 sci-fi novel concepts to get you started:\n\n1. **The Memory Market**: In a future where humans can extract, sell, and upload memories, a black-market memory broker discovers a memory of a murder they supposedly committed—but they have no recollection of it.\n\n2. **The Dyson Sphere Paradox**: Humanity reaches a Dyson Sphere built by an ancient alien race, only to find it's not a power source, but a massive containment unit holding something that is trying to convince humanity to let it out.\n\n3. **Chronos Sync**: Time travel is invented, but you can only travel to a time where a \"receiver\" exists. The first receiver is turned on, and immediately, millions of travelers arrive from the future.",
  "Draft an email to a client apologizing for a delay": "Subject: Update on [Project Name] - Revised Timeline\n\nHi [Client Name],\n\nI hope this email finds you well.\n\nI’m writing to provide an update on [Project Name]. Unfortunately, we have encountered an unexpected delay regarding [briefly mention the issue] and will not be able to deliver by our original deadline.\n\nWe are actively working to resolve this and now expect to have everything completed by [New Date]. I sincerely apologize for the inconvenience this may cause and appreciate your patience.\n\nBest regards,\n[Your Name]"
};

export default function ChatPage() {
  const { theme, setTheme } = useTheme();
  const {
    models, templates,
    selectedModel, setSelectedModel,
    temperature, setTemperature,
    maxTokens, setMaxTokens,
    systemInstruction, setSystemInstruction,
    apiKey, setApiKey,
    sessions, currentSessionId, switchSession, createNewSession, deleteSession,
    messages, addMessage, clearMessages, isHydrated
  } = useAppContext();

  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false; 
        rec.interimResults = false;
        
        rec.onresult = (event: any) => {
          const currentTranscript = event.results[0][0].transcript;
          if (currentTranscript) {
            setPrompt(prev => prev + (prev ? " " : "") + currentTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachments(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!prompt.trim() && attachments.length === 0) || isGenerating) return;
    
    const currentPrompt = prompt;
    const sessionId = currentSessionId; // Capture current session ID
    addMessage({ role: "user", content: currentPrompt, attachments: [...attachments] }, sessionId);
    setPrompt("");
    setAttachments([]);
    setIsGenerating(true);
    
    // Fallback to hardcoded responses for suggestions
    if (realisticResponses[currentPrompt.trim()]) {
      setTimeout(() => {
        let content = realisticResponses[currentPrompt.trim()];
        if (systemInstruction) content += `\n\n(System: ${systemInstruction.trim()})`;
        addMessage({ role: "assistant", content }, sessionId);
        setIsGenerating(false);
      }, 1000);
      return;
    }

    if (!apiKey.trim()) {
      addMessage({ role: "assistant", content: "To use real AI, please enter your free Groq API Key in the sidebar parameters panel." }, sessionId);
      setIsGenerating(false);
      return;
    }

    try {
      const history: { role: string; content: string }[] = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: currentPrompt });
      if (systemInstruction) {
        history.unshift({ role: "system", content: systemInstruction });
      }

      // Using the REAL Groq API
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: history,
          model: selectedModel || "llama-3.1-8b-instant",
          temperature: temperature,
          max_tokens: maxTokens
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "API failed");
      }
      
      const data = await res.json();
      console.log("Groq API Response:", data);
      
      const content = data.choices?.[0]?.message?.content || "No content received";
      
      addMessage({ role: "assistant", content }, sessionId);
    } catch (error: any) {
      console.error("API Error:", error);
      addMessage({ role: "assistant", content: `API Error: ${error.message}` }, sessionId);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
    setIsGenerating(false);
  };

  const loadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = templates.find(temp => temp.id === e.target.value);
    if (t) setPrompt(t.prompt);
  };

  const handleDownloadChat = () => {
    const data = JSON.stringify({ session: currentSessionId, messages }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMessage = (msg: typeof messages[0]) => {
    const payload = {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      ...(msg.attachments && msg.attachments.length > 0 ? { attachments: msg.attachments } : {}),
      exportedAt: new Date().toISOString(),
    };
    const data = JSON.stringify(payload, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message_${msg.role}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isHydrated) return null; // Avoid hydration mismatch

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3, type: "spring", bounce: 0 }}
        className="w-80 border-r border-border/50 bg-background/80 backdrop-blur-2xl flex flex-col absolute inset-y-0 left-0 z-50 md:relative shadow-2xl md:shadow-none h-full"
      >
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF3200] to-[#FF9E00] flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Predusk AI</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hidden md:flex" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
              <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          
          {/* New Chat Button */}
          <Button 
            className="w-full justify-start rounded-xl font-medium shadow-md transition-all hover:scale-[1.02] bg-gradient-to-r from-[#FF3200] to-[#FF9E00] hover:from-[#FF9E00] hover:to-[#FF3200] text-white border-none" 
            onClick={createNewSession}
          >
            <Plus className="h-4 w-4 mr-2" /> New Chat
          </Button>

          {/* Chat History */}
          <div className="space-y-3">
            <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">History</label>
            <div className="space-y-1">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className={cn(
                    "flex items-center justify-between group rounded-lg px-3 py-2 cursor-pointer transition-colors",
                    currentSessionId === session.id ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                  onClick={() => switchSession(session.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">{session.title}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all"
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Model</label>
            <Select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>

          {/* Parameters Panel */}
          <div className="space-y-6 pt-6 border-t border-border/50">
            <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Parameters</label>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Temperature</span>
                <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-md">{temperature.toFixed(2)}</span>
              </div>
              <Slider 
                min={0} max={2} step={0.01} 
                value={temperature} 
                onChange={(e) => setTemperature(parseFloat(e.target.value))} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Max Tokens</span>
                <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-md">{maxTokens}</span>
              </div>
              <Slider 
                min={1} max={4000} step={1} 
                value={maxTokens} 
                onChange={(e) => setMaxTokens(parseInt(e.target.value))} 
              />
            </div>
            
            {/* System Instructions */}
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">System Instructions</label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                placeholder="E.g., You are a helpful assistant that replies in pirate speak."
                className="w-full min-h-[80px] resize-y rounded-xl border border-border/50 bg-secondary/40 backdrop-blur-xl px-4 py-3 text-sm font-medium shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-secondary/60"
              />
            </div>

            {/* API Key */}
            <div className="space-y-3 pb-4">
              <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Groq API Key</label>
              <input
                type="password"
                value={apiKey }
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full rounded-xl border border-border/50 bg-secondary/40 backdrop-blur-xl px-4 py-2 text-sm font-medium shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-secondary/60"
              />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Desktop Top Bar with Download Chat button */}
        {messages.length > 0 && (
          <div className="hidden md:flex items-center justify-end px-6 pt-4 z-10">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDownloadChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/70 hover:bg-secondary border border-border/50 text-sm font-semibold text-muted-foreground hover:text-foreground shadow-sm backdrop-blur-xl transition-all"
              title="Download full chat as JSON"
            >
              <Download className="h-4 w-4" />
              Download Chat
            </motion.button>
          </div>
        )}
        {/* Floating Sidebar Toggle Button (Desktop) */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.1 } }}
              className="hidden md:block absolute top-6 left-6 z-30"
            >
              <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80 backdrop-blur-xl border-border/50 hover:bg-secondary" onClick={() => setIsSidebarOpen(true)}>
                <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Background Mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div 
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF3200]/20 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.1, 1], x: [0, 40, 0], y: [0, -40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF9E00]/20 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 z-10 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF3200] to-[#FF9E00] flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 scroll-smooth">
          {messages.length === 0 ? (
            <div className=" flex flex-col items-center justify-center text-center space-y-12 pb-20 pt-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="h-24 w-24 bg-gradient-to-br from-[#FF3200] to-[#FF9E00] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#FF3200]/20 mb-2">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">
                  How can I help you today?
                </h2>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full"
              >
                 <button onClick={() => setPrompt("Explain quantum computing in simple terms")} className="p-5 text-left rounded-3xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                    <h3 className="font-bold text-foreground">Explain a complex concept</h3>
                    <p className="text-sm text-muted-foreground mt-1">&quot;Quantum computing in simple terms&quot;</p>
                 </button>
                 <button onClick={() => setPrompt("Write a python script to fetch weather data")} className="p-5 text-left rounded-3xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                    <h3 className="font-bold text-foreground">Write some code</h3>
                    <p className="text-sm text-muted-foreground mt-1">&quot;Python script to fetch weather data&quot;</p>
                 </button>
                 <button onClick={() => setPrompt("Help me brainstorm ideas for a sci-fi novel")} className="p-5 text-left rounded-3xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                    <h3 className="font-bold text-foreground">Brainstorm ideas</h3>
                    <p className="text-sm text-muted-foreground mt-1">&quot;Ideas for a sci-fi novel&quot;</p>
                 </button>
                 <button onClick={() => setPrompt("Draft an email to a client apologizing for a delay")} className="p-5 text-left rounded-3xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                    <h3 className="font-bold text-foreground">Draft an email</h3>
                    <p className="text-sm text-muted-foreground mt-1">&quot;Apologize for a delay to a client&quot;</p>
                 </button>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatBubble 
                    key={msg.id} 
                    role={msg.role} 
                    content={msg.content} 
                    attachments={msg.attachments}
                    onCopy={() => navigator.clipboard.writeText(msg.content)}
                    onDownload={() => handleDownloadMessage(msg)}
                    onRegenerate={() => handleSend()} // Mock regenerate
                  />
                ))}
                {isGenerating && (
                  <ChatBubble 
                    key="generating-indicator"
                    role="assistant"
                    isTyping={true}
                    content={
                      <div className="flex items-center gap-3 text-muted-foreground font-medium animate-pulse">
                        <Sparkles className="h-4 w-4" />
                        <span>Deep thinking...</span>
                      </div>
                    }
                  />
                )}
              </AnimatePresence>
            </div>
          )}
          {/* Spacer to prevent overlap with floating input island */}
          <div ref={messagesEndRef} className="h-40 md:h-56 shrink-0 w-full" />
        </div>

        {/* Floating Input Island */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", bounce: 0.4 }}
            className="max-w-4xl mx-auto flex flex-col gap-2 pointer-events-auto bg-secondary/60 backdrop-blur-2xl p-2 rounded-[2rem] border border-border/50 shadow-2xl transition-all focus-within:shadow-primary/10 focus-within:border-primary/50"
          >
            {/* Image Upload Previews */}
            {attachments.length > 0 && (
              <div className="flex gap-2 px-4 pt-2 overflow-x-auto scrollbar-thin">
                {attachments.map((src, i) => (
                  <div key={i} className="relative group shrink-0">
                    <img src={src} className="w-16 h-16 rounded-lg object-cover border border-border/50 shadow-sm" />
                    <button 
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setAttachments(prev => prev.filter((_, index) => index !== i))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2 w-full">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 h-14 w-14 rounded-full hover:bg-background/80 text-muted-foreground transition-colors mb-1 ml-1" 
                onClick={() => fileInputRef.current?.click()} 
                title="Attach Images"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <div className="relative flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="I know every thing. You can ask..."
                  className="w-full min-h-[56px] max-h-60 resize-none bg-transparent px-4 py-4 text-base shadow-none outline-none placeholder:text-muted-foreground focus:ring-0 border-none rounded-2xl scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                />
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "shrink-0 h-14 w-14 rounded-full transition-colors mb-1",
                  isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-background/80 text-muted-foreground"
                )} 
                onClick={() => {
                  if (!recognition) {
                    alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
                    return;
                  }
                  if (isListening) {
                    recognition.stop();
                  } else {
                    try {
                      recognition.start();
                      setIsListening(true);
                    } catch (e) {
                      console.error("Recognition already started");
                    }
                  }
                }} 
                title={recognition ? "Voice Input" : "Browser Not Supported"}
              >
                <Mic className="h-5 w-5" />
              </Button>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-1 mr-1">
                {isGenerating ? (
                  <Button onClick={handleStop} className="shrink-0 h-14 w-14 rounded-full bg-destructive text-destructive-foreground shadow-lg p-0 transition-all">
                    <Square className="h-5 w-5 fill-current" /> 
                  </Button>
                ) : (
                  <Button onClick={handleSend} className="shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-[#FF3200] to-[#FF9E00] hover:opacity-90 text-white shadow-lg p-0 transition-all" disabled={!prompt.trim() && attachments.length === 0}>
                    <Send className="h-5 w-5" /> 
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
          <div className="max-w-4xl mx-auto mt-3 text-center pointer-events-auto">
            <p className="text-[11px] text-muted-foreground font-medium opacity-70">
              AI responses may be inaccurate. Please verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

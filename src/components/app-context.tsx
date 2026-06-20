"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Model = { id: string; name: string; provider: string };
export type Template = { id: string; name: string; prompt: string };
export type Message = { 
  id: string; 
  role: "user" | "assistant"; 
  content: string;
  attachments?: string[]; // Data URLs for images
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

interface AppContextType {
  models: Model[];
  templates: Template[];
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
  apiKey: string;
  setApiKey: (val: string) => void;
  
  // Session Management
  sessions: ChatSession[];
  currentSessionId: string;
  switchSession: (id: string) => void;
  createNewSession: () => void;
  deleteSession: (id: string) => void;
  
  // Current Messages
  messages: Message[];
  addMessage: (msg: Omit<Message, "id">, targetSessionId?: string) => void;
  clearMessages: () => void;
  isHydrated: boolean;
  isLoadingConfig: boolean;
  configError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = useState<Model[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [selectedModel, setSelectedModel] = useState<string>("llama-3.1-8b-instant");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1000);
  const [systemInstruction, setSystemInstruction] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(process.env.NEXT_PUBLIC_GROQ_API_KEY || "");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const initNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  };

  // Initialize from LocalStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("predusk_apikey");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedKey) setApiKey(savedKey);

    const saved = localStorage.getItem("predusk_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
        } else {
          initNewSession();
        }
      } catch (e) {
        initNewSession();
      }
    } else {
      initNewSession();
    }
    
    // Load config with loading/error states (Requirement G)
    setIsLoadingConfig(true);
    setConfigError(null);
    Promise.all([
      fetch("/api/models").then(res => { if (!res.ok) throw new Error("Models API error"); return res.json(); }),
      fetch("/api/templates").then(res => { if (!res.ok) throw new Error("Templates API error"); return res.json(); })
    ])
    .then(([m, t]) => {
      setModels(m);
      setTemplates(t);
    })
    .catch(err => {
      console.error("Config load error:", err);
      setConfigError("Failed to load initial configuration.");
    })
    .finally(() => {
      setIsLoadingConfig(false);
    });
    
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("predusk_sessions", JSON.stringify(sessions));
      localStorage.setItem("predusk_apikey", apiKey);
    }
  }, [sessions, apiKey, isHydrated]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const switchSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const newSession: ChatSession = { id: Date.now().toString(), title: "New Chat", messages: [], updatedAt: Date.now() };
        setCurrentSessionId(newSession.id);
        return [newSession];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const addMessage = (msg: Omit<Message, "id">, targetSessionId?: string) => {
    const sessionId = targetSessionId || currentSessionId;
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const isFirstMessage = s.messages.length === 0;
        let newTitle = s.title;
        
        if (isFirstMessage && msg.role === "user") {
          newTitle = msg.content.length > 25 ? msg.content.slice(0, 25) + "..." : msg.content;
        }

        return {
          ...s,
          title: newTitle,
          updatedAt: Date.now(),
          messages: [...s.messages, { ...msg, id: Date.now().toString() + Math.random().toString() }]
        };
      }
      return s;
    }).sort((a, b) => b.updatedAt - a.updatedAt)); // Move updated session to top
  };

  const clearMessages = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [], updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];

  return (
    <AppContext.Provider value={{
      models, templates,
      selectedModel, setSelectedModel,
      temperature, setTemperature,
      maxTokens, setMaxTokens,
      systemInstruction, setSystemInstruction,
      apiKey, setApiKey,
      sessions, currentSessionId, switchSession, createNewSession, deleteSession,
      messages, addMessage, clearMessages, isHydrated, isLoadingConfig, configError
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}

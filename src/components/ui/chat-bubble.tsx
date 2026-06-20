import React from "react"
import { cn } from "@/lib/utils"
import { Copy, Download, User, Sparkles, ThumbsUp, ThumbsDown, RefreshCcw } from "lucide-react"
import { motion } from "framer-motion"

export interface ChatBubbleProps {
  role: "user" | "assistant"
  content: string | React.ReactNode
  attachments?: string[]
  onCopy?: () => void
  onDownload?: () => void
  onRegenerate?: () => void
  isTyping?: boolean
}

export function ChatBubble({ role, content, attachments, onCopy, onDownload, onRegenerate, isTyping }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className={cn(
        "flex w-full gap-4 p-2 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full shadow-lg z-10",
        isUser 
          ? "bg-gradient-to-br from-[#FF3200] to-[#FF9E00] text-white" 
          : "bg-gradient-to-br from-[#FF9E00] to-[#FF3200] text-white"
      )}>
        {isUser ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-5 py-4 rounded-3xl relative shadow-md flex flex-col gap-3",
          isUser 
            ? "bg-gradient-to-br from-[#FF3200] to-[#FF9E00] text-white rounded-tr-sm" 
            : "bg-secondary/80 backdrop-blur-xl border border-border/50 text-foreground rounded-tl-sm"
        )}>
          {/* Attachments (Images) */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {attachments.map((src, i) => (
                <img 
                  key={i} 
                  src={src} 
                  alt="Attachment" 
                  className="w-48 h-auto rounded-xl object-cover shadow-sm border border-black/10"
                />
              ))}
            </div>
          )}
          
          <div className="prose prose-sm dark:prose-invert break-words max-w-none">
            {typeof content === "string" ? (
              <p className="whitespace-pre-wrap leading-relaxed m-0 text-inherit">{content}</p>
            ) : (
              content
            )}
          </div>
        </div>
        
        {!isUser && !isTyping && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
            <button 
              onClick={onCopy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shadow-sm border border-border/50"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onDownload}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shadow-sm border border-border/50"
              title="Download JSON"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            {onRegenerate && (
              <button 
                onClick={onRegenerate}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shadow-sm border border-border/50"
                title="Regenerate"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="w-px h-4 bg-border mx-1" />
            <button 
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-green-500 transition-colors shadow-sm border border-border/50"
              title="Good response"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button 
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-red-500 transition-colors shadow-sm border border-border/50"
              title="Bad response"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

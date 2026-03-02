"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{
    id: string;
    type: string;
    status: string;
    requires_confirmation: boolean;
    confirmation_message?: string;
  }>;
}

interface AIAgentChatProps {
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const STORAGE_KEY = "ai-agent-session-id";

export function AIAgentChat({ sessionId: propSessionId, onSessionChange, isOpen = true, onToggle }: AIAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya Asisten AI PelangganPro. Ada yang bisa saya bantu?\n\nContoh:\n• \"Buat catatan untuk kontak 628452318312: Meeting berjalan lancar\"\n• \"Berapa deals yang aktif?\"\n• \"Siapa kontak nomor 628123456789?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>("");
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    actionId: string;
    message: string;
  } | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID on mount
  useEffect(() => {
    let sessionId = propSessionId;
    
    // If no prop provided, try to get from localStorage
    if (!sessionId) {
      const storedSessionId = localStorage.getItem(STORAGE_KEY);
      if (storedSessionId) {
        sessionId = storedSessionId;
      } else {
        // Generate new session ID
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem(STORAGE_KEY, sessionId);
      }
    }
    
    setCurrentSession(sessionId);
  }, [propSessionId]);

  // Load conversation history when session ID is available
  useEffect(() => {
    if (currentSession && !isHistoryLoaded) {
      loadConversationHistory(currentSession);
    }
  }, [currentSession, isHistoryLoaded]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(STORAGE_KEY, currentSession);
    }
  }, [currentSession]);

  // Scroll to bottom on new messages (only when chat is open)
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isOpen]);

  const loadConversationHistory = async (sid: string) => {
    try {
      const res = await fetch(`/api/agent/chat?session_id=${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data?.length > 0) {
          setMessages(data.data.map((m: any) => ({
            role: m.role,
            content: m.content,
          })));
        }
      }
      setIsHistoryLoaded(true);
    } catch (error) {
      console.error("Error loading history:", error);
      setIsHistoryLoaded(true);
    }
  };

  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setCurrentSession(newSessionId);
    localStorage.setItem(STORAGE_KEY, newSessionId);
    setMessages([
      {
        role: "assistant",
        content: "Halo! Saya Asisten AI PelangganPro. Ada yang bisa saya bantu?\n\nContoh:\n• \"Buat catatan untuk kontak 628452318312: Meeting berjalan lancar\"\n• \"Berapa deals yang aktif?\"\n• \"Siapa kontak nomor 628123456789?\"",
      },
    ]);
    setIsHistoryLoaded(false);
    onSessionChange?.(newSessionId);
    toast.success("Chat baru dimulai");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          session_id: currentSession,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();

      // Check if confirmation required
      if (data.requires_confirmation && data.actions?.[0]) {
        setPendingConfirmation({
          actionId: data.actions[0].id,
          message: data.actions[0].confirmation_message || "Konfirmasi action?",
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          actions: data.actions,
        },
      ]);

      // Update session if new
      if (data.session_id && data.session_id !== currentSession) {
        setCurrentSession(data.session_id);
        localStorage.setItem(STORAGE_KEY, data.session_id);
        onSessionChange?.(data.session_id);
      }
    } catch (error) {
      toast.error("Gagal mengirim pesan");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingConfirmation) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "confirm",
          session_id: currentSession,
          confirmed_action_id: pendingConfirmation.actionId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to confirm");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          actions: data.actions,
        },
      ]);

      setPendingConfirmation(null);
    } catch (error) {
      toast.error("Gagal mengkonfirmasi action");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-[500px]">
        <CardHeader className="pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Asisten AI
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={startNewChat}
                title="Chat Baru"
                type="button"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={handleToggle}
                type="button"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isOpen && (
          <>
            <CardContent className="p-0 flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Messages - Fixed height with scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
                          {message.role === "assistant" ? (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                code: ({ children }) => (
                                  <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            message.content
                          )}
                        </div>

                        {/* Action status indicators */}
                        {message.actions?.map((action) => (
                          <div
                            key={action.id}
                            className="mt-2 flex items-center gap-2 text-xs"
                          >
                            {action.status === "success" && (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Berhasil</span>
                              </>
                            )}
                            {action.status === "failed" && (
                              <>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">Gagal</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t shrink-0">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ketik pesan Anda... (Shift+Enter untuk newline)"
                      className="flex-1 min-h-[40px] max-h-[80px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="shrink-0 h-[40px] w-[40px]"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!pendingConfirmation}
        onOpenChange={() => setPendingConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Konfirmasi Action
            </DialogTitle>
            <DialogDescription>{pendingConfirmation?.message}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setPendingConfirmation(null)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                "Konfirmasi"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

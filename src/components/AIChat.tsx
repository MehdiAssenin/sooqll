import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/i18n/LanguageProvider";

function getSessionId() {
  let sid = localStorage.getItem("chat_session_id");
  if (!sid) {
    sid = "chat_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("chat_session_id", sid);
  }
  return sid;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "agent";
  content: string;
  createdAt: Date;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId] = useState(getSessionId);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();

  const { data: history } = trpc.chat.getHistory.useQuery(
    { sessionId },
    { 
      enabled: isOpen,
      refetchInterval: isOpen ? 3000 : undefined,
    }
  );

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.response) {
        const aiMsg: ChatMessage = {
          id: Date.now(),
          role: "assistant",
          content: data.response,
          createdAt: new Date(),
        };
        setLocalMessages((prev) => [...prev, aiMsg]);
      }
    },
  });

  const agentMutation = trpc.chat.requestAgent.useMutation({
    onSuccess: (data) => {
      const agentMsg: ChatMessage = {
        id: Date.now(),
        role: "assistant",
        content: data.estimatedWait
          ? lang === "en"
            ? `A live agent will be with you shortly. Estimated wait: ${data.estimatedWait} minutes.`
            : `Un agent vous répondra bientôt. Temps d'attente estimé : ${data.estimatedWait} minutes.`
          : t("chat.waitTime"),
        createdAt: new Date(),
      };
      setLocalMessages((prev) => [...prev, agentMsg]);
    },
  });

  useEffect(() => {
    if (history) {
      setLocalMessages(
        history.map((m) => ({
          ...m,
          role: m.role as ChatMessage["role"],
        }))
      );
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      createdAt: new Date(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    setMessage("");

    await sendMutation.mutateAsync({ sessionId, content: userMsg.content });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [t("chat.suggested1"), t("chat.suggested2"), t("chat.suggested3")];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#C9A96E] text-[#0F281F] shadow-xl flex items-center justify-center hover:bg-[#d4b87a] transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#E8E4DF]"
          >
            {/* Header */}
            <div className="bg-[#0F281F] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A96E] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#0F281F]" />
              </div>
              <button
                onClick={() => agentMutation.mutate({ sessionId })}
                className="ml-auto text-[10px] text-[#C9A96E] border border-[#C9A96E]/40 rounded-full px-2.5 py-1 hover:bg-[#C9A96E]/10 transition-colors"
              >
                {t("chat.liveAgent")}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
              {/* Welcome Message */}
              {localMessages.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#C9A96E] flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-[#0F281F]" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[#E8E4DF] max-w-[85%]">
                      <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-line">
                        {t("chat.welcome")}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="ml-9.5 space-y-2 pt-1">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setMessage(prompt);
                        }}
                        className="block w-full text-left text-xs bg-white border border-[#E8E4DF] rounded-full px-4 py-2 text-[#1A4D3A] hover:border-[#C9A96E] hover:text-[#0F281F] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message History */}
              {localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-[#1A4D3A]" : "bg-[#C9A96E]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-[#0F281F]" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#0F281F] text-white rounded-tr-sm"
                        : "bg-white text-[#1A1A1A] rounded-tl-sm border border-[#E8E4DF]"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {sendMutation.isPending && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#C9A96E] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#0F281F]" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-[#E8E4DF]">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#E8E4DF] bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 bg-[#F5F0EB] rounded-full px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#9A9187] focus:outline-none focus:ring-1 focus:ring-[#C9A96E]"
                />
                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || !message.trim()}
                  className="w-10 h-10 rounded-full bg-[#0F281F] text-white flex items-center justify-center hover:bg-[#1A4D3A] transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

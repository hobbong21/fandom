import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useGetOpenaiConversation,
  getListOpenaiConversationsQueryKey,
  getGetOpenaiConversationQueryKey,
  type OpenaiConversationWithMessages,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Plus, ChevronRight, Cpu, Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MODELS = ["gpt-5-mini", "gpt-5.4", "o4-mini"];

export default function Home() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for new conversation
  const [newTitle, setNewTitle] = useState("");
  const [newModel, setNewModel] = useState(MODELS[1]);
  const [newSystemPrompt, setNewSystemPrompt] = useState("");

  const { data: conversations, isLoading: isLoadingConversations } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();

  const handleCreate = async () => {
    if (!newTitle) return;
    
    createConversation.mutate(
      { data: { title: newTitle, model: newModel, systemPrompt: newSystemPrompt } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          setSelectedId(data.id);
          setIsCreating(false);
          setNewTitle("");
          setNewSystemPrompt("");
        },
      }
    );
  };

  return (
    <div className="flex h-full w-full">
      {/* Left panel - Conversations List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-sm tracking-widest text-muted-foreground uppercase">Workspaces</h2>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" data-testid="btn-new-chat">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle>{t("new_chat")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("title")}</label>
                  <Input 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="E.g. Korean Translation Test" 
                    data-testid="input-chat-title"
                    className="font-mono bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("select_model")}</label>
                  <Select value={newModel} onValueChange={setNewModel}>
                    <SelectTrigger className="font-mono bg-background" data-testid="select-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => (
                        <SelectItem key={m} value={m} data-testid={`model-option-${m}`}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("system_prompt")}</label>
                  <Textarea 
                    value={newSystemPrompt} 
                    onChange={(e) => setNewSystemPrompt(e.target.value)} 
                    placeholder="You are a helpful assistant..."
                    className="font-mono bg-background h-24"
                    data-testid="input-system-prompt"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>{t("cancel")}</Button>
                <Button onClick={handleCreate} disabled={!newTitle || createConversation.isPending} data-testid="btn-create-chat">
                  {createConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full bg-secondary" />
              <Skeleton className="h-12 w-full bg-secondary" />
            </div>
          ) : conversations?.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("no_conversations")}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations?.map((conv) => (
                <button
                  key={conv.id}
                  data-testid={`chat-item-${conv.id}`}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all flex items-center group ${
                    selectedId === conv.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${selectedId === conv.id ? "text-primary" : "text-foreground"}`}>
                      {conv.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Cpu className="h-3 w-3 mr-1" />
                      {conv.model}
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedId === conv.id ? "opacity-100 text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right panel - Chat Area */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {selectedId ? <ChatArea conversationId={selectedId} /> : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Select or create a workspace to begin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatArea({ conversationId }: { conversationId: number }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: conversation, isLoading } = useGetOpenaiConversation(conversationId, {
    query: { enabled: !!conversationId, queryKey: getGetOpenaiConversationQueryKey(conversationId) }
  });
  
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, streamedContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = input;
    setInput("");
    setIsStreaming(true);
    setStreamedContent("");

    // Optimistically update UI to show user message
    queryClient.setQueryData<OpenaiConversationWithMessages>(getGetOpenaiConversationQueryKey(conversationId), (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: [...old.messages, { id: Date.now(), conversationId, role: "user", content: userMessage, createdAt: new Date().toISOString() }]
      };
    });

    try {
      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue; // Handle potential standard OpenAI format
            
            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                // Done
              } else if (data.content) {
                finalContent += data.content;
                setStreamedContent(finalContent);
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
      
      // Invalidate to get final saved message
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId) });
    } catch (error) {
      console.error("Streaming error", error);
    } finally {
      setIsStreaming(false);
      setStreamedContent("");
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-6 bg-card/50">
        <h3 className="font-bold text-foreground mr-4">{conversation.title}</h3>
        <div className="px-2 py-1 rounded bg-secondary text-xs text-secondary-foreground font-mono flex items-center">
          <Cpu className="h-3 w-3 mr-2 text-primary" />
          {conversation.model}
        </div>
        {conversation.systemPrompt && (
          <div className="ml-4 text-xs text-muted-foreground truncate max-w-md" title={conversation.systemPrompt}>
            <span className="font-bold mr-1">SYS:</span> {conversation.systemPrompt}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isStreaming && (
          <MessageBubble role="assistant" content={streamedContent} isStreaming />
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto flex space-x-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("type_message")}
            className="min-h-[60px] resize-none font-mono bg-background border-border focus-visible:ring-primary"
            data-testid="input-chat-message"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isStreaming} 
            className="h-auto w-16 bg-primary text-primary-foreground hover:bg-primary/80"
            data-testid="btn-send-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content, isStreaming }: { role: string; content: string, isStreaming?: boolean }) {
  const isUser = role === "user";
  
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-md p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap border ${
        isUser 
          ? "bg-primary/10 text-primary-foreground border-primary/20" 
          : "bg-secondary text-secondary-foreground border-border"
      }`}>
        {!isUser && (
          <div className="text-xs font-bold text-primary mb-2 flex items-center uppercase tracking-wider">
            <Terminal className="h-3 w-3 mr-2" />
            Output
            {isStreaming && <span className="ml-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

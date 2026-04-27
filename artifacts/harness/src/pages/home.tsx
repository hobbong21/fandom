import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  useListOpenaiConversations,
  useListOpenaiModels,
  useCreateOpenaiConversation,
  useUpdateOpenaiConversation,
  useDeleteOpenaiConversation,
  useGetOpenaiConversation,
  useListOpenaiPromptTemplates,
  useCreateOpenaiPromptTemplate,
  useDeleteOpenaiPromptTemplate,
  useUpdateOpenaiPromptTemplate,
  getListOpenaiConversationsQueryKey,
  getGetOpenaiConversationQueryKey,
  getListOpenaiPromptTemplatesQueryKey,
  type OpenaiConversationWithMessages,
  type OpenaiConversation,
  type OpenaiModel,
  type OpenaiPromptTemplate,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Plus, ChevronRight, Cpu, Terminal, Settings2, Trash2, BookmarkPlus, ChevronDown, X, Check, FlaskConical, Pencil, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const MAX_TEST_HISTORY = 5;

interface TestRun {
  id: number;
  promptSnippet: string;
  result: string | null;
  error: string | null;
}

function SystemPromptField({
  value,
  onChange,
  textareaTestId,
  model,
}: {
  value: string;
  onChange: (val: string) => void;
  textareaTestId?: string;
  model?: string;
}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: templates } = useListOpenaiPromptTemplates();
  const createTemplate = useCreateOpenaiPromptTemplate();
  const deleteTemplate = useDeleteOpenaiPromptTemplate();
  const updateTemplate = useUpdateOpenaiPromptTemplate();

  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<OpenaiPromptTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testHistory, setTestHistory] = useState<TestRun[]>([]);
  const [viewingIndex, setViewingIndex] = useState<number>(0);
  const [testRunCounter, setTestRunCounter] = useState(0);
  const [testMessage, setTestMessage] = useState("");

  const handleTest = async () => {
    if (!model || !value.trim() || isTesting) return;
    setIsTesting(true);

    const snippet = value.trim().slice(0, 40) + (value.trim().length > 40 ? "…" : "");
    const runId = testRunCounter + 1;
    setTestRunCounter(runId);

    const newRun: TestRun = { id: runId, promptSnippet: snippet, result: "", error: null };
    setTestHistory((prev) => {
      const updated = [newRun, ...prev].slice(0, MAX_TEST_HISTORY);
      return updated;
    });
    setViewingIndex(0);

    try {
      const response = await fetch("/api/openai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: value, model, ...(testMessage.trim() ? { message: testMessage.trim() } : {}) }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        setTestHistory((prev) =>
          prev.map((r) => (r.id === runId ? { ...r, error: err.error ?? "Request failed", result: null } : r))
        );
        setIsTesting(false);
        return;
      }

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.content) {
                fullText += parsed.content;
                setTestHistory((prev) =>
                  prev.map((r) => (r.id === runId ? { ...r, result: fullText } : r))
                );
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setTestHistory((prev) =>
        prev.map((r) => (r.id === runId ? { ...r, error: "Something went wrong. Please try again.", result: null } : r))
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleApplyTemplate = (template: OpenaiPromptTemplate) => {
    onChange(template.content);
    setTemplatePopoverOpen(false);
  };

  const handleOpenEditTemplate = (template: OpenaiPromptTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setEditName(template.name);
    setEditContent(template.content);
    setSavingTemplate(false);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditName("");
    setEditContent("");
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !editName.trim() || !editContent.trim()) return;
    updateTemplate.mutate(
      { id: editingTemplate.id, data: { name: editName.trim(), content: editContent.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiPromptTemplatesQueryKey() });
          handleCancelEdit();
        },
        onError: (error) => {
          const description = (error.data as { error?: string } | null)?.error ?? error.message;
          toast({
            variant: "destructive",
            title: "Failed to update template",
            description,
          });
        },
      }
    );
  };

  const handleDeleteTemplate = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTemplate.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiPromptTemplatesQueryKey() });
        },
      }
    );
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !value.trim()) return;
    createTemplate.mutate(
      { data: { name: templateName.trim(), content: value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiPromptTemplatesQueryKey() });
          setSavingTemplate(false);
          setTemplateName("");
          setTemplatePopoverOpen(false);
        },
      }
    );
  };

  const handleOpenSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSavingTemplate(true);
    setTemplateName("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{t("system_prompt")}</label>
        <div className="flex items-center gap-1">
          {model && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={handleTest}
              disabled={!value.trim() || isTesting}
              data-testid="btn-test-system-prompt"
              title="Test this system prompt"
            >
              {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FlaskConical className="h-3 w-3" />}
              Test
            </Button>
          )}
        <Popover open={templatePopoverOpen} onOpenChange={(open) => { setTemplatePopoverOpen(open); if (!open) { setSavingTemplate(false); handleCancelEdit(); } }}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              data-testid="btn-templates-popover"
            >
              Templates
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            <div className="p-2">
              {editingTemplate ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Edit Template</p>
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Template name..."
                    className="h-7 text-xs"
                    data-testid="input-edit-template-name"
                    onKeyDown={(e) => { if (e.key === "Escape") handleCancelEdit(); }}
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Template content..."
                    className="text-xs font-mono h-28 resize-none"
                    data-testid="input-edit-template-content"
                    onKeyDown={(e) => { if (e.key === "Escape") handleCancelEdit(); }}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-6 text-xs flex-1"
                      onClick={handleUpdateTemplate}
                      disabled={!editName.trim() || !editContent.trim() || updateTemplate.isPending}
                      data-testid="btn-confirm-edit-template"
                    >
                      {updateTemplate.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={handleCancelEdit}
                      data-testid="btn-cancel-edit-template"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">{t("system_prompt")} Templates</p>
              {!templates || templates.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-2">No templates saved yet.</p>
              ) : (
                <TooltipProvider delayDuration={400}>
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {templates.map((t) => (
                    <Tooltip key={t.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center gap-1 px-1 py-1.5 rounded-md hover:bg-secondary group cursor-pointer"
                          onClick={() => handleApplyTemplate(t)}
                          data-testid={`template-item-${t.id}`}
                        >
                          <span className="flex-1 text-xs truncate">{t.name}</span>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent text-muted-foreground transition-all"
                            onClick={(e) => handleOpenEditTemplate(t, e)}
                            data-testid={`btn-edit-template-${t.id}`}
                            title="Edit template"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                            onClick={(e) => handleDeleteTemplate(t.id, e)}
                            data-testid={`btn-delete-template-${t.id}`}
                            title="Delete template"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        className="max-w-xs w-64 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-xs font-mono leading-relaxed"
                        data-testid={`template-preview-${t.id}`}
                      >
                        {t.content}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
              )}
              <div className="border-t border-border mt-2 pt-2">
                {savingTemplate ? (
                  <div className="space-y-1.5">
                    <Input
                      autoFocus
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="h-7 text-xs"
                      data-testid="input-template-name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTemplate();
                        if (e.key === "Escape") setSavingTemplate(false);
                      }}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-6 text-xs flex-1"
                        onClick={handleSaveTemplate}
                        disabled={!templateName.trim() || !value.trim() || createTemplate.isPending}
                        data-testid="btn-confirm-save-template"
                      >
                        {createTemplate.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setSavingTemplate(false)}
                        data-testid="btn-cancel-save-template"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-1.5 w-full px-1 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-all disabled:opacity-40 disabled:pointer-events-none"
                    onClick={handleOpenSave}
                    disabled={!value.trim()}
                    data-testid="btn-save-as-template"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Save current prompt as template
                  </button>
                )}
              </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="You are a helpful assistant..."
        className="font-mono bg-background h-24"
        data-testid={textareaTestId}
      />
      {model && (
        <Input
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder='Test message (default: "Introduce yourself in one sentence.")'
          className="text-xs h-7"
          data-testid="input-test-message"
        />
      )}
      {testHistory.length > 0 && (() => {
        const viewed = testHistory[viewingIndex];
        const isCurrentRun = viewingIndex === 0 && isTesting;
        return (
          <div className="rounded-md border border-border bg-secondary/40 p-3 space-y-2" data-testid="test-result-container">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Test response</p>
              {testHistory.length > 1 && (
                <div className="flex items-center gap-1" data-testid="test-result-nav">
                  <button
                    className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                    onClick={() => setViewingIndex((i) => Math.min(i + 1, testHistory.length - 1))}
                    disabled={viewingIndex >= testHistory.length - 1}
                    title="Older run"
                    data-testid="btn-test-result-older"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {viewingIndex === 0 ? "Latest" : `Run −${viewingIndex}`} / {testHistory.length}
                  </span>
                  <button
                    className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                    onClick={() => setViewingIndex((i) => Math.max(i - 1, 0))}
                    disabled={viewingIndex <= 0}
                    title="Newer run"
                    data-testid="btn-test-result-newer"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-[10px] text-muted-foreground truncate max-w-full font-mono" data-testid="test-result-prompt-snippet">
                  Prompt: {viewed.promptSnippet}
                </p>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap break-words text-xs font-mono">
                {viewed.promptSnippet}
              </TooltipContent>
            </Tooltip>
            {viewed.error ? (
              <p className="text-xs text-destructive" data-testid="test-result-error">{viewed.error}</p>
            ) : (
              <p className="text-xs text-foreground whitespace-pre-wrap" data-testid="test-result-content">
                {viewed.result
                  ? viewed.result
                  : isCurrentRun
                    ? <span className="text-muted-foreground">Generating…</span>
                    : <span className="text-muted-foreground italic">No response received.</span>
                }
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingConversation, setEditingConversation] = useState<OpenaiConversation | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newModel, setNewModel] = useState<OpenaiModel | "">("");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editModel, setEditModel] = useState<OpenaiModel | "">("");
  const [editSystemPrompt, setEditSystemPrompt] = useState("");

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [draftInput, setDraftInput] = useState("");
  // undefined = no pending switch; null = switch to no selection; number = switch to that id
  const [pendingSwitchId, setPendingSwitchId] = useState<number | null | undefined>(undefined);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Central guard: all conversation-selection changes go through here.
  // force=true skips the draft check (e.g. when the current conversation is deleted).
  const attemptSwitchTo = (newId: number | null, force = false) => {
    if (newId === selectedId) return;
    if (!force && draftInput.trim()) {
      setPendingSwitchId(newId);
      setShowUnsavedDialog(true);
    } else {
      setSelectedId(newId);
      setDraftInput("");
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingSwitchId !== undefined) {
      setSelectedId(pendingSwitchId);
      setDraftInput("");
    }
    setPendingSwitchId(undefined);
    setShowUnsavedDialog(false);
  };

  const handleCancelSwitch = () => {
    setPendingSwitchId(undefined);
    setShowUnsavedDialog(false);
  };

  const { data: conversations, isLoading: isLoadingConversations } = useListOpenaiConversations();
  const { data: modelsData } = useListOpenaiModels();
  const models = modelsData?.models ?? [];

  useEffect(() => {
    if (models.length > 0 && !newModel) {
      setNewModel(models[0]);
    }
  }, [models, newModel]);
  const createConversation = useCreateOpenaiConversation();
  const updateConversation = useUpdateOpenaiConversation();
  const deleteConversation = useDeleteOpenaiConversation();

  const openEditDialog = (conv: OpenaiConversation) => {
    setEditingConversation(conv);
    setEditTitle(conv.title);
    setEditModel(conv.model as OpenaiModel);
    setEditSystemPrompt(conv.systemPrompt ?? "");
    setConfirmingDelete(false);
  };

  const closeEditDialog = () => {
    setEditingConversation(null);
    setConfirmingDelete(false);
  };

  const handleDelete = () => {
    if (!editingConversation) return;
    const deletedId = editingConversation.id;
    queryClient.setQueryData<OpenaiConversation[]>(
      getListOpenaiConversationsQueryKey(),
      (old) => old?.filter((c) => c.id !== deletedId) ?? []
    );
    if (selectedId === deletedId) {
      // Force-switch: the conversation is gone so the draft is irrelevant
      attemptSwitchTo(null, true);
    }
    closeEditDialog();
    deleteConversation.mutate(
      { id: deletedId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        },
        onError: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        },
      }
    );
  };

  const handleUpdate = async () => {
    if (!editingConversation || !editTitle || !editModel) return;
    updateConversation.mutate(
      { id: editingConversation.id, data: { title: editTitle, model: editModel, systemPrompt: editSystemPrompt.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          if (selectedId === editingConversation.id) {
            queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(editingConversation.id) });
          }
          setEditingConversation(null);
        },
        onError: (error) => {
          const description = (error.data as { error?: string } | null)?.error ?? error.message;
          toast({
            variant: "destructive",
            title: "Failed to save workspace",
            description,
          });
        },
      }
    );
  };

  const handleCreate = async () => {
    if (!newTitle || !newModel) return;
    
    createConversation.mutate(
      { data: { title: newTitle, model: newModel, systemPrompt: newSystemPrompt } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          attemptSwitchTo(data.id);
          setIsCreating(false);
          setNewTitle("");
          setNewSystemPrompt("");
        },
        onError: (error) => {
          const description = (error.data as { error?: string } | null)?.error ?? error.message;
          toast({
            variant: "destructive",
            title: "Failed to create workspace",
            description,
          });
        },
      }
    );
  };

  return (
    <div className="flex h-full w-full">
      {/* Unsaved draft confirmation dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={(open) => { if (!open) handleCancelSwitch(); }}>
        <DialogContent className="sm:max-w-[360px] bg-card border-border text-foreground" data-testid="dialog-unsaved-draft">
          <DialogHeader>
            <DialogTitle>Unsent message</DialogTitle>
          </DialogHeader>
          <DialogDescription>You have an unsent message in this conversation. If you switch now, your draft will be lost.</DialogDescription>
          <DialogFooter className="flex-row justify-end gap-2 mt-2">
            <Button variant="outline" onClick={handleCancelSwitch} data-testid="btn-stay-conversation">Stay</Button>
            <Button variant="destructive" onClick={handleConfirmSwitch} data-testid="btn-discard-and-switch">Discard &amp; switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Conversation Dialog */}
      <Dialog open={!!editingConversation} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{t("title")}</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="E.g. Korean Translation Test"
                data-testid="input-edit-title"
                className="font-mono bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{t("select_model")}</label>
              <Select value={editModel} onValueChange={(v) => setEditModel(v as OpenaiModel)}>
                <SelectTrigger className="font-mono bg-background" data-testid="select-edit-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m} data-testid={`edit-model-option-${m}`}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SystemPromptField
              value={editSystemPrompt}
              onChange={setEditSystemPrompt}
              textareaTestId="input-edit-system-prompt"
              model={editModel || undefined}
            />
          </div>
          {confirmingDelete ? (
            <div className="border border-destructive/40 rounded-md p-3 bg-destructive/5 space-y-3">
              <p className="text-sm text-destructive font-medium">Delete this workspace and all its messages?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmingDelete(false)}
                  data-testid="btn-cancel-delete"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleteConversation.isPending}
                  data-testid="btn-confirm-delete"
                >
                  {deleteConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Yes, delete
                </Button>
              </div>
            </div>
          ) : null}
          <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmingDelete(true)}
              disabled={confirmingDelete}
              data-testid="btn-delete-conversation"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeEditDialog}>{t("cancel")}</Button>
              <Button onClick={handleUpdate} disabled={!editTitle || updateConversation.isPending} data-testid="btn-save-edit">
                {updateConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <Select value={newModel} onValueChange={(v) => setNewModel(v as OpenaiModel)}>
                    <SelectTrigger className="font-mono bg-background" data-testid="select-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(m => (
                        <SelectItem key={m} value={m} data-testid={`model-option-${m}`}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <SystemPromptField
                  value={newSystemPrompt}
                  onChange={setNewSystemPrompt}
                  textareaTestId="input-system-prompt"
                  model={newModel || undefined}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>{t("cancel")}</Button>
                <Button onClick={handleCreate} disabled={!newTitle || !newModel || createConversation.isPending} data-testid="btn-create-chat">
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
                <div
                  key={conv.id}
                  className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all flex items-center group ${
                    selectedId === conv.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary border border-transparent"
                  }`}
                >
                  <button
                    data-testid={`chat-item-${conv.id}`}
                    onClick={() => attemptSwitchTo(conv.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className={`font-medium truncate ${selectedId === conv.id ? "text-primary" : "text-foreground"}`}>
                      {conv.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="flex items-center">
                        <Cpu className="h-3 w-3 mr-1" />
                        {conv.model}
                      </span>
                      {conv.systemPrompt && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-primary/15 text-primary border border-primary/25" title={conv.systemPrompt}>
                          SYS
                        </span>
                      )}
                      {conv.messageCount !== undefined && (
                        <span
                          data-testid={`msg-count-${conv.id}`}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            conv.messageCount === 0
                              ? "text-muted-foreground/50 bg-muted/30"
                              : "text-muted-foreground bg-muted/50"
                          }`}
                        >
                          {conv.messageCount === 0 ? "0 msgs" : `${conv.messageCount} msg${conv.messageCount === 1 ? "" : "s"}`}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    data-testid={`btn-edit-${conv.id}`}
                    onClick={(e) => { e.stopPropagation(); openEditDialog(conv); }}
                    className="ml-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    title="Edit workspace"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-1 ${selectedId === conv.id ? "opacity-100 text-primary" : "text-muted-foreground"}`} />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right panel - Chat Area */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {selectedId ? <ChatArea conversationId={selectedId} draft={draftInput} onDraftChange={setDraftInput} /> : (
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

function ChatArea({ conversationId, draft, onDraftChange }: { conversationId: number; draft: string; onDraftChange: (val: string) => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: conversation, isLoading } = useGetOpenaiConversation(conversationId, {
    query: { enabled: !!conversationId, queryKey: getGetOpenaiConversationQueryKey(conversationId) }
  });

  const input = draft;
  const setInput = onDraftChange;
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
            if (dataStr === "[DONE]") continue;
            
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
      
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
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
          <div className="ml-3 flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-primary/15 text-primary border border-primary/25 shrink-0" data-testid="system-prompt-indicator">
              SYS
            </span>
            <span className="text-xs text-muted-foreground truncate font-mono" title={conversation.systemPrompt}>
              {conversation.systemPrompt}
            </span>
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

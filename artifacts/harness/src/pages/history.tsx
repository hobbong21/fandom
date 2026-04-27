import { useLanguage } from "@/lib/i18n";
import { useListOpenaiConversations, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, Trash2, Database, Cpu } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: conversations, isLoading } = useListOpenaiConversations({
    query: { refetchInterval: 30_000, refetchIntervalInBackground: true },
  });
  const deleteConversation = useDeleteOpenaiConversation();

  const handleDelete = (id: number) => {
    deleteConversation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center mb-8 border-b border-border pb-4">
          <Database className="h-6 w-6 text-primary mr-3" />
          <h1 className="text-2xl font-bold tracking-tight">{t("history_title")}</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full bg-card" />
            <Skeleton className="h-16 w-full bg-card" />
            <Skeleton className="h-16 w-full bg-card" />
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="text-center p-12 bg-card rounded-md border border-border text-muted-foreground font-mono">
            {t("no_conversations")}
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div key={conv.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-md hover:border-primary/50 transition-colors" data-testid={`history-item-${conv.id}`}>
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-medium text-foreground truncate">{conv.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center"><Cpu className="h-3 w-3 mr-1 text-primary" />{conv.model}</span>
                    <span>{format(new Date(conv.createdAt), "MMM d, yyyy HH:mm")}</span>
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" data-testid={`btn-delete-${conv.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("confirm_delete")}</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete the conversation and all associated messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-border hover:bg-secondary">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(conv.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="btn-confirm-delete"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

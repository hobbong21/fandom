import { Link, useLocation } from "wouter";
import { MessageSquare, Image as ImageIcon, History, Terminal } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: "/", label: t("nav_chat"), icon: MessageSquare, id: "nav-chat" },
    { href: "/image", label: t("nav_image"), icon: ImageIcon, id: "nav-image" },
    { href: "/history", label: t("nav_history"), icon: History, id: "nav-history" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-mono selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Terminal className="w-5 h-5 text-primary mr-2" />
          <span className="font-bold tracking-wider" data-testid="app-title">{t("app_title")}</span>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  data-testid={item.id}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Lang</span>
            <div className="flex space-x-1 bg-secondary rounded-md p-1">
              <button
                data-testid="btn-lang-en"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 text-xs rounded-sm transition-colors ${
                  language === "en" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                data-testid="btn-lang-ko"
                onClick={() => setLanguage("ko")}
                className={`px-2 py-1 text-xs rounded-sm transition-colors ${
                  language === "ko" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                KO
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}

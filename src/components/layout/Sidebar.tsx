import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/uiStore";
import { ProfileSelector } from "@/components/shared/ProfileSelector";
import { useT } from "@/hooks/useT";
import {
  LayoutDashboard,
  Layers,
  Terminal,
  Music2,
  Activity,
  GitBranch,
  Container,
  Puzzle,
  Settings,
  Bot,
  ChevronLeft,
} from "lucide-react";

export function Sidebar() {
  const { activePanel, isSidebarCollapsed, setActivePanel, toggleSidebar } = useUIStore();
  const t = useT();

  const NAV_ITEMS = [
    { id: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { id: "deck", label: t.nav.deck, icon: Layers },
    { id: "terminal", label: t.nav.terminal, icon: Terminal },
    { id: "git", label: t.nav.git, icon: GitBranch },
    { id: "docker", label: t.nav.docker, icon: Container },
    { id: "soundboard", label: t.nav.soundboard, icon: Music2 },
    { id: "monitoring", label: t.nav.monitoring, icon: Activity },
    { id: "ai", label: t.nav.ai, icon: Bot },
    { id: "plugins", label: t.nav.plugins, icon: Puzzle },
  ] as const;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div
        className="flex h-12 items-center gap-3 px-4 border-b border-border"
        data-tauri-drag-region
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shrink-0">
          D
        </div>
        {!isSidebarCollapsed && (
          <span className="font-semibold text-sm tracking-wide">DevDeck</span>
        )}
      </div>

      {/* Profile selector */}
      <div className={cn("px-2 py-2 border-b border-border", isSidebarCollapsed && "flex justify-center")}>
        <ProfileSelector collapsed={isSidebarCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            title={isSidebarCollapsed ? label : undefined}
            className={cn(
              "no-drag flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
              activePanel === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border p-2 space-y-1">
        <button
          onClick={() => setActivePanel("settings")}
          title={isSidebarCollapsed ? t.nav.settings : undefined}
          className={cn(
            "no-drag flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
            activePanel === "settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isSidebarCollapsed && <span>{t.nav.settings}</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="no-drag flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ChevronLeft
            className={cn("h-4 w-4 shrink-0 transition-transform", isSidebarCollapsed && "rotate-180")}
          />
          {!isSidebarCollapsed && <span>{t.nav.collapse}</span>}
        </button>
      </div>
    </aside>
  );
}

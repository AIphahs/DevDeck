import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const DeckPage = lazy(() => import("@/pages/DeckPage").then((m) => ({ default: m.DeckPage })));
const TerminalPage = lazy(() => import("@/pages/TerminalPage").then((m) => ({ default: m.TerminalPage })));
const GitPage = lazy(() => import("@/pages/GitPage").then((m) => ({ default: m.GitPage })));
const DockerPage = lazy(() => import("@/pages/DockerPage").then((m) => ({ default: m.DockerPage })));
const SoundboardPage = lazy(() => import("@/pages/SoundboardPage").then((m) => ({ default: m.SoundboardPage })));
const MonitoringPage = lazy(() => import("@/pages/MonitoringPage").then((m) => ({ default: m.MonitoringPage })));
const AIPage = lazy(() => import("@/pages/AIPage").then((m) => ({ default: m.AIPage })));
const PluginsPage = lazy(() => import("@/pages/PluginsPage").then((m) => ({ default: m.PluginsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

const PANELS: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  deck: DeckPage,
  terminal: TerminalPage,
  git: GitPage,
  docker: DockerPage,
  soundboard: SoundboardPage,
  monitoring: MonitoringPage,
  ai: AIPage,
  plugins: PluginsPage,
  settings: SettingsPage,
};

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function MainContent() {
  const { activePanel } = useUIStore();
  const Panel = PANELS[activePanel] ?? DashboardPage;

  return (
    <main className="flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="h-full"
        >
          <Suspense fallback={<PageFallback />}>
            <Panel />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

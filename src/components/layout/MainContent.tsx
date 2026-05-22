import { useUIStore } from "@/store/uiStore";
import { AnimatePresence, motion } from "framer-motion";

const panels: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  dashboard: React.lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage }))),
  terminal: React.lazy(() => import("@/pages/TerminalPage").then(m => ({ default: m.TerminalPage }))),
  git: React.lazy(() => import("@/pages/GitPage").then(m => ({ default: m.GitPage }))),
  docker: React.lazy(() => import("@/pages/DockerPage").then(m => ({ default: m.DockerPage }))),
  soundboard: React.lazy(() => import("@/pages/SoundboardPage").then(m => ({ default: m.SoundboardPage }))),
  monitoring: React.lazy(() => import("@/pages/MonitoringPage").then(m => ({ default: m.MonitoringPage }))),
  ai: React.lazy(() => import("@/pages/AIPage").then(m => ({ default: m.AIPage }))),
  plugins: React.lazy(() => import("@/pages/PluginsPage").then(m => ({ default: m.PluginsPage }))),
  settings: React.lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage }))),
};

import React, { Suspense } from "react";

export function MainContent() {
  const { activePanel } = useUIStore();
  const Panel = panels[activePanel];

  return (
    <main className="flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="h-full"
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Loading...
              </div>
            }
          >
            {Panel && <Panel />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

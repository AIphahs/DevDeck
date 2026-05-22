import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MainContent } from "./MainContent";
import { OutputPanel } from "@/components/shared/OutputPanel";

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <MainContent />
      </div>
      <OutputPanel />
    </div>
  );
}

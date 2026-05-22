import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { ShortcutsSettings } from "@/components/settings/ShortcutsSettings";
import { Info } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold">Paramètres</h1>
      </div>

      <Tabs defaultValue="appearance" className="flex flex-1 overflow-hidden">
        {/* Sidebar tabs */}
        <div className="w-44 shrink-0 border-r border-border p-3">
          <TabsList className="flex h-auto flex-col items-stretch gap-1 bg-transparent p-0">
            <TabsTrigger value="appearance" className="justify-start data-[state=active]:bg-accent">
              Apparence
            </TabsTrigger>
            <TabsTrigger value="profiles" className="justify-start data-[state=active]:bg-accent">
              Profils
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="justify-start data-[state=active]:bg-accent">
              Raccourcis
            </TabsTrigger>
            <TabsTrigger value="about" className="justify-start data-[state=active]:bg-accent">
              À propos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl">
            <TabsContent value="appearance" className="mt-0">
              <ThemeSettings />
            </TabsContent>

            <TabsContent value="profiles" className="mt-0">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="shortcuts" className="mt-0">
              <ShortcutsSettings />
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">D</div>
                  <div>
                    <p className="font-semibold text-lg">DevDeck</p>
                    <p className="text-sm text-muted-foreground">v0.1.0 — Phase 4</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Built with Tauri v2 + React + TypeScript</p>
                  <p>By <span className="text-foreground font-medium">AIphahs</span></p>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/50 p-3">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    DevDeck is a modular desktop automation platform for developers, DevOps engineers, and creators.
                    Android support, plugin marketplace, and AI assistant are planned in upcoming phases.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

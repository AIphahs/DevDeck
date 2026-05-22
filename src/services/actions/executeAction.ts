import type { Button } from "@/types";
import { executeCommand } from "@/services/tauri/shell";
import { open } from "@tauri-apps/plugin-shell";
import { useOutputStore } from "@/store/outputStore";

export async function executeAction(button: Button): Promise<void> {
  const { actionType, actionData } = button;

  switch (actionType) {
    case "command": {
      const shell = (actionData.shell as string) ?? "powershell";
      const command = actionData.command as string;
      const { addEntry, updateEntry } = useOutputStore.getState();
      const id = addEntry({ label: button.label, command, stdout: "", stderr: "", exitCode: null, status: "running" });
      try {
        const output = await executeCommand({ shell: shell as never, command });
        updateEntry(id, { stdout: output.stdout, stderr: output.stderr, exitCode: output.exitCode, status: output.exitCode === 0 ? "success" : "error" });
      } catch (err) {
        updateEntry(id, { stderr: String(err), exitCode: -1, status: "error" });
      }
      break;
    }

    case "url": {
      const url = actionData.url as string;
      await open(url);
      break;
    }

    case "app": {
      const path = actionData.path as string;
      const { addEntry, updateEntry } = useOutputStore.getState();
      const id = addEntry({ label: button.label, command: path, stdout: "", stderr: "", exitCode: null, status: "running" });
      try {
        const output = await executeCommand({ shell: "powershell", command: `Start-Process "${path}"` });
        updateEntry(id, { stdout: output.stdout, stderr: output.stderr, exitCode: output.exitCode, status: output.exitCode === 0 ? "success" : "error" });
      } catch (err) {
        updateEntry(id, { stderr: String(err), exitCode: -1, status: "error" });
      }
      break;
    }

    case "hotkey":
      // Handled by Tauri global shortcut plugin
      break;

    case "multi": {
      const steps = (actionData.steps as Button[]) ?? [];
      for (const step of steps) {
        const delay = (step.actionData.delay as number) ?? 0;
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        await executeAction(step);
      }
      break;
    }

    default:
      console.warn(`Unknown action type: ${actionType}`);
  }
}

import type { Button, ActionType } from "@/types";
import { executeCommand } from "@/services/tauri/shell";
import { open } from "@tauri-apps/plugin-shell";
import { useOutputStore } from "@/store/outputStore";
import { toggleClip } from "@/services/audio/soundService";

// Convert "Ctrl+Shift+K" → SendKeys format "^+K" for PowerShell Windows.Forms
function toSendKeys(combo: string): string {
  const parts = combo.split("+");
  let result = "";
  for (const part of parts) {
    switch (part) {
      case "Ctrl":  result += "^"; break;
      case "Alt":   result += "%"; break;
      case "Shift": result += "+"; break;
      case "Meta":  result += "^"; break; // Win key not supported, fall back to Ctrl
      default: {
        const specials: Record<string, string> = {
          Enter: "{ENTER}", Tab: "{TAB}", Escape: "{ESC}", Backspace: "{BACKSPACE}",
          Delete: "{DELETE}", Home: "{HOME}", End: "{END}",
          ArrowUp: "{UP}", ArrowDown: "{DOWN}", ArrowLeft: "{LEFT}", ArrowRight: "{RIGHT}",
          PageUp: "{PGUP}", PageDown: "{PGDN}", Insert: "{INS}", Space: " ",
        };
        if (specials[part]) {
          result += specials[part];
        } else if (/^F\d+$/.test(part)) {
          result += `{${part}}`;
        } else {
          result += part;
        }
      }
    }
  }
  return result;
}

interface SimpleStep {
  id?: string;
  actionType: ActionType;
  value?: string;
  shell?: string;
  delay?: number;
  // Legacy Button format (backwards compat)
  actionData?: Record<string, unknown>;
  styleData?: unknown;
  label?: string;
  col?: number;
  row?: number;
  pageId?: string;
  icon?: string;
}

export async function executeAction(button: Button): Promise<void> {
  const { actionType } = button;
  const actionData: Record<string, unknown> = button.actionData ?? {};

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
      await open(actionData.url as string);
      break;
    }

    case "app": {
      const path = actionData.path as string;
      const { addEntry, updateEntry } = useOutputStore.getState();
      const id = addEntry({ label: button.label, command: path, stdout: "", stderr: "", exitCode: null, status: "running" });
      try {
        // Use -LiteralPath with single-quote escaping to prevent PowerShell injection
        const escapedPath = path.replace(/'/g, "''");
        const output = await executeCommand({ shell: "powershell", command: `Start-Process -LiteralPath '${escapedPath}'` });
        updateEntry(id, { stdout: output.stdout, stderr: output.stderr, exitCode: output.exitCode, status: output.exitCode === 0 ? "success" : "error" });
      } catch (err) {
        updateEntry(id, { stderr: String(err), exitCode: -1, status: "error" });
      }
      break;
    }

    case "sound": {
      const filePath = actionData.soundPath as string;
      if (!filePath) break;
      const volume = (actionData.volume as number) ?? 1;
      const loop = (actionData.loop as boolean) ?? false;
      await toggleClip(button.id, filePath, volume, loop);
      break;
    }

    case "hotkey": {
      const keys = actionData.hotkey as string;
      if (!keys) break;
      const sendKeys = toSendKeys(keys);
      // Use WScript.Shell via PowerShell for reliable keystroke injection
      const psCmd = `$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys('${sendKeys.replace(/'/g, "''")}')`;
      try {
        await executeCommand({ shell: "powershell", command: psCmd });
      } catch {
        // Silent fail — hotkey injection is best-effort
      }
      break;
    }

    case "multi": {
      const rawSteps = (actionData.steps as SimpleStep[]) ?? [];
      for (const step of rawSteps) {
        const delay = step.delay ?? (step.actionData?.delay as number) ?? 0;
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));

        // Normalise to a Button-like object that executeAction can recurse into
        const stepActionData: Record<string, unknown> = step.actionData ?? (
          step.actionType === "command" ? { command: step.value ?? "", shell: step.shell ?? "powershell" } :
          step.actionType === "url"     ? { url: step.value ?? "" } :
          step.actionType === "app"     ? { path: step.value ?? "" } :
          step.actionType === "hotkey"  ? { hotkey: step.value ?? "" } :
          step.actionType === "sound"   ? { soundPath: step.value ?? "" } :
          {}
        );

        await executeAction({
          id: step.id ?? "",
          pageId: step.pageId ?? "",
          label: step.label ?? "",
          col: step.col ?? 0,
          row: step.row ?? 0,
          icon: step.icon,
          actionType: step.actionType,
          actionData: stepActionData,
          styleData: {},
        });
      }
      break;
    }

    default:
      console.warn(`Unknown action type: ${actionType}`);
  }
}

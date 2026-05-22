import { invoke } from "@tauri-apps/api/core";

export type ShellType = "powershell" | "bash" | "cmd";

export interface CommandRequest {
  shell: ShellType;
  command: string;
  workingDir?: string;
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function executeCommand(req: CommandRequest): Promise<CommandOutput> {
  return invoke<CommandOutput>("execute_command", { req });
}

export async function executeScript(path: string, shell: ShellType): Promise<CommandOutput> {
  return invoke<CommandOutput>("execute_script", { path, shell });
}

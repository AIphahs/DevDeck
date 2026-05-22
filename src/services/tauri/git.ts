import { executeCommand } from "./shell";

export interface GitStatus {
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

export async function gitStatus(cwd: string): Promise<GitStatus> {
  const [branchOut, statusOut, aheadBehindOut] = await Promise.all([
    executeCommand({ shell: "powershell", command: "git rev-parse --abbrev-ref HEAD 2>&1", workingDir: cwd }),
    executeCommand({ shell: "powershell", command: "git status --porcelain 2>&1", workingDir: cwd }),
    executeCommand({ shell: "powershell", command: "git rev-list --left-right --count HEAD...@{upstream} 2>&1", workingDir: cwd }),
  ]);

  if (branchOut.exitCode !== 0) throw new Error(branchOut.stdout.trim() || "Not a git repository");

  const branch = branchOut.stdout.trim() || "unknown";
  const staged: string[] = [];
  const unstaged: string[] = [];
  const untracked: string[] = [];

  for (const line of statusOut.stdout.split("\n").filter(Boolean)) {
    const xy = line.slice(0, 2);
    const file = line.slice(3).trim();
    if (xy === "??") { untracked.push(file); continue; }
    if (xy[0] !== " ") staged.push(file);
    if (xy[1] !== " ") unstaged.push(file);
  }

  let ahead = 0, behind = 0;
  const ab = aheadBehindOut.stdout.trim().match(/^(\d+)\s+(\d+)$/);
  if (ab) { ahead = parseInt(ab[1]); behind = parseInt(ab[2]); }

  return { branch, staged, unstaged, untracked, ahead, behind };
}

export async function gitLog(cwd: string, limit = 30): Promise<GitCommit[]> {
  const out = await executeCommand({
    shell: "powershell",
    command: `git log --pretty=format:"%H|||%s|||%an|||%ar" -${limit} 2>&1`,
    workingDir: cwd,
  });
  if (out.exitCode !== 0) throw new Error(out.stdout + out.stderr);
  return out.stdout.split("\n").filter(Boolean).map((line) => {
    const [hash, message, author, date] = line.split("|||");
    return { hash: (hash ?? "").slice(0, 8), message: message ?? "", author: author ?? "", date: date ?? "" };
  });
}

export async function gitBranches(cwd: string): Promise<GitBranch[]> {
  const out = await executeCommand({
    shell: "powershell",
    command: "git branch -a 2>&1",
    workingDir: cwd,
  });
  if (out.exitCode !== 0) throw new Error(out.stdout + out.stderr);
  return out.stdout
    .split("\n")
    .filter((l) => l.trim() && !l.includes("->"))
    .map((line) => {
      const isCurrent = line.startsWith("*");
      const name = line.replace(/^\*?\s+/, "").trim();
      const isRemote = name.startsWith("remotes/");
      return { name: name.replace(/^remotes\//, ""), isCurrent, isRemote };
    });
}

export async function gitRun(cwd: string, subcommand: string): Promise<string> {
  const out = await executeCommand({
    shell: "powershell",
    command: `git ${subcommand} 2>&1`,
    workingDir: cwd,
  });
  return (out.stdout + out.stderr).trim();
}

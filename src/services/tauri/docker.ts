import { executeCommand } from "./shell";

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "running" | "exited" | "paused" | "other";
  ports: string;
  created: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export async function dockerContainers(): Promise<DockerContainer[]> {
  const out = await executeCommand({
    shell: "powershell",
    command: `docker ps -a --format "{{.ID}}|||{{.Names}}|||{{.Image}}|||{{.Status}}|||{{.State}}|||{{.Ports}}|||{{.CreatedAt}}" 2>&1`,
  });
  if (out.exitCode !== 0) throw new Error(out.stderr || out.stdout);
  return out.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, name, image, status, state, ports, created] = line.split("|||");
      const s = (state ?? "").toLowerCase();
      return {
        id: id ?? "",
        name: name ?? "",
        image: image ?? "",
        status: status ?? "",
        state: s === "running" ? "running" : s === "exited" ? "exited" : s === "paused" ? "paused" : "other",
        ports: ports ?? "",
        created: created ?? "",
      } as DockerContainer;
    });
}

export async function dockerImages(): Promise<DockerImage[]> {
  const out = await executeCommand({
    shell: "powershell",
    command: `docker images --format "{{.ID}}|||{{.Repository}}|||{{.Tag}}|||{{.Size}}|||{{.CreatedAt}}" 2>&1`,
  });
  if (out.exitCode !== 0) throw new Error(out.stderr || out.stdout);
  return out.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, repository, tag, size, created] = line.split("|||");
      return { id: id ?? "", repository: repository ?? "", tag: tag ?? "", size: size ?? "", created: created ?? "" };
    });
}

export async function dockerAction(
  containerId: string,
  action: "start" | "stop" | "remove"
): Promise<void> {
  const cmd = action === "remove" ? `docker rm -f ${containerId}` : `docker ${action} ${containerId}`;
  const out = await executeCommand({ shell: "powershell", command: `${cmd} 2>&1` });
  if (out.exitCode !== 0) throw new Error((out.stderr || out.stdout).trim());
}

export async function dockerLogs(containerId: string, tail = 100): Promise<string> {
  const out = await executeCommand({
    shell: "powershell",
    command: `docker logs --tail ${tail} ${containerId} 2>&1`,
  });
  return (out.stdout + out.stderr).trim();
}

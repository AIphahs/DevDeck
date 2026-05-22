export interface SystemInfo {
  cpuUsage: number;
  ramUsed: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  osName: string;
  hostname: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsage: number;
  memory: number;
}

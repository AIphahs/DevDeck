import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
let activeKey = "";

function getClient(apiKey: string): Anthropic {
  if (!client || activeKey !== apiKey) {
    client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    activeKey = apiKey;
  }
  return client;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askClaude(
  messages: AIMessage[],
  apiKey: string,
  systemPrompt?: string
): Promise<string> {
  const claude = getClient(apiKey);

  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt ?? "You are DevDeck AI, an assistant specialized in DevOps, shell commands, Docker, Git, and developer productivity. Be concise and practical.",
    messages,
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}

export async function generateShellCommand(
  description: string,
  shell: "powershell" | "bash" | "cmd",
  apiKey: string
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: "user",
      content: `Generate a ${shell} command that: ${description}\nRespond with ONLY the command, no explanation.`,
    },
  ];
  return askClaude(messages, apiKey);
}

export async function explainError(
  error: string,
  context: string,
  apiKey: string
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: "user",
      content: `Context: ${context}\n\nError:\n${error}\n\nExplain this error and how to fix it concisely.`,
    },
  ];
  return askClaude(messages, apiKey);
}

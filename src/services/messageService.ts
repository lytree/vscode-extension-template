export function formatHelloMessage(input?: string): string {
  if (!input?.trim()) {
    return 'Hello from extension service 👋';
  }

  return `Hello, ${input.trim()}! 欢迎使用 VSCode 插件模板。`;
}

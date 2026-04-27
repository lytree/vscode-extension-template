import * as vscode from "vscode";
import path from "path";

export const interval = () => {
  let timerId: any = null;

  function start(callback: () => void, delay: number) {
    stop();

    timerId = setInterval(callback, delay * 60000);
    return timerId;
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return { start, stop };
};

export const runInterval = interval();

export const getScriptPath = (extensionPath: string) => {
  const scriptPath = vscode.Uri.file(
    path.join(extensionPath, "media", "fenbi.js")
  );
  return scriptPath;
};

export const getScriptUri = (
  webview: vscode.WebviewView,
  scriptPath: vscode.Uri
) => {
  const scriptUri = webview.webview.asWebviewUri(scriptPath);
  return scriptUri;
};
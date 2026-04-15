import * as vscode from "vscode";
import path from "path";

export class Webview {
  panel: any;

  // setWebviewHtml(extensionPath: string) {
  //   const scriptPath = vscode.Uri.file(
  //     path.join(extensionPath, "media", "view.js")
  //   );

  //   const scriptUri = this.panel.webview.asWebviewUri(scriptPath);
  //   this.panel.webview.html = templateHtml(scriptUri);
  // }

  // createSideInit(webviewView: vscode.WebviewView, extensionPath: string) {
  //   this.panel = webviewView;
  //   webviewView.webview.options = {
  //     enableScripts: true,
  //   };

  //   this.setWebviewHtml(extensionPath);

  //   return webviewView;
  // }

  onDidChangeVisibility(callback: () => void) {
    this.panel.onDidChangeVisibility(callback);
  }

  onDidDispose(callback: () => void) {
    this.panel.onDidDispose(callback);
  }

  onDidReceiveMessage(callback: (message: { [key: string]: any }) => void) {
    this.panel.webview.onDidReceiveMessage(callback);
  }

  // createInit(extensionPath: string, webviewId: string, webviewTitle?: string) {
  //   this.panel = vscode.window.createWebviewPanel(
  //     webviewId,
  //     webviewTitle || "详情",
  //     vscode.ViewColumn.One,
  //     {
  //       enableScripts: true,
  //     }
  //   );

  //   this.setWebviewHtml(extensionPath);

  //   return this.panel;
  // }

  postMessage({ command, data }: { command: string; data: any }) {
    setTimeout(() => {
      this.panel.webview.postMessage({
        command,
        data,
      });
    }, 50);
  }
}

export const webview = new Webview();
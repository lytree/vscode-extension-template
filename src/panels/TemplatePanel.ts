import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { formatHelloMessage } from '../services/messageService';

export class TemplatePanel {
  public static currentPanel: TemplatePanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (TemplatePanel.currentPanel) {
      TemplatePanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'vscodeExtensionTemplateWebview',
      'VSCode Extension Template',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webviews')]
      }
    );

    TemplatePanel.currentPanel = new TemplatePanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.webview.html = this.getWebviewContent(this.panel.webview);
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message: { type?: string; payload?: string }) => {
        if (message.type === 'sayHello') {
          const text = formatHelloMessage(message.payload);
          this.panel.webview.postMessage({ type: 'helloResult', payload: text });
          return;
        }

        void vscode.window.showWarningMessage(`Unknown message type: ${message.type ?? 'undefined'}`);
      },
      null,
      this.disposables
    );
  }

  public dispose() {
    TemplatePanel.currentPanel = undefined;
    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      disposable?.dispose();
    }
  }

  private getWebviewContent(webview: vscode.Webview): string {
    const htmlPath = path.join(this.extensionUri.fsPath, 'webviews', 'index.html');
    const template = fs.readFileSync(htmlPath, 'utf8');
    const nonce = getNonce();

    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'webviews', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'webviews', 'style.css'));

    return template
      .replace(/__CSP_SOURCE__/g, webview.cspSource)
      .replace('__NONCE__', nonce)
      .replace('__SCRIPT_URI__', scriptUri.toString())
      .replace('__STYLE_URI__', styleUri.toString());
  }
}

function getNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 })
    .map(() => possible.charAt(Math.floor(Math.random() * possible.length)))
    .join('');
}

import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';
export class TemplatePanel {
  private static instance: TemplatePanel | null = null;



  public static currentPanel: TemplatePanel | undefined;

  private channel: vscode.OutputChannel;
  public static createOrShow(extensionUri: vscode.Uri, channel: vscode.OutputChannel) {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    if (TemplatePanel.currentPanel) {
      TemplatePanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', 'Template Panel', column, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });

    TemplatePanel.currentPanel = new TemplatePanel(panel, extensionUri, channel);
  }

  private constructor(private readonly panel: vscode.WebviewPanel, extensionUri: vscode.Uri, channel: vscode.OutputChannel) {
    this.panel.webview.html = renderWebviewHtml(this.panel.webview, extensionUri, 'panel', channel);
    this.channel = channel;
    this.panel.onDidDispose(() => {
      TemplatePanel.currentPanel = undefined;
    });
  }
}


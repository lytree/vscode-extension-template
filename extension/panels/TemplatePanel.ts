import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';

export class TemplatePanel {
  public static currentPanel: TemplatePanel | undefined;

  public static createOrShow(extensionUri: vscode.Uri) {
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
    
    TemplatePanel.currentPanel = new TemplatePanel(panel, extensionUri);
  }

  private constructor(private readonly panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel.webview.html = renderWebviewHtml(this.panel.webview, extensionUri, 'panel');

    this.panel.onDidDispose(() => {
      TemplatePanel.currentPanel = undefined;
    });
  }
}

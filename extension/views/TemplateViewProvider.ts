import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';

export class TemplateViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'template.webviewView';

  constructor(private readonly extensionUri: vscode.Uri) {
    
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
    };

    webviewView.webview.html = renderWebviewHtml(webviewView.webview, this.extensionUri, 'view');
  }
}

import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';
import WebviewHandle from '../api/webviewHandle.js';
export class TemplateViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'template.webviewView';
  private fenbiChannel: vscode.OutputChannel;
  constructor(private readonly extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel) {
    this.fenbiChannel = fenbiChannel;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
    };



    this.fenbiChannel.appendLine(`Setting HTML content for webview view: ${TemplateViewProvider.viewType}`);
    webviewView.webview.html = renderWebviewHtml(webviewView.webview, this.extensionUri, 'view', this.fenbiChannel);


    new WebviewHandle(webviewView, this.fenbiChannel).onDidReceiveMessage();
  }
}

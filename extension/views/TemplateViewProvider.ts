import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';
import WebviewHandle from '../api/webviewHandle.js';
import { registerRefreshEntryCommand } from '../commands/registerRefreshEntryCommand.js';
import { registerNavigateToTikuCommand } from '../commands/registerNavigateToTikuCommand.js';
import { registerNavigateToHistoryCommand } from '../commands/registerNavigateToHistoryCommand.js';
import { registerNavigateToPastYearsCommand } from '../commands/registerNavigateToPastYearsCommand.js';
export class TemplateViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'fenbi.webviewView';
  constructor(private readonly context: vscode.ExtensionContext, private readonly fenbiChannel: vscode.OutputChannel) {
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
    };



    this.fenbiChannel.appendLine(`Setting HTML content for webview view: ${TemplateViewProvider.viewType}`);
    registerRefreshEntryCommand(webviewView, this.fenbiChannel);
    registerNavigateToTikuCommand(webviewView, this.fenbiChannel);
    registerNavigateToHistoryCommand(webviewView, this.fenbiChannel);
    registerNavigateToPastYearsCommand(webviewView, this.fenbiChannel);
    webviewView.webview.html = renderWebviewHtml(webviewView.webview, this.context.extensionUri, 'view', this.fenbiChannel);


    new WebviewHandle(webviewView, this.fenbiChannel, this.context).onDidReceiveMessage();
  }
}

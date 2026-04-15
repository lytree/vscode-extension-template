import * as vscode from 'vscode';
import { registerHelloCommand } from './commands/registerHelloCommand.js';
import { registerOpenPanelCommand } from './commands/registerOpenPanelCommand.js';
import { TemplateViewProvider } from './views/TemplateViewProvider.js';
import { webview } from './utils/webview.js';
import WebviewHandle from './api/webviewHandle.js';

const fenbiChannel = vscode.window.createOutputChannel("Fenbi Tools", { log: true });
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Extension "vscode-extension-template" is now active!');
  registerHelloCommand(context);
  registerOpenPanelCommand(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TemplateViewProvider.viewType, new TemplateViewProvider(context.extensionUri))
  );

  const viewProvider = new ViewWebviewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("openViewWebview", viewProvider)
  );

  vscode.commands.registerCommand("openViewWebview.refreshEntry", () => {
    const config = vscode.workspace.getConfiguration("fenbiTools");
    webview.postMessage({
      command: "setting",
      data: config,
    });
  });
}

class ViewWebviewProvider implements vscode.WebviewViewProvider {
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  async resolveWebviewView(webviewView: vscode.WebviewView) {
    webview.createSideInit(webviewView, this._context.extensionPath);

    new WebviewHandle(fenbiChannel).onDidReceiveMessage();
  }
}

export function deactivate() {
  // optional cleanup
}

import * as vscode from 'vscode';
import { registerHelloCommand } from './commands/registerHelloCommand';
import { registerOpenPanelCommand } from './commands/registerOpenPanelCommand';
import { TemplateViewProvider } from './views/TemplateViewProvider';

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Extension "vscode-extension-template" is now active!');
  registerHelloCommand(context);
  registerOpenPanelCommand(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('template.webviewView', new TemplateViewProvider(context.extensionUri))
  );
}

export function deactivate() {
  // optional cleanup
}

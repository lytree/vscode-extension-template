import * as vscode from 'vscode';
import { registerHelloCommand } from './commands/registerHelloCommand.js';
import { registerOpenPanelCommand } from './commands/registerOpenPanelCommand.js';

import { TemplateViewProvider } from './views/TemplateViewProvider.js';

const fenbiChannel = vscode.window.createOutputChannel("Fenbi Tools", { log: true });
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Extension "vscode-extension-template" is now active!');

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TemplateViewProvider.viewType, new TemplateViewProvider(context.extensionUri, fenbiChannel))
  );


}

export function deactivate() {
  // optional cleanup
}
import * as vscode from 'vscode';

import { TemplateViewProvider } from './views/TemplateViewProvider.js';

const fenbiChannel = vscode.window.createOutputChannel("Fenbi", { log: true });
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Extension "vscode-extension-template" is now active!');

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TemplateViewProvider.viewType, new TemplateViewProvider(context, fenbiChannel))
  );


}

export function deactivate() {
  // optional cleanup
}

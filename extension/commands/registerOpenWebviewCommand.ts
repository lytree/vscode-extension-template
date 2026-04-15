import * as vscode from 'vscode';
import { TemplatePanel } from '../panels/TemplatePanel.js';

export function registerOpenWebviewCommand(context: vscode.ExtensionContext, cahannel: vscode.OutputChannel) {
  const disposable = vscode.commands.registerCommand('vscode-extension-template.openWebview', () => {
    TemplatePanel.createOrShow(context.extensionUri, cahannel);
  });

  context.subscriptions.push(disposable);
}

import * as vscode from 'vscode';
import { TemplatePanel } from '../panels/TemplatePanel.js';

export function registerOpenWebviewCommand(context: vscode.ExtensionContext, fenbiChannel: vscode.OutputChannel) {
  const disposable = vscode.commands.registerCommand('vscode-extension-template.openWebview', () => {
    TemplatePanel.createOrShow(context.extensionUri, fenbiChannel);
  });

  context.subscriptions.push(disposable);
}

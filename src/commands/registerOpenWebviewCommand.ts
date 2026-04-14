import * as vscode from 'vscode';
import { TemplatePanel } from '../panels/TemplatePanel';

export function registerOpenWebviewCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vscode-extension-template.openWebview', () => {
    TemplatePanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);
}

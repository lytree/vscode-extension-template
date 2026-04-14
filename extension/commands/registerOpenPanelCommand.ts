import * as vscode from 'vscode';
import { TemplatePanel } from '../panels/TemplatePanel';

export function registerOpenPanelCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vscode-extension-template.openPanel', () => {
    TemplatePanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);
}

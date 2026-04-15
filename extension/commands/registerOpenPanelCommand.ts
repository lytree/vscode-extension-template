import * as vscode from 'vscode';
import { TemplatePanel } from '../panels/TemplatePanel.js';

export function registerOpenPanelCommand(context: vscode.ExtensionContext, cahannel: vscode.OutputChannel) {
  const disposable = vscode.commands.registerCommand('vscode-extension-template.openPanel', () => {
    TemplatePanel.createOrShow(context.extensionUri, cahannel);
  });

  context.subscriptions.push(disposable);
}

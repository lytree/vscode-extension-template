import * as vscode from 'vscode';
import { registerHelloCommand } from './commands/registerHelloCommand';
import { registerOpenPanelCommand } from './commands/registerOpenPanelCommand';
import { TemplateViewProvider } from './views/TemplateViewProvider';

export function activate(context: vscode.ExtensionContext) {
  registerHelloCommand(context);
  registerOpenPanelCommand(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TemplateViewProvider.viewType, new TemplateViewProvider(context.extensionUri))
  );
}

export function deactivate() {
  // optional cleanup
}

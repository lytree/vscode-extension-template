import * as vscode from 'vscode';
import { registerOpenWebviewCommand } from './commands/registerOpenWebviewCommand';

export function activate(context: vscode.ExtensionContext) {
  registerOpenWebviewCommand(context);
}

export function deactivate() {
  // optional cleanup
}

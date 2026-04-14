import * as vscode from 'vscode';
import { registerHelloCommand } from './commands/registerHelloCommand';

export function activate(context: vscode.ExtensionContext) {
  registerHelloCommand(context);
}

export function deactivate() {
  // optional cleanup
}

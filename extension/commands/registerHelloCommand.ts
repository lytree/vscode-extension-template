import * as vscode from 'vscode';

export function registerHelloCommand(context: vscode.ExtensionContext, fenbiChannel: vscode.LogOutputChannel) {
  const disposable = vscode.commands.registerCommand('vscode-extension-template.helloWorld', async () => {
    await vscode.window.showInformationMessage('Hello from VSCode Extension Template!');
  });

  context.subscriptions.push(disposable);
}

import * as vscode from 'vscode';

export function registerRefreshEntryCommand(webviewView: vscode.WebviewView, fenbiChannel: vscode.OutputChannel) {
    vscode.commands.registerCommand("openViewWebview.refreshEntry", () => {
        const config = vscode.workspace.getConfiguration("fenbiTools");
        webviewView.webview.postMessage({
            command: "setting",
            data: config,
        });
    });
}

import * as vscode from 'vscode';

export function registerNavigateToHistoryCommand(webviewView: vscode.WebviewView, fenbiChannel: vscode.OutputChannel) {
    vscode.commands.registerCommand("fenbi.navigateToHistory", () => {
        fenbiChannel.appendLine("Navigate to History");
        webviewView.webview.postMessage({
            command: "navigate",
            data: {
                path: "/history"
            },
        });
    });
}

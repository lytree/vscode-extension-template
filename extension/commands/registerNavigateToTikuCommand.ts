import * as vscode from 'vscode';

export function registerNavigateToTikuCommand(webviewView: vscode.WebviewView, fenbiChannel: vscode.OutputChannel) {
    vscode.commands.registerCommand("fenbi.navigateToTiku", () => {
        fenbiChannel.appendLine("Navigate to Tiku");
        webviewView.webview.postMessage({
            command: "navigate",
            data: {
                path: "/"
            },
        });
    });
}

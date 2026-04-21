import * as vscode from 'vscode';

export function registerNavigateToPastYearsCommand(webviewView: vscode.WebviewView, fenbiChannel: vscode.OutputChannel) {
    vscode.commands.registerCommand("fenbi.navigateToPastYears", () => {
        fenbiChannel.appendLine("Navigate to PastYears");
        webviewView.webview.postMessage({
            command: "navigate",
            data: {
                path: "/pastYears"
            },
        });
    });
}

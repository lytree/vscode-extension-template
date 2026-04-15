import * as vscode from "vscode";



export default class WebviewHandle {
    private fenbiChannel: vscode.OutputChannel;
    private webviewPanel: vscode.WebviewView;

    constructor(webviewPanel: vscode.WebviewView, fenbiChannel: vscode.OutputChannel) {
        this.fenbiChannel = fenbiChannel;
        this.webviewPanel = webviewPanel;
    }
    onDidReceiveMessage() {
        this.webviewPanel.webview.onDidReceiveMessage((message: { [key: string]: any }) => { });
    }
}
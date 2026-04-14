import * as vscode from 'vscode';

type PageType = 'panel' | 'view';

const pageConfig: Record<PageType, { script: string; title: string }> = {
  panel: { script: 'panel-main.js', title: 'Webview Panel' },
  view: { script: 'view-main.js', title: 'Webview View' }
};

export function renderWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, page: PageType): string {
  const nonce = getNonce();
  const { script, title } = pageConfig[page];

  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'entries', script));
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'shared', 'app.css'));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
    <link rel="stylesheet" href="${styleUri}" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}

import * as vscode from 'vscode';

type PageType = 'panel' | 'view';

const pageConfig: Record<PageType, { kind: 'panel' | 'view'; title: string }> = {
  panel: { kind: 'panel', title: 'Webview Panel' },
  view: { kind: 'view', title: 'Webview View' }
};

export function renderWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, page: PageType): string {
  const nonce = getNonce();
  const { kind, title } = pageConfig[page];

  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', kind, 'index.js'));
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', kind, 'index.css'));

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

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

type PageType = 'panel' | 'view';

type ManifestItem = {
  file: string;
  css?: string[];
};

const ENTRY_KEY: Record<PageType, string> = {
  panel: 'src/panel/main.tsx',
  view: 'src/view/main.tsx'
};

export function renderWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, page: PageType, fenbiChannel: vscode.OutputChannel): string {

  const nonce = getNonce();
  const manifest = loadManifest(extensionUri);
  const entry = manifest[ENTRY_KEY[page]] as ManifestItem | undefined;
  if (!entry) {
    fenbiChannel.appendLine(`Missing Vite manifest entry for ${ENTRY_KEY[page]}. Please run: pnpm run compile:web`);
    throw new Error(`Missing Vite manifest entry for ${ENTRY_KEY[page]}. Please run: pnpm run compile:web`);
  }
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', entry.file));
  const cssFiles = entry.css || [];
  const styleUris = cssFiles.map(cssFile => webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', cssFile)));



  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
    ${styleUris.map(uri => `<link rel="stylesheet" href="${uri}" />`).join('\n    ')}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}

function loadManifest(extensionUri: vscode.Uri): Record<string, unknown> {
  const manifestPath = path.join(extensionUri.fsPath, 'media', '.vite', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Vite manifest not found. Run `pnpm run compile:web` first.');
  }

  const raw = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}

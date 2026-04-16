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



  // 加载字体文件
  const fontFiles = ['geist-cyrillic-wght-normal.woff2', 'geist-latin-ext-wght-normal.woff2', 'geist-latin-wght-normal.woff2'];
  const fontUris = fontFiles.map(fontFile => webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'fonts', fontFile)));

  // 生成字体的 @font-face 样式
  const fontFaceStyles = `
    @font-face {
      font-family: 'Geist Variable';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('${fontUris[2]}') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Geist Variable';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('${fontUris[1]}') format('woff2');
      unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Geist Variable';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('${fontUris[0]}') format('woff2');
      unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2113;
    }
  `;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';font-src ${webview.cspSource}" />
    <style nonce="${nonce}">${fontFaceStyles}</style>
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

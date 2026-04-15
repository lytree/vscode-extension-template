import * as vscode from "vscode";
const path = require("path");

export const interval = () => {
  let timerId: any = null;

  function start(callback: () => void, delay: number) {
    stop();

    timerId = setInterval(callback, delay * 60000);
    return timerId;
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return { start, stop };
};

export const runInterval = interval();

export const getScriptPath = (extensionPath: string) => {
  const scriptPath = vscode.Uri.file(
    path.join(extensionPath, "media", "fenbi.js")
  );
  return scriptPath;
};

export const templateHtml = (scriptUri: any) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>详情</title>
    </head>
    <body>
      <div id="loading">页面初始化中...</div>
      <div id="root"></div>
      <script src=${scriptUri}></script>
    </body>
  </html>`;
};

export const getScriptUri = (
  webview: vscode.WebviewView,
  scriptPath: vscode.Uri
) => {
  const scriptUri = webview.webview.asWebviewUri(scriptPath);
  return scriptUri;
};

export const modifyArray = (arr: any[], cacheKey: number[], level = 1) => {
  return arr.map((item: any) => {
    const newItem = {
      ...item,
      key: item.id,
      label: `${item.name} (${item.answerCount}/${item.count})`,
    };

    if (level > 1) {
      newItem.label = `${item.name} (${item.answerCount}/${item.count}) ${
        cacheKey?.includes(item.id) ? "【继续答题】" : ""
      }`;
    }

    if (item.children) {
      if (level === 1) {
        const allOption = {
          ...item,
          key: item.id,
          label: `全部 ${
            cacheKey?.includes(item.id) && cacheKey?.length == 1
              ? "【继续答题】"
              : ""
          }`,
          children: null,
        };
        newItem.children = [
          allOption,
          ...modifyArray(item.children, cacheKey, level + 1),
        ];
      } else {
        newItem.children = modifyArray(item.children, cacheKey, level + 1);
      }
    }

    return newItem;
  });
};

export const buildMaterialsForQuestions = (cards: any, materials: any[]) => {
  const materialContentMap = new Map(
    materials.map((m) => [m.globalId, m.content])
  );

  const usedMaterialKeys = new Set();
  const materialsForRender: any[] = [];

  const questions = cards?.children[0].children;

  questions.forEach((q: { materialKeys: any }, index: number) => {
    const keys = q.materialKeys;

    if (!keys || keys.length === 0) {
      materialsForRender[index] = null;
      return;
    }

    const key = keys[0];

    if (!usedMaterialKeys.has(key)) {
      usedMaterialKeys.add(key);

      materialsForRender[index] = {
        key,
        content: materialContentMap.get(key) || null,
      };
    } else {
      materialsForRender[index] = null;
    }
  });

  return materialsForRender;
};
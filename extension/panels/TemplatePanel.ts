import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';
import {
  getExercisesId,
  getExercisesUrl,
  getQuestion as getQuestionService,
  getSolution,
  getSolution as getSolutionService
} from '../utils/service.js';

export class TemplatePanel {
  public static currentPanel: TemplatePanel | undefined;
  private fenbiChannel: vscode.OutputChannel;
  public isWebviewReady: boolean = false;
  public pendingParams: any = null;
  public static createOrShow(extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any) {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    if (TemplatePanel.currentPanel) {
      TemplatePanel.currentPanel.panel.reveal(column);
      // 如果 Panel 已经存在，发送参数
      if (params) {
        // 检查 Webview 是否已就绪
        if (TemplatePanel.currentPanel.isWebviewReady) {
          TemplatePanel.currentPanel.postMessage({
            command: "panelInit",
            postData: params
          });
        } else {
          // 如果 Webview 未就绪，保存参数等待就绪
          TemplatePanel.currentPanel.pendingParams = params;
        }
      }
      return;
    }

    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', 'Template Panel', column, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });

    TemplatePanel.currentPanel = new TemplatePanel(panel, extensionUri, fenbiChannel, params);
  }



  private constructor(private readonly panel: vscode.WebviewPanel, extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any) {
    this.panel.webview.html = renderWebviewHtml(this.panel.webview, extensionUri, 'panel', fenbiChannel);
    this.fenbiChannel = fenbiChannel;
    this.pendingParams = params;

    // 监听来自 Webview 的消息
    this.panel.webview.onDidReceiveMessage((message: { [key: string]: any }) => {
      const { postData = {}, command = "" } = message || {};
      this.fenbiChannel.appendLine(`Panel received message: ${command} with data: ${JSON.stringify(postData)}`);

      if (command === "panelReady") {
        this.isWebviewReady = true;
        this.fenbiChannel.appendLine("Webview is ready");
        // 如果有等待的参数，发送 routerInit 消息
        if (this.pendingParams) {
          this.postMessage({
            command: `routerInit`,
            postData: {
              ...this.pendingParams,
              router: "/detail"
            }
          });
          this.pendingParams = null;
        }
      }
      if (this.isWebviewReady) {
        if (command === "getQuestion") this.getQuestion(postData);
        if (command === "getSolution") this.getSolution(postData);
        if (command === "getQuickQuestion") this.getQuickQuestion(postData);
        if (command === "submit") this.submit(postData);
        if (command === "jumpFenbi") this.jumpFenbi(postData);
        if (command === "answer") this.answer(postData);
        if (command === "closePanel") this.closePanel();
        if (command === "navigate") this.navigate(postData);
      }
    });

    this.panel.onDidDispose(() => {
      TemplatePanel.currentPanel = undefined;
    });
  }

  // 处理 getQuestion 请求
  private async getQuestion({
    category,
    id,
  }: { category: string; id: number }) {
    try {
      let postCombinKey = "";

      if (!postCombinKey) {
        const params = {
          keypointId: id,
        } as any;
        if (category === "shenlun") {
          params.count = 1;
        }
        const res = await getExercisesId(category, params);
        postCombinKey = res.key;
      }

      const exerciseResult = await getExercisesUrl({
        category,
        combineKey: postCombinKey,
      });

      if (exerciseResult?.code == -1) {
        this.panel.webview.postMessage({
          command: "message",
          data: { message: exerciseResult.message || "获取试题失败" },
        });
        return;
      }

      const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
      const questionResult = await getQuestionService(category, staticUrl);

      // 获取答案信息
      const solutionResult = await getSolution(category, postCombinKey);

      questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
      questionResult["combinKey"] = postCombinKey;
      questionResult["solutions"] = solutionResult.data?.solutions || [];

      this.panel.webview.postMessage({
        command: "getQuestion",
        data: questionResult,
      });
    } catch (error) {
      this.fenbiChannel.appendLine(`Error getting question: ${error}`);
      this.panel.webview.postMessage({
        command: "message",
        data: { message: "获取试题失败" },
      });
    }
  }

  // 处理 getQuickQuestion 请求
  private async getQuickQuestion({ category, combineKey }: { category: string; combineKey: string }) {
    try {
      const exerciseResult = await getExercisesUrl({
        category,
        combineKey: combineKey,
      });

      if (exerciseResult?.code == -1) {
        this.panel.webview.postMessage({
          command: "message",
          data: { message: exerciseResult.message || "获取试题失败" },
        });
        return;
      }

      const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
      const questionResult = await getQuestionService(category, staticUrl);

      questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
      questionResult["combinKey"] = combineKey;

      this.panel.webview.postMessage({
        command: "getQuestion",
        data: questionResult,
      });
    } catch (error) {
      this.fenbiChannel.appendLine(`Error getting quick question: ${error}`);
      this.panel.webview.postMessage({
        command: "message",
        data: { message: "获取试题失败" },
      });
    }
  }

  // 处理 submit 请求
  private async submit({ startTime, combineKey, category }: { startTime: number; combineKey: string; category: string }) {
    try {
      // 获取答案信息
      const solutionResult = await getSolutionService(category, combineKey);

      this.panel.webview.postMessage({
        command: "solution",
        data: solutionResult.data,
      });
    } catch (error) {
      this.fenbiChannel.appendLine(`Error submitting: ${error}`);
      this.panel.webview.postMessage({
        command: "message",
        data: { message: "提交失败" },
      });
    }
  }

  // 处理 getSolution 请求
  private async getSolution({ category, id, type = 1 }: { category: string; id: number; type?: number }) {
    try {
      let postCombinKey = "";

      if (!postCombinKey) {
        const params = {
          keypointId: id,
        } as any;
        if (category === "shenlun") {
          params.count = 1;
        }
        const res = await getExercisesId(category, params);
        postCombinKey = res.key;
      }

      const exerciseResult = await getExercisesUrl({
        category,
        combineKey: postCombinKey,
      });

      if (exerciseResult?.code == -1) {
        this.panel.webview.postMessage({
          command: "message",
          data: { message: exerciseResult.message || "获取试题失败" },
        });
        return;
      }

      const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
      const questionResult = await getQuestionService(category, staticUrl);
      this.fenbiChannel.appendLine("getSolution :staticUrl:" + JSON.stringify(questionResult));
      // 获取答案信息
      const solutionResult = await getSolutionService(category, postCombinKey);

      questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
      questionResult["combinKey"] = postCombinKey;
      this.fenbiChannel.appendLine("getSolution :solution:" + JSON.stringify(solutionResult));
      this.panel.webview.postMessage({
        command: "getQuestion",
        data: questionResult,
      });

      this.panel.webview.postMessage({
        command: "solution",
        data: solutionResult.data,
      });
    } catch (error) {
      this.fenbiChannel.appendLine(`Error getting solution: ${error}`);
      this.panel.webview.postMessage({
        command: "message",
        data: { message: "获取答案失败" },
      });
    }
  }

  // 处理 jumpFenbi 请求
  private jumpFenbi({ category, exerciseId }: { category: string; exerciseId: number }) {
    try {
      const url = `https://tiku.fenbi.com/${category}/exercise/${exerciseId}`;
      vscode.env.openExternal(vscode.Uri.parse(url));
    } catch (error) {
      this.fenbiChannel.appendLine(`Error jumping to fenbi: ${error}`);
    }
  }

  // 处理 answer 请求
  private answer(postData: any) {
    try {
      // 这里可以添加答题记录逻辑
      this.fenbiChannel.appendLine(`Answer submitted: ${JSON.stringify(postData)}`);
    } catch (error) {
      this.fenbiChannel.appendLine(`Error submitting answer: ${error}`);
    }
  }

  // 处理 closePanel 请求
  private closePanel() {
    try {
      this.panel.dispose();
    } catch (error) {
      this.fenbiChannel.appendLine(`Error closing panel: ${error}`);
    }
  }

  // 处理路由跳转
  private navigate({ path, state }: { path: string; state?: any }) {
    try {
      this.fenbiChannel.appendLine(`Navigating to path: ${path} with state: ${JSON.stringify(state)}`);
      this.panel.webview.postMessage({
        command: "navigate",
        data: { path, state }
      });
    } catch (error) {
      this.fenbiChannel.appendLine(`Error navigating: ${error}`);
    }
  }

  // 向 Panel 发送消息
  public postMessage(message: any) {
    this.panel.webview.postMessage(message);
  }
}

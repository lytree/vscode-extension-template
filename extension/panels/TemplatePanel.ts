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
  private static panels: Map<string, TemplatePanel> = new Map();
  private fenbiChannel: vscode.OutputChannel;
  public isWebviewReady: boolean = false;
  public pendingParams: any = null;
  private cachedQuestionData: any = null;
  public readonly panelId: string;
  public readonly panel: vscode.WebviewPanel;
  private extensionUri: vscode.Uri;

  public static async createOrShow(extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any) {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
    const panelId = params?.id?.toString() || Date.now().toString();

    // 如果已存在该 Panel，则显示并更新参数
    const existingPanel = TemplatePanel.panels.get(panelId);
    if (existingPanel) {
      existingPanel.panel.reveal(column);
      if (params) {
        if (existingPanel.isWebviewReady) {
          existingPanel.postMessage({
            command: "panelInit",
            postData: params
          });
        } else {
          existingPanel.pendingParams = params;
        }
        if (params.name) {
          existingPanel.panel.title = params.name;
        }
      }
      return panelId;
    }

    // 如果是 /detail 路由，先获取数据
    let panelTitle = params?.name || 'Template Panel';
    let cachedQuestionData: any = null;
    if (params?.router === "/detail" || !params?.router) {
      cachedQuestionData = await TemplatePanel.fetchQuestionData(params, fenbiChannel);
      if (cachedQuestionData) {
        panelTitle = cachedQuestionData.name || params?.name || 'Panel';
      }
    }

    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', panelTitle, column, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });

    const templatePanel = new TemplatePanel(panel, extensionUri, fenbiChannel, params, cachedQuestionData, panelId);
    TemplatePanel.panels.set(panelId, templatePanel);
    return panelId;
  }

  private static async fetchQuestionData(params: any, fenbiChannel: vscode.OutputChannel): Promise<any> {
    try {
      const category = params?.category || "xingce";
      const id = params?.id;

      if (!id) return null;

      let postCombinKey = "";
      const idParams: any = { keypointId: id };
      if (category === "shenlun") {
        idParams.count = 1;
      }
      const idRes = await getExercisesId(category, idParams);
      postCombinKey = idRes.key;

      const exerciseResult = await getExercisesUrl({
        category,
        combineKey: postCombinKey,
      });

      if (exerciseResult?.code == -1) {
        fenbiChannel.appendLine(`Fetch question error: ${exerciseResult.message}`);
        return null;
      }

      const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
      const questionResult = await getQuestionService(category, staticUrl);

      const solutionResult = await getSolution(category, postCombinKey);

      questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
      questionResult["combinKey"] = postCombinKey;
      questionResult["solutions"] = solutionResult.data?.solutions || [];

      return questionResult;
    } catch (error) {
      fenbiChannel.appendLine(`Error fetching question data: ${error}`);
      return null;
    }
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any, cachedQuestionData?: any, panelId?: string) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.fenbiChannel = fenbiChannel;
    this.pendingParams = params;
    this.cachedQuestionData = cachedQuestionData;
    this.panelId = panelId || Date.now().toString();

    this.panel.webview.html = renderWebviewHtml(this.panel.webview, extensionUri, 'panel', fenbiChannel);

    this.panel.webview.onDidReceiveMessage((message: { [key: string]: any }) => {
      const { postData = {}, command = "" } = message || {};

      if (command === "panelReady") {
        this.isWebviewReady = true;
        this.fenbiChannel.appendLine(`Panel ${this.panelId} is ready`);
        if (this.pendingParams) {
          const router = this.pendingParams.router || "/detail";
          this.postMessage({
            command: `routerInit`,
            postData: {
              ...this.pendingParams,
              router
            }
          });
        }
      }
      if (command === "detailReady") {
        this.fenbiChannel.appendLine(`Panel ${this.panelId} detail page ready`);
        if (this.cachedQuestionData) {
          this.fenbiChannel.appendLine(`Sending cached question data to panel ${this.panelId}`);
          this.panel.webview.postMessage({
            command: "getQuestion",
            data: this.cachedQuestionData
          });
          this.cachedQuestionData = null;
        } else {
          this.postMessage({
            command: "detailInit",
            postData: {
              category: this.pendingParams?.category || "xingce",
              id: this.pendingParams?.id || 0,
              type: this.pendingParams?.type || 1
            }
          });
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
      TemplatePanel.panels.delete(this.panelId);
      this.fenbiChannel.appendLine(`Panel ${this.panelId} disposed, remaining panels: ${TemplatePanel.panels.size}`);
    });
  }

  // 处理 getQuestion 请求
  private async getQuestion({
    category, combineKey,
    id,
  }: { category: string; combineKey?: string; id: number }) {
    try {
      let postCombinKey = combineKey || "";

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

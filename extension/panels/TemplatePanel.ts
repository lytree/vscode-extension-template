import * as vscode from 'vscode';
import { renderWebviewHtml } from '../webview/renderWebviewHtml.js';
import {
  changeQuestionCount,
  courseSetChange,
  getCache,
  getCategories,
  getCurrent,
  getExercisesId,
  getExercisesUrl,
  getHistory,
  getQuestion,
  getQuickExercisesId,
  getSolution,
  getSolutionQuestion,
  incr,
  studyTime,
  submit,
} from "../utils/service.js";

export class TemplatePanel {

  private static instance: TemplatePanel | null = null;

  private readonly fenbiChannel: vscode.OutputChannel;
  public isWebviewReady: boolean = false;
  public pendingParams: any = null;
  private cachedQuestionData: any = null;
  public readonly panel: vscode.WebviewPanel;

  // 创建题库面板
  public static async createTikuPanel(extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any) {
    const panelParams = {
      ...params,
      router: "/detail",
      name: params?.name || "题库"
    };
    // 如果已存在 Panel，则显示提示
    if (TemplatePanel.instance) {
      vscode.window.showInformationMessage(
        "已存在一个打开的面板，请先关闭它再创建新的面板。",
        "确定"
      );
      return;
    }
    let panelTitle = params?.name || 'Template Panel';
    let cachedQuestionData = await TemplatePanel.fetchQuestionData(params, fenbiChannel);
    if (cachedQuestionData) {
      panelTitle = cachedQuestionData.name || params?.name || 'Panel';
    }
    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', panelTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });
    TemplatePanel.instance = new TemplatePanel(panel, extensionUri, fenbiChannel, panelParams, cachedQuestionData);
  }

  // 创建历史面板
  public static async createHistoryPanel(extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any) {
    const panelParams = {
      ...params,
      router: "/detail",
      name: params?.name || "练习历史"
    };
    // 如果已存在 Panel，则显示提示
    if (TemplatePanel.instance) {
      vscode.window.showInformationMessage(
        "已存在一个打开的面板，请先关闭它再创建新的面板。",
        "确定"
      );
      return;
    }

    let exerciseResult = await getExercisesUrl({
      category: panelParams.category || "xingce",
      combineKey: panelParams.combineKey
    })
    const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
    const userAnswers = exerciseResult?.data?.userAnswers;
    const questionResult = await getQuestion(panelParams.category || "xingce", staticUrl);
    questionResult["userAnswers"] = userAnswers;
    questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
    questionResult["combineKey"] = panelParams.combineKey;
    let panelTitle = params?.name || 'Template Panel';
    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', panelTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });
    TemplatePanel.instance = new TemplatePanel(panel, extensionUri, fenbiChannel, panelParams, questionResult);
  }
  public static async createHistoryAnswerPanel(extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params: any) {
    const panelParams = {
      ...params,
      router: "/detail",
      name: params?.name || "练习历史"
    };
    // 如果已存在 Panel，则显示提示
    if (TemplatePanel.instance) {
      vscode.window.showInformationMessage(
        "已存在一个打开的面板，请先关闭它再创建新的面板。",
        "确定"
      );
      return;
    }
    const exerciseResult = await TemplatePanel.fetchQuestionData(params, fenbiChannel);
    let panelTitle = params?.name || 'Template Panel';
    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', panelTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });
    TemplatePanel.instance = new TemplatePanel(panel, extensionUri, fenbiChannel, panelParams, exerciseResult);
  }
  // 创建历年面板
  public static async createPastYearsPanel(extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any) {
    const panelParams = {
      ...params,
      router: "/detail",
      name: params?.name || "历年题库"
    };    // 如果已存在 Panel，则显示提示
    // 如果已存在 Panel，则显示提示
    if (TemplatePanel.instance) {
      vscode.window.showInformationMessage(
        "已存在一个打开的面板，请先关闭它再创建新的面板。",
        "确定"
      );
      return;
    }
    let cachedQuestionData = await TemplatePanel.fetchQuestionData(params, fenbiChannel);
    let panelTitle = params?.name || 'Template Panel';
    const panel = vscode.window.createWebviewPanel('templateWebviewPanel', panelTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    });
    TemplatePanel.instance = new TemplatePanel(panel, extensionUri, fenbiChannel, panelParams, cachedQuestionData);
  }


  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, fenbiChannel: vscode.OutputChannel, params?: any, data?: any) {
    this.panel = panel;
    this.fenbiChannel = fenbiChannel;
    this.pendingParams = params;
    this.cachedQuestionData = data;

    this.panel.webview.html = renderWebviewHtml(this.panel.webview, extensionUri, 'panel', fenbiChannel);

    this.panel.webview.onDidReceiveMessage((message: { [key: string]: any }) => {
      const { postData = {}, command = "" } = message || {};

      if (command === "panelReady") {
        this.isWebviewReady = true;
        this.fenbiChannel.appendLine(`Panel is ready`);
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
        this.fenbiChannel.appendLine(`Panel detail page ready`);
        if (this.cachedQuestionData) {
          this.fenbiChannel.appendLine(`Sending cached question data to panel`);
          this.panel.webview.postMessage({
            command: "getQuestion",
            data: this.cachedQuestionData
          });
          this.cachedQuestionData = null;
        }
      }
      if (command === "answerReady") {
        this.fenbiChannel.appendLine(`Panel answer page ready`);
        if (this.cachedQuestionData) {
          this.fenbiChannel.appendLine(`Sending cached question data to panel`);
          this.panel.webview.postMessage({
            command: "getQuestion",
            data: this.cachedQuestionData
          });
          this.cachedQuestionData = null;
        }
      }
      if (this.isWebviewReady) {
        // if (command === "getQuestion") this.getQuestion(postData);
        // if (command === "getSolution") this.getSolution(postData);
        // if (command === "getQuickQuestion") this.getQuickQuestion(postData);
        if (command === "submit") this.submit(postData);
        if (command === "jumpFenbi") this.jumpFenbi(postData);
        if (command === "answer") {
          this.fenbiChannel.appendLine(`Answer received from panel: ${JSON.stringify(postData)}`);
          this.studyTime(postData);
          if (message.inc) this.inc(postData);
        }
        if (command === "closePanel") this.closePanel();
        if (command === "navigate") this.navigate(postData);
      }
    });

    this.panel.onDidDispose(() => {
      TemplatePanel.instance = null;
      this.fenbiChannel.appendLine(`Panel disposed`);
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
      const questionResult = await getQuestion(category, staticUrl);

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
      const questionResult = await getQuestion(category, staticUrl);

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
      await submit(category, combineKey);

      // 获取答案信息
      const solutionResult = await getSolution(category, combineKey);

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
      const questionResult = await getQuestion(category, staticUrl);
      this.fenbiChannel.appendLine("getSolution :staticUrl:" + JSON.stringify(questionResult));
      // 获取答案信息
      const solutionResult = await getSolution(category, postCombinKey);

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

  studyTime(params: { exerciseId: number; id: number }) {
    studyTime({
      exerciseId: params.exerciseId,
      questionId: 0,
      startTime: Date.now(),
      studyTime: 30000,
      subType: 1,
      tikuPrefix: "xingce",
    });
  }

  async inc(params: any) {
    let answer = {
      type: 201,
      choice: String(params.answer),
    } as any;
    if (params.category == "shenlun") {
      answer = {
        type: 204,
        answer: params.answer,
      };
    }
    await incr(params.category, params.combineKey, {
      answer: answer,
      key: params.globalId,
      time: Math.floor((Date.now() - params.startTime) / 1000),
    });
  }
  private static async fetchQuestionData(params: any, fenbiChannel: vscode.OutputChannel): Promise<any> {
    try {
      const category = params?.category || "xingce";
      const id = params?.id;

      if (!id) return null;

      let postCombineKey = "";
      const idParams: any = { keypointId: id };
      if (category === "shenlun") {
        idParams.count = 1;
      }
      const idRes = await getExercisesId(category, idParams);
      postCombineKey = idRes.key;

      const exerciseResult = await getExercisesUrl({
        category,
        combineKey: postCombineKey,
      });

      if (exerciseResult?.code == -1) {
        fenbiChannel.appendLine(`Fetch question error: ${exerciseResult.message}`);
        return null;
      }

      const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
      const userAnswers = exerciseResult?.data?.userAnswers;
      const questionResult = await getQuestion(category, staticUrl);

      const solutionResult = await getSolution(category, postCombineKey);
      questionResult["userAnswers"] = userAnswers;
      questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
      questionResult["combineKey"] = postCombineKey;
      questionResult["solutions"] = solutionResult.data?.solutions || [];

      return questionResult;
    } catch (error) {
      fenbiChannel.appendLine(`Error fetching question data: ${error}`);
      return null;
    }
  }

}

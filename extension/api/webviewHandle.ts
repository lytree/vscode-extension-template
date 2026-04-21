import * as vscode from "vscode";
import {
  changeQuestionCount,
  courseSetChange,
  getCache,
  getCategories,
  getCurrent,
  getExercisesId,
  getExercisesUrl,
  getHistory,
  getPapers,
  getQuestion,
  getQuickExercisesId,
  getSolution,
  getSolutionQuestion,
  getSubLabels,
  getUserHistory,
  incr,
  studyTime,
  submit,
} from "../utils/service.js";
import { TemplatePanel } from "../panels/TemplatePanel.js";

export default class WebviewHandle {
  private fenbiChannel: vscode.OutputChannel;
  private webviewPanel: vscode.WebviewView;
  private context: vscode.ExtensionContext;
  private panelParams: any = null;

  constructor(webviewPanel: vscode.WebviewView, fenbiChannel: vscode.OutputChannel, context: vscode.ExtensionContext) {
    this.fenbiChannel = fenbiChannel;
    this.webviewPanel = webviewPanel;
    this.context = context;
  }
  onDidReceiveMessage() {
    this.webviewPanel.webview.onDidReceiveMessage((message: { [key: string]: any }) => {
      const { postData = {}, command = "" } = message || {};
      this.fenbiChannel.appendLine(`WebviewHandle Received message: ${command} with data: ${JSON.stringify(postData)}`);
      if (command === "pageInit") this.pageInit(postData);
      if (command === "changeCategory") this.changeCategory(postData);
      if (command === "getQuestion") this.getQuestion(postData);
      if (command === "getSolution") this.getSolutions(postData);
      if (command === "getQuickQuestion") this.getQuickQuestion(postData);
      if (command === "submit") this.submit(postData);
      if (command === "jumpFenbi") this.jump(postData);
      if (command === "changeQuestionCount") this.changeQuestionCount(postData);
      if (command === "answer") {
        this.fenbiChannel.appendLine(`Answer submitted: ${JSON.stringify(postData)}`);
        this.studyTime(postData);
        if (message.inc) this.inc(postData);
      }
      if (command === "history") {
        this.getHistory(postData);
      }
      if (command === "papers") {
        this.getPapers(postData);
      }
      if (command === "subLabels") {
        this.getSubLabels(postData);
      }
      if (command === "openInBrowser") {
        console.log("openInBrowser", postData);
        vscode.env.openExternal(vscode.Uri.parse(postData.url));
      }
      if (command === "createPanel") {
        // 存储参数
        this.panelParams = postData;

        // 创建 Panel 并传递参数
        TemplatePanel.createOrShow(this.context.extensionUri, this.fenbiChannel, postData);
      }
    });
  }
  async getSubLabels(postData: any) {
    const res = await getSubLabels(postData);
    this.webviewPanel.webview.postMessage({
      command: "labels",
      data: res,
    });
  }
  async getPapers({
    category = "xingce",
    page = "1",
    pageSize = "15",
    labelId,
  }: { category?: string; page?: string; pageSize?: string; labelId?: string } = {}) {
    const res = await getPapers({
      category,
      page: page || "1",
      pageSize: pageSize || "15",
      labelId: labelId || undefined,
    });
    this.webviewPanel.webview.postMessage({
      command: "pastYears",
      data: res,
    });
  }

  async getHistory({
    category = "xingce",
    count,
    categoryId = 1,
    cursor = ""
  }: { category?: string; count?: number; categoryId?: number; cursor?: string } = {}) {
    const res = await getUserHistory({
      category,
      count: count || 15,
      categoryId: categoryId || undefined,
      cursor: cursor || "",
    });
    this.webviewPanel.webview.postMessage({
      command: "sendhistory",
      data: res.data,
    });
  }

  async pageInit(postData: any) {
    const cacheResult = await getCache(postData?.categoryId || "xingce");
    const res = await getCategories(postData?.categoryId || "xingce");

    const config = vscode.workspace.getConfiguration("fenbiTools");

    // 获取当前主题色
    const themeColor = this.getThemeColor();

    this.webviewPanel.webview.postMessage({
      command: "setting",
      data: config,
    });

    this.webviewPanel.webview.postMessage({
      command: "themeChange",
      data: themeColor,
    });

    this.webviewPanel.webview.postMessage({
      command: "init",
      data: {
        menu: res,
        cacheResult: cacheResult || {},
      },
    });

    this.webviewPanel.webview.postMessage({
      command: "pageCache",
      data: cacheResult,
    });

    // 监听主题变化
    this.listenForThemeChanges();
  }

  // 获取当前主题色
  private getThemeColor() {
    const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    return {
      isDark,
      theme: vscode.window.activeColorTheme.kind
    };
  }

  // 监听主题变化
  private listenForThemeChanges() {
    vscode.window.onDidChangeActiveColorTheme(() => {
      const themeColor = this.getThemeColor();
      this.webviewPanel.webview.postMessage({
        command: "themeChange",
        data: themeColor,
      });
    });
  }

  async changeCategory(postData: any) {
    console.log("🚀 ~ WebviewHandle ~ changeCategory ~ postData:", postData);
    courseSetChange({ category: postData.categoryId });
  }

  async getQuestion({
    category,
    combineKey,
    id,
  }: {
    category: string;
    combineKey?: string;
    id?: number;
  }) {
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
      this.webviewPanel.webview.postMessage({
        command: "message",
        data: { message: exerciseResult.message || "获取试题失败" },
      });
      return;
    }

    const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];
    const questionResult = await getQuestion(category, staticUrl);

    getCurrent();

    if (exerciseResult?.data?.userAnswers) {
      const userAnswers = exerciseResult?.data?.userAnswers || {};
      (questionResult?.questions || []).forEach((item: any) => {
        for (const key in userAnswers) {
          if (key == item?.globalId) {
            item["userAnswer"] = userAnswers?.[key]?.answer;
          }
        }
      });
    }

    questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
    questionResult["combinKey"] = postCombinKey;

    this.webviewPanel.webview.postMessage({
      command: "getQuestion",
      data: {
        combineKey: postCombinKey,
        ...questionResult,
      },
    });
  }

  async getQuickQuestion({
    category,
    combineKey,
  }: {
    category: string;
    combineKey?: string;
  }) {
    let postCombinKey = combineKey || "";

    if (!postCombinKey) {
      const res = await getQuickExercisesId(category);
      postCombinKey = res.key;
    }

    const exerciseResult = await getExercisesUrl({
      category,
      combineKey: postCombinKey,
    });

    if (exerciseResult?.code == -1) {
      this.webviewPanel.webview.postMessage({
        command: "message",
        data: { message: exerciseResult.message || "获取试题失败" },
      });
      return;
    }

    const staticUrl = exerciseResult?.data?.staticUrl?.urls?.[0];

    const questionResult = await getQuestion(category, staticUrl);

    getCurrent();

    if (exerciseResult?.data?.userAnswers) {
      const userAnswers = exerciseResult?.data?.userAnswers || {};
      (questionResult?.questions || []).forEach((item: any) => {
        for (const key in userAnswers) {
          if (key == item?.globalId) {
            item["userAnswer"] = userAnswers?.[key]?.answer;
          }
        }
      });
    }

    questionResult["exerciseId"] = exerciseResult?.data?.ancientExerciseId?.id;
    questionResult["combinKey"] = postCombinKey;

    this.webviewPanel.webview.postMessage({
      command: "getQuestion",
      data: {
        combineKey: postCombinKey,
        ...questionResult,
      },
    });
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

  async submit(params: { category: string; combineKey: string }) {
    try {
      const submitRes = await submit(params.category, params.combineKey);
      if (submitRes.msg == "needPayment") {
        this.webviewPanel.webview.postMessage({
          command: "message",
          data: {
            message:
              "需要自行前往粉笔官网开通vip，与本插件无关，由于无VIP，申论后续功能暂无",
          },
        });
        return;
      }

      const res = await getSolution(params.category, params.combineKey);
      const solutionRes = await getSolutionQuestion(
        res?.data?.staticUrl?.urls?.[0],
        params.category,
      );

      (solutionRes?.solutions || []).forEach((item: any) => {
        const userAnswers = res?.data?.userAnswers;
        for (const key in userAnswers) {
          if (key == item.globalId) {
            item["userAnswer"] = userAnswers[key].answer;
          }
        }
      });

      solutionRes["correctCount"] =
        (solutionRes?.solutions || []).filter((item: any) => {
          return item?.userAnswer?.choice == item?.correctAnswer?.choice;
        })?.length || 0;
      solutionRes["questionCount"] = (solutionRes?.solutions || []).length;

      this.webviewPanel.webview.postMessage({
        command: "solution",
        data: solutionRes,
      });
    } catch (error) {
      this.fenbiChannel.appendLine("🚀 ~ WebviewHandle ~ submit ~ error:" + error);
    }
  }

  async getSolutions(postData: { category: string; combineKey: string }) {
    this.fenbiChannel.appendLine("🚀 ~ WebviewHandle ~ getSolution ~ postData:" + JSON.stringify(postData));
    const res = await getSolution(postData.category, postData.combineKey);
    this.fenbiChannel.appendLine("getSolution :" + JSON.stringify(res));
    const solutionRes = await getSolutionQuestion(
      res?.data?.staticUrl?.urls?.[0],
      postData.category,
    );
    this.fenbiChannel.appendLine("getSolutionQuestion :" + JSON.stringify(solutionRes));

    (solutionRes?.solutions || []).forEach((item: any) => {
      const userAnswers = res?.data?.userAnswers;
      for (const key in userAnswers) {
        if (key == item.globalId) {
          item["userAnswer"] = userAnswers[key].answer;
        }
      }
    });

    solutionRes["correctCount"] =
      (solutionRes?.solutions || []).filter((item: any) => {
        return item?.userAnswer?.choice == item?.correctAnswer?.choice;
      })?.length || 0;
    solutionRes["questionCount"] = (solutionRes?.solutions || []).length;

    this.webviewPanel.webview.postMessage({
      command: "solution",
      data: solutionRes,
    });
  }

  jump(params: { exerciseId: number }) {
    const url = vscode.Uri.parse(
      `https://www.fenbi.com/spa/tiku/report/exam/solution/xingce/xingce/${params.exerciseId}/2`,
    );
    vscode.env.openExternal(url);
  }

  async changeQuestionCount(params: { questionCount: number }) {
    const res = await changeQuestionCount(params);

    this.webviewPanel.webview.postMessage({
      command: "message",
      data: { message: "修改成功" },
    });
  }
}
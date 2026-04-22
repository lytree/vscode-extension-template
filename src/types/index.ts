export type TQuestionItem = {
  id: number;
  content: string;
  material: number[] | null;
  type: number;
  difficulty: number;
  createdTime: number;
  shortSource: null;
  accessories: {
    options: string[];
    type: 101 | 102 | 210;
  }[];
  correctAnswer: { choice: string; type: 101 | 102 | 210 | 204 } | null;
  hasVideo: number;
  materialIndexes: number | null;
  userAnswer: { choice?: string; type: number; answer?: string };
};

export type TSolutionItem = TQuestionItem & {
  solution: string;
};

export type TCacheData = {
  combineKey: string;
  exerciseId: number;
  keypointIds: number[];
  sheetType: number;
};

export type TMaterials = {
  content: string;
};

export type TQuestionData = {
  exerciseId: number;
  questions: TQuestionItem[];
  materials: TMaterials[];
};

export type TSolutionData = TQuestionData & {
  solutions: TSolutionItem[];
  questionCount: number;
  correctCount: number;
};

export type TSetting = {
  color: string;
  backgroundColor: string;
  fontSize?: number;
};

export type TLabelMeta = {
  id: number;
  paperCount: number;
  difficulty: number;
  paperIds: number[];
};

export type TLabel = {
  id: number;
  name: string;
  labelMeta: TLabelMeta;
  examType: number;
  childrenLabels: any;
};

export type TLabelsData = TLabel[];

// 考试类型配置
export const EXAM_TYPES = [
  { value: "xingce", label: "行测" },
  { value: "shenlun", label: "申论" },
] as const;

// 考试类型值
export type ExamType = (typeof EXAM_TYPES)[number]["value"];

// 历年题库数据结构类型
export interface PastYearItem {
  combineKey: string;
  id: number;
  name: string;
  date: string;
  status: number;
  createdTime: number;
  type: number;
  newPaper: boolean;
  topic: any;
  paperMeta: {
    id: number;
    exerciseCount: number;
    averageScore: number;
    difficulty: number;
    highestScore: number;
  };
  exercise: any;
  hasVideo: number;
  encodeCheckInfo: string;
  [key: string]: any;
}

// 分类数据结构类型
export interface CategoryItem {
  id: number;
  name: string;
  count: number;
  optional: boolean;
  children: CategoryItem[] | null;
  [key: string]: any;
}

// 最后答题记录
export interface TLastAnswerRecord {
  lastCount: number | null;
  lastAnswer: number | null;
  lastQuestionId: number | null | undefined;
}

// 主题设置
export interface TTheme {
  isDark: boolean;
  theme: number;
}

// 选项映射
export interface TRadioMap {
  [key: string]: string;
}
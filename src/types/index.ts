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
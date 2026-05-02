import * as React from "react";
import type { TMaterials, TSolutionItem, TUserAnswerItem } from "../../types";
import { radioMap } from "../../view/utils/constant";
import { setImg } from "../../view/utils/setImg";
import { OptionGroup } from "@/components/ui/option-group";

interface TQuestionItemProps {
  data: TSolutionItem;
  materials?: TMaterials[];
  materialIndex?: number;
  userAnswer?: TUserAnswerItem;
  questionIndex: number;
  onChange: (e: any, item: TSolutionItem, index: number) => void;
  disabled?: boolean;
  isCorrect?: boolean;
  showSolution?: boolean;
}

export const QuestionItem = (props: TQuestionItemProps) => {
  const {
    data: ele,
    materials = [],
    materialIndex = 0,
    userAnswer,
    questionIndex,
    onChange,
    disabled = false,
    isCorrect = true,
    showSolution = true,
  } = props;

  const [selectedAnswer, setSelectedAnswer] = React.useState<string | undefined>(() => {
    if (userAnswer && userAnswer.answer) {
      return userAnswer.answer.choice?.toString();
    }
    return undefined;
  });

  const getCurrentAnswer = () => {
    if (selectedAnswer !== undefined) {
      return selectedAnswer;
    }

    if (userAnswer && userAnswer.answer) {
      return userAnswer.answer.choice?.toString();
    }

    return ele?.userAnswer?.choice ? ele.userAnswer.choice.toString() : undefined;
  };

  const currentAnswer = getCurrentAnswer();

  const handleValueChange = (value: string) => {
    if (disabled && showSolution) return;
    setSelectedAnswer(value);
    const event = { target: { value: Number(value) } } as any;
    onChange(event, ele, questionIndex);
  };

  const typeName = ele.type === 1 ? "单选题" : ele.type === 2 ? "多选题" : "判断题";

  const containerClass = showSolution
    ? `ti-container ${isCorrect ? "correct" : "wrong"} showBg`
    : "ti-container";

  return (
    <div className={containerClass}>
      <div className="ti-title">
        <div className="ti-title-left">
          <span className="ti-title-index">{questionIndex + 1}.</span>
          {showSolution ? (
            <span className={`ti-title-type-name ${isCorrect ? "correct" : "wrong"}`}>{typeName}</span>
          ) : (
            <span className="ti-title-type-name neutral">{typeName}</span>
          )}
        </div>
      </div>

      <div className="ti-content">
        {materialIndex > 0 && materials?.length > 0 && (
          <div
            className="ti-material"
            dangerouslySetInnerHTML={{
              __html: setImg(materials?.[materialIndex]?.content),
            }}
          />
        )}

        <div
          className="ti-question-content"
          dangerouslySetInnerHTML={{
            __html: setImg(ele.content),
          }}
        />

        <div className="ti-options">
          {(ele.accessories || []).map((access: any, ind: number) => {
            const options = (access?.options || []).map((option: any, index2: number) => ({
              label: setImg(option),
              value: index2.toString(),
            }));

            return (
              <div key={ind}>
                <OptionGroup
                  type="radio"
                  value={currentAnswer}
                  onValueChange={handleValueChange}
                  options={options}
                  className="space-y-3"
                  optionClassName="relative"
                  correctAnswer={showSolution ? ele?.correctAnswer?.choice?.toString() : undefined}
                  showResult={showSolution}
                />
              </div>
            );
          })}
        </div>

        {showSolution && ele?.solution && (
          <div className="solution-choice-container">
            <div className="solution-overall">
              <div className="solution-overall-row">
                <span className={`solution-overall-label ${currentAnswer !== undefined ? (isCorrect ? "correct" : "wrong") : ""}`}>
                  你的答案：{currentAnswer !== undefined ? radioMap[Number(currentAnswer) + 1] : "未作答"}
                </span>
                <span className="solution-overall-label correct">
                  正确答案：{radioMap[Number(ele?.correctAnswer?.choice) + 1]}
                </span>
              </div>
            </div>

            <div className="result-common-container">
              {ele.solution && (
                <section className="result-common-section">
                  <div className="solution-title-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" className="solution-title-icon">
                      <path transform="matrix(1 0 0 1 0.5 2)" d="M5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0Z" fillRule="nonzero" className="solution-title-icon-1" />
                      <path transform="matrix(1 0 0 1 7.50005 2)" d="M5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0Z" fillRule="nonzero" className="solution-title-icon-2" />
                    </svg>
                    <div className="solution-title-text">解析</div>
                  </div>
                  <div
                    className="solution-content"
                    dangerouslySetInnerHTML={{
                      __html: setImg(ele.solution),
                    }}
                  />
                </section>
              )}

              {ele.keypoints && ele.keypoints.length > 0 && (
                <section className="result-common-section">
                  <div className="solution-title-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" className="solution-title-icon">
                      <path transform="matrix(1 0 0 1 0.5 2)" d="M5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0Z" fillRule="nonzero" className="solution-title-icon-1" />
                      <path transform="matrix(1 0 0 1 7.50005 2)" d="M5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0Z" fillRule="nonzero" className="solution-title-icon-2" />
                    </svg>
                    <div className="solution-title-text">考点</div>
                  </div>
                  <div className="solution-keypoints">
                    {ele.keypoints.map((kp: any, i: number) => (
                      <span key={i} className="keypoint-tag">
                        {kp.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {ele.source && (
                <section className="result-common-section">
                  <div className="solution-title-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" className="solution-title-icon">
                      <path transform="matrix(1 0 0 1 0.5 2)" d="M5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0Z" fillRule="nonzero" className="solution-title-icon-1" />
                      <path transform="matrix(1 0 0 1 7.50005 2)" d="M5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0Z" fillRule="nonzero" className="solution-title-icon-2" />
                    </svg>
                    <div className="solution-title-text">来源</div>
                  </div>
                  <div className="solution-source">{ele.source}</div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

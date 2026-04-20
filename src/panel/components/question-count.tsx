import * as React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const QuestionCount = (props: {
  onChange?: ((e: number) => void) | undefined;
}) => {
  const { onChange } = props;
  const [open, setOpen] = React.useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = React.useState<number>(-1);

  const onRaioChange = (value: number) => {
    console.log("onRaioChange ~ value:", value);
    setCurrentIndex(value);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onSubmit = () => {
    console.log("🚀 ~ currentIndex:", currentIndex);
    if (currentIndex > -1) {
      onChange && onChange(currentIndex);
      onCancel();
    }
  };

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        设置每组出题数量
      </Button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">设置</h3>
            <div className="mb-4">
              <p className="mb-4">可设置每组出题数量（ps: 不查询之前设置）</p>
              <RadioGroup
                value={currentIndex}
                onValueChange={onRaioChange}
                className="flex flex-wrap gap-2"
              >
                {[5, 10, 15, 20, 25, 30, 35, 40].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`radio-${value}`} />
                    <Label htmlFor={`radio-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onCancel}>
                取消
              </Button>
              <Button variant="secondary" onClick={onSubmit}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
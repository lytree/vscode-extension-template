import * as React from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

export const HistoryCard = (props: {
  onClick?: () => void | undefined;
  data: any[];
  goExercise: (data: any) => void;
}) => {
  const { onClick, data, goExercise } = props;

  const _data = data.find((item) => item.status == 0 && item.sheet?.type == 3);

  return (
    <div className="border border-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <span>练习历史</span>
        <Button
          variant="secondary"
          onClick={onClick}
        >
          全部（最近15条）
        </Button>
      </div>
      {_data?.status == 0 && _data?.sheet?.type == 3 ? (
        <div className="space-y-2">
          <p>{_data?.sheet?.name}</p>
          <p>创建时间：{dayjs(_data?.createTime).format("YYYY-MM-DD")}</p>
          <Button
            variant="secondary"
            onClick={() => {
              if (_data?.status == 1) return;
              goExercise(_data);
            }}
            disabled={_data?.status == 1}
          >
            {_data?.status == 1 ? "已完成" : "继续做题"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
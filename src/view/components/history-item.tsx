import * as React from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HistoryItem = (props: {
  data: any;
  goExercise: (data: any) => void;
}) => {
  const { data, goExercise } = props;

  // const navigate = useNavigate();

  return (
    <div className="border border-white rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <p>{data?.sheet?.name}</p>
          <p>{data?.sheet?.type == 1 ? "试卷" : "练习"}</p>
          <p>创建时间：{dayjs(data?.createTime).format("YYYY-MM-DD")}</p>
          <p>
            共{data?.questionCount}题,答对：{data?.correctCount}题
          </p>
        </div>
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              if (data?.status == 1) {
                // navigate("/answer", {
                //   state: {
                //     id: data?.id,
                //     combineKey: data?.key,
                //     type: data?.sheet?.type,
                //   },
                // });

                return;
              }
              goExercise(data);
            }}
          >
            {data?.status == 1 ? "已完成" : "继续做题"}
          </Button>
        </div>
      </div>
    </div>
  );
};
import { Button, Flex } from "antd";
import * as React from "react";

export const modifyArrayToTree = (
  arr: any[],
  cacheResult: any = {},
  callback?: (item: any, cacheKey: any[]) => void,
  level = 1
) => {
  return arr.map((item) => {
    const isContinue = cacheResult?.keypointIds?.includes(item.id);

    const actionBtn = (
      <Button
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          callback && callback(item, cacheResult);
        }}
      >
        {isContinue ? "继续练习" : "去练习"}
      </Button>
    );

    const title = (
      <div>
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <span>
            {item.name} ({item.answerCount}/{item.count})
          </span>
          {actionBtn}
        </Flex>
      </div>
    );

    const node: any = {
      title,
      key: item.id,
    };

    if (item.children?.length) {
      node.children = modifyArrayToTree(
        item.children,
        cacheResult,
        callback,
        level + 1
      );
    }

    return node;
  });
};
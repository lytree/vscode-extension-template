export const groupByMaterialIndexesTo2DArray = (dataArray: any[]): any[] => {
  const groups = dataArray.reduce((acc, item) => {
    const key =
      item.materialIndexes && item.materialIndexes.length > 0
        ? item.materialIndexes.join(",")
        : "noIndexes";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);

    return acc;
  }, {});

  return Object.values(groups);
};
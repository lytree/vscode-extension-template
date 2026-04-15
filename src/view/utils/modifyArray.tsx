export const modifyArrayToTree = (array: any[], parentId: number = 0, treeClick: (e: any, cacheResult: any) => void): any[] => {
  return array
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: modifyArrayToTree(array, item.id),
    }));
};
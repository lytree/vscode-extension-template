export const modifyArrayToTree = (array: any[], parentId: number = 0): any[] => {
  return array
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: modifyArrayToTree(array, item.id),
    }));
};
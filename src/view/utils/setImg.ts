export const setImg = (str: string) => {
  if (!str) return str;
  let _str = str.replace(
    /(<img[^>]+src=\")([^"]+)/g,
    function (match: any, p1: string, p2: string) {
      if (p2.startsWith("https:")) {
        return p1 + p2;
      }
      return p1 + "https:" + p2;
    }
  );

  _str = _str.replace(/\swidth\s*=\s*(['"])[^'"]*\1/gi, "");

  _str = _str.replace(/\sheight\s*=\s*(['"])[^'"]*\1/gi, "");
  // console.log(_str);  
  return _str;
};
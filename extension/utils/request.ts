import * as vscode from "vscode";
import https from "https";

const isJSON = (data: any) => {
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
};

const ajax = (
  methods: "POST" | "GET" | "FORM" | "PUT" | "DELETE",
  url: string,
  params?: any,
  headers?: any,
) => {
  const parsedUrl = new URL(url);
  const config = vscode.workspace.getConfiguration("fenbiTools");

  // if (!config.cookie) {

  //   vscode.window.showErrorMessage("未设置 cookie");
  //   return;
  // }
  var cookie = "sid=1091892; persistent=xhii2IRyvzCMthYlpZ2VSZtngnP1fcfZBUv2RzFPoLfEp2sE9Drzdbmj9ZLAoehogi7ItdU+bigbczdMgD3UXw==; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22137073055%22%2C%22first_id%22%3A%221969b0ea2fdb04-0b911e8d2b31838-4c657b58-1821369-1969b0ea2fe12b4%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTk2OWFmMjMzMzRhMjQtMGY3ZmY3MDI5OTNmYjM4LTRjNjU3YjU4LTE4MjEzNjktMTk2OWFmMjMzMzUxMDhjIiwiJGlkZW50aXR5X2xvZ2luX2lkIjoiMTM3MDczMDU1In0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22137073055%22%7D%2C%22%24device_id%22%3A%221969af23334a24-0f7ff702993fb38-4c657b58-1821369-1969af23335108c%22%7D; _ga=GA1.2.1180452880.1772464951; _ga_Z92YWZPKSM=GS2.2.s1772464952$o1$g0$t1772464952$j60$l0$h0; Hm_lvt_e7351028cde0d0ccb9ccdbe5fe531683=1772464961; sess=OfhzXfqx6CB7Kf6LXCQ+zzzkHap04hvmwSAcsP8W9bz7LmnpYQauZ9apQu2zdNP8kGOqC/kECtYzb+6I0yg7DXZDOZ0Bky10K7M8FKjigYE=; userid=137073055; acw_tc=2f5ecd9817763026328844284e83e918c8b84165d43ad549d3569f2cb9a87b";
  const options = {
    method: "GET",
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Cookie: cookie,
      ...headers,
    },
  };
  if (methods) options.method = methods == "FORM" ? "POST" : methods;
  return new Promise<any>((resolve, reject) => {
    const req = https.request(options, (res: any) => {
      let data = "";
      res.on("data", (chunk: string) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const result = isJSON(data) ? JSON.parse(data) : data;
          resolve(result);
        } catch (err) {
          console.error(err);
          vscode.window.showErrorMessage(`${err}`);
        }
      });
    });

    req.on("error", (error: any) => {
      reject(error);
      vscode.window.showErrorMessage(`${error}`);
    });

    if (methods === "POST" || methods === "PUT") {
      const body = JSON.stringify(params);
      req.setHeader("Content-Length", Buffer.byteLength(body));
      req.write(body);
    }
    if (methods === "FORM") {
      const body = toUrlEncoded(params);
      req.setHeader("Content-Length", Buffer.byteLength(body));
      req.write(body);
    }
    req.end();
  });
};

const toUrlEncoded = (obj: any) => {
  return Object.keys(obj)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    .join("&");
};

export default ajax;
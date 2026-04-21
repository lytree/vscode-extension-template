import * as React from "react";
import type { TCacheData, TSetting } from "../../types";
import { getVscodeApi } from "../utils/vscodeApi";
import { Button } from "../../components/ui/button";

const vscode = getVscodeApi();

// 历年题库数据结构类型
interface PastYearItem {
  id: number;
  year: number;
  name: string;
  subject: string;
  difficulty: number;
  [key: string]: any;
}

// 地区数据
const regions = [
  "推荐", "国考", "国考模拟题", "省考模拟题", "安徽", "北京", "福建", "甘肃", "广东", "广西",
  "贵州", "海南", "河北", "河南", "黑龙江", "湖北", "湖南", "吉林", "江苏", "江西",
  "辽宁", "内蒙古", "宁夏", "青海", "山东", "山西", "陕西", "上海", "四川", "天津",
  "西藏", "新疆", "云南", "浙江", "重庆", "深圳市考", "广州市考", "政法干警", "选调"
];

const PastYears = () => {
  const [loading, setLoading] = React.useState(true);
  const [pastYears, setPastYears] = React.useState<PastYearItem[]>([]);
  const [cacheData, setCacheData] = React.useState<TCacheData>();
  const [selectedRegion, setSelectedRegion] = React.useState("推荐");

  React.useEffect(() => {
    // 监听来自扩展的消息
    const handleMessage = (event: any) => {
      const message = event.data;

      if (message.command === "pastYears") {
        // 使用从扩展获取的历年题库数据
        setPastYears(message.data || []);
        setCacheData(message.data.cacheResult);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // 初始化时请求数据
    vscode.postMessage({ command: "pastYears" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleYearClick = (item: PastYearItem) => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "createPanel",
      postData: {
        id: item.id,
        year: item.year,
        name: item.name,
        subject: item.subject,
        type: 3,
        router: "/pastYearDetail",
      }
    });
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // 这里可以根据选中的地区过滤数据
    // 暂时使用模拟数据
  };

  // 模拟数据
  const mockData: PastYearItem[] = [
    { id: 1, year: 2026, name: "河南省公务员录用考试", subject: "行测", difficulty: 4.4 },
    { id: 2, year: 2025, name: "河南省公务员录用考试", subject: "行测", difficulty: 4.4 },
    { id: 3, year: 2024, name: "河南省公务员录用考试", subject: "行测", difficulty: 4.5 },
    { id: 4, year: 2023, name: "河南省公务员录用考试", subject: "行测", difficulty: 4.5 },
    { id: 5, year: 2022, name: "河南省公务员录用考试", subject: "行测", difficulty: 4.4 },
    { id: 6, year: 2021, name: "河南省公务员录用考试", subject: "行测", difficulty: 4.6 },
    { id: 7, year: 2020, name: "河南省公务员考试", subject: "行测", difficulty: 4.5 },
    { id: 8, year: 2019, name: "河南省公务员考试", subject: "行测", difficulty: 4.5 },
  ];

  return (
    <div className="h-full rounded-lg shadow-sm">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-sm text-muted-foreground">加载历年题库中...</div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* 标题栏 */}
          <div className="p-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">历年题库</span>
              <div className="bg-primary/80 p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
          </div>

          {/* 地区选择栏 */}
          <div className="px-3 py-2 border-b border-border overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {regions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleRegionChange(region)}
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>

          {/* 题目数量统计 */}
          <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
            共{mockData.length}套
          </div>

          {/* 历年题库列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {mockData.map((item) => (
                <div 
                  key={item.id} 
                  className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleYearClick(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground font-medium">
                        {item.year}年{item.name}《{item.subject}》题（网友回忆版）
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        难度{item.difficulty}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastYears;

import * as React from "react";
import type { TLabelsData, TSetting } from "../../types";
import { getVscodeApi } from "../utils/vscodeApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const vscode = getVscodeApi();

// 考试类型
type ExamType = "shenlun" | "xingce";

// 历年题库数据结构类型
interface PastYearItem {
  combineKey: string;
  id: number;
  name: string;
  date: string;
  status: number;
  createdTime: number;
  type: number;
  newPaper: boolean;
  topic: any;
  paperMeta: {
    id: number;
    exerciseCount: number;
    averageScore: number;
    difficulty: number;
    highestScore: number;
  };
  exercise: any;
  hasVideo: number;
  encodeCheckInfo: string;
  [key: string]: any;
}



const PastYears = ({ labelId }: { labelId?: string }) => {
  const [loading, setLoading] = React.useState(true);
  const [pastYears, setPastYears] = React.useState<PastYearItem[]>([]);
  const [cacheData, setCacheData] = React.useState<TLabelsData>();
  const [selectedRegion, setSelectedRegion] = React.useState(1);
  const [examType, setExamType] = React.useState<ExamType>("xingce");
  const [currentLabelId, setCurrentLabelId] = React.useState<string>(labelId || "1");

  // 分页状态
  const [currentPage, setCurrentPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(15);
  const [totalItems, setTotalItems] = React.useState(0);


  React.useEffect(() => {
    setLoading(true);
    vscode.postMessage({
      command: "papers",
      postData: {
        labelId: currentLabelId,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      },
    });
  }, [currentLabelId, currentPage, pageSize]);
  React.useEffect(() => {
    vscode.postMessage({
      command: "subLabels",
      postData: {
      },
    });
  }, []);
  React.useEffect(() => {
    // 监听来自扩展的消息
    const handleMessage = (event: any) => {
      const message = event.data;
      if (message.command === "pastYears") {
        // 使用从扩展获取的历年题库数据
        console.log("pastYears", message);
        setPastYears(message.data.list || []);
        setTotalItems(message.data.pageInfo?.totalItem || 0);
        setCurrentPage(message.data.pageInfo?.currentPage || 0);
        setLoading(false);
      }
      if (message.command === "labels") {

        setCacheData(message.data || {});
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleYearClick = (item: PastYearItem) => {
    // 从名称中提取年份
    const yearMatch = item.name.match(/(\d{4})年/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 0;

    // 从名称中提取科目
    const subjectMatch = item.name.match(/《(.*?)》/);
    const subject = subjectMatch ? subjectMatch[1] : "";

    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "createPanel",
      postData: {
        id: item.id,
        combineKey: item.combineKey,
        year: year,
        name: item.name,
        subject: subject,
        type: 3,
        examType: examType,
        router: "/pastYearDetail",
      }
    });
  };

  const handleRegionChange = (region: number) => {
    setSelectedRegion(region);
    setCurrentLabelId(region.toString());
    // 这里可以根据选中的地区过滤数据
    // 暂时使用模拟数据
  };


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
            <Select value={examType} onValueChange={(value: ExamType) => setExamType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shenlun">申论</SelectItem>
                <SelectItem value="xingce">行测</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* 地区选择栏 */}
          <div className="px-3 py-2 border-b border-border overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {cacheData?.map((region) => (
                <button
                  key={region.id}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${selectedRegion === region.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  onClick={() => handleRegionChange(region.id)}
                >
                  {region.name}
                </button>
              )) || (
                  <div className="text-sm text-muted-foreground">加载地区数据中...</div>
                )}
            </div>
          </div>

          {/* 题目数量统计 */}
          <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
            {(() => {
              const currentRegion = cacheData?.find(r => r.id === selectedRegion);
              return currentRegion ? `共${currentRegion.labelMeta.paperCount}套` : `共${pastYears.length}套`;
            })()}
          </div>

          {/* 历年题库列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {pastYears.map((item) => (
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
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                        <span>日期: {item.date}</span>
                        <span>难度: {item.paperMeta.difficulty}</span>
                        <span>平均分: {item.paperMeta.averageScore.toFixed(2)}</span>
                        <span>练习人数: {item.paperMeta.exerciseCount}</span>
                        {item.hasVideo === 1 && <span className="text-blue-500">有视频解析</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 分页组件 */}
          <div className="p-3 border-t border-border flex justify-center items-center gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage === 1 ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <span className="text-sm text-muted-foreground">
              第 {currentPage + 1} 页，共 {Math.ceil(totalItems / pageSize)} 页
            </span>
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage >= Math.ceil(totalItems / pageSize) ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(totalItems / pageSize)}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastYears;

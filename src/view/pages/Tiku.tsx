import * as React from "react";
import type { TCacheData, TSetting } from "../../types";
import { getVscodeApi } from "../utils/vscodeApi";
import { Button } from "../../components/ui/button";

const vscode = getVscodeApi();

// 分类数据结构类型
interface CategoryItem {
  id: number;
  name: string;
  count: number;
  optional: boolean;
  children: CategoryItem[] | null;
  [key: string]: any;
}

// 可折叠导航项组件
const CollapsibleNavItem: React.FC<{
  item: CategoryItem;
  level: number;
  onItemClick: (item: CategoryItem) => void;
}> = ({ item, level, onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="w-full">
      <div
        className={`flex items-center justify-between p-2 hover:bg-muted transition-colors ${level > 0 ? `pl-${level * 4}` : ''}`}
      >
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => {
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            } else {
              onItemClick(item);
            }
          }}
        >
          {hasChildren && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
          <span className="flex-1 text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.count}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onItemClick(item);
          }}
        >
          去练习
        </Button>
      </div>

      {hasChildren && isExpanded && (
        <div className="w-full">
          {item.children?.map((child) => (
            <CollapsibleNavItem
              key={child.id}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Tiku = () => {
  const [loading, setLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [cacheData, setCacheData] = React.useState<TCacheData>();

  React.useEffect(() => {
    // 监听来自扩展的消息
    const handleMessage = (event: any) => {
      const message = event.data;

      if (message.command === "init") {
        // 使用从扩展获取的分类数据
        setCategories(message.data.menu || []);
        setCacheData(message.data.cacheResult);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // 初始化时请求数据
    vscode.postMessage({ command: "pageInit" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleCategoryClick = (item: CategoryItem) => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "createPanel",
      postData: {
        id: item.id,
        name: item.name,
        type: 1,
        router: "/detail",
      }
    });
  };

  const handleCustomPractice = () => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "createPanel",
      postData: {
        type: 2,
        router: "/detail",
      }
    });
  };

  return (
    <div className="h-full rounded-lg shadow-sm">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-sm text-muted-foreground">Index loading...</div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* 标题栏 */}
          <div className="  p-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">专项练习</span>
              <div className="bg-primary/80 p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCustomPractice}
            >
              自定义刷题
            </Button>
          </div>

          {/* 分类列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-border last:border-b-0">
                  <CollapsibleNavItem
                    item={category}
                    level={0}
                    onItemClick={handleCategoryClick}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tiku;

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function CustomTree({ treeData }: { treeData: any[] }) {
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderTreeNode = (node: any, level: number = 0) => {
    const isExpanded = expandedKeys.has(String(node.key));
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.key} style={{ marginLeft: level * 16 }}>
        <Collapsible
          open={isExpanded}
          onOpenChange={() => hasChildren && toggleExpand(String(node.key))}
        >
          <div className="flex items-center justify-between py-1">
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center gap-2 text-left hover:bg-gray-100 rounded px-2 py-1 w-full"
                disabled={!hasChildren}
              >
                {hasChildren && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                )}
                {!hasChildren && <span className="w-4" />}
                <span className="flex-1">{node.title}</span>
              </button>
            </CollapsibleTrigger>
          </div>
          {hasChildren && (
            <CollapsibleContent className="pl-2">
              {node.children.map((child: any) => renderTreeNode(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };

  return (
    <div style={{ minWidth: 256, maxWidth: 300 }}>
      {treeData.map((node) => renderTreeNode(node))}
    </div>
  );
}
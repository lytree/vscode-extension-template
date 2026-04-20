"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Button } from "@/components/ui/button"

import { cn } from "@/components/lib/utils"

interface OptionGroupProps {
  type: "radio" | "checkbox"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  options: {
    label: string
    value: string
  }[]
  className?: string
  optionClassName?: string
  showExclude?: boolean
  onExcludeChange?: (excludedMap: Record<string, boolean>) => void
  initialExcludedMap?: Record<string, boolean>
}

/**
 * OptionGroup 组件使用说明：
 * 1. 持久状态管理：通过 value 和 onValueChange 实现持久状态
 *    - 父组件需要存储选中值并通过 value 传入
 *    - 当用户选择选项时，onValueChange 会被调用，父组件需要更新存储的选中值
 * 2. 单选模式 (type="radio")：
 *    - value 为字符串类型，对应选中选项的 value
 *    - 只允许一个选项被选中
 * 3. 多选模式 (type="checkbox")：
 *    - value 为字符串数组类型，包含所有选中选项的 value
 *    - 允许多个选项被选中
 */

function OptionGroup({ 
  type, 
  value, 
  onValueChange, 
  options, 
  className, 
  optionClassName,
  showExclude = false,
  onExcludeChange,
  initialExcludedMap = {}
}: OptionGroupProps) {
  const [excludedMap, setExcludedMap] = React.useState<Record<string, boolean>>(initialExcludedMap);
  
  // 使用 useRef 存储定时器字典，避免触发不必要的渲染
  // 在 Webview/浏览器环境下，使用 window.setTimeout 的返回类型 number
  const timers = React.useRef<Record<string, number>>({});

  const handleRadioChange = (newValue: string) => {
    onValueChange?.(newValue)
  }

  const handleCheckboxChange = (optionValue: string) => {
    if (Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
      onValueChange?.(newValue)
    } else {
      onValueChange?.([optionValue])
    }
  }

  const handleExcludeToggle = (optionValue: string) => {
    const newExcludedMap = {
      ...excludedMap,
      [optionValue]: !excludedMap[optionValue]
    };
    setExcludedMap(newExcludedMap);
    onExcludeChange?.(newExcludedMap);
  }

  const isChecked = (optionValue: string) => {
    if (type === "radio") {
      return value === optionValue
    } else {
      return Array.isArray(value) && value.includes(optionValue)
    }
  }

  const isExcluded = (optionValue: string) => {
    return excludedMap[optionValue] || false
  }

  // 生成选项标签：A, B, C, D...
  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index)
  }

  const stopPress = (id: string) => {
    // 如果手指/鼠标抬起时，定时器还在运行，说明长按未达标，直接清除
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  const handleLongPressAction = (id: string) => {
    // 触发排除操作
    handleExcludeToggle(id);
  };

  const startPress = (id: string) => {
    // 1. 如果已有定时器，先清除（防止重复触发）
    stopPress(id);

    // 2. 开启长按定时器（800ms）
    timers.current[id] = window.setTimeout(() => {
      console.log(`项目 ${id} 触发长按逻辑`);
      // 触发长按操作
      handleLongPressAction(id);
      
      // 触发后清理 ID
      delete timers.current[id];
    }, 800);
  };

  if (type === "radio") {
    return (
      <RadioGroupPrimitive
        value={value as string}
        onValueChange={handleRadioChange}
        className={cn("space-y-2", className)}
      >
        {options.map((option, index) => {
          const excluded = isExcluded(option.value);
          const checked = isChecked(option.value);
          
          return (
            <div
              key={option.value}
              className={cn(
                "flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                excluded && "opacity-50",
                checked && "border-primary bg-primary/10 shadow-sm",
                optionClassName
              )}
              onMouseDown={() => startPress(option.value)}
              onMouseUp={() => stopPress(option.value)}
              onMouseLeave={() => stopPress(option.value)}
              onTouchStart={() => startPress(option.value)}
              onTouchEnd={() => stopPress(option.value)}
              onClick={() => handleRadioChange(option.value)}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border font-medium",
                  checked ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-primary text-primary"
                )}>
                  {getOptionLabel(index)}
                </div>
                <span 
                  className={cn(
                    "flex-1",
                    excluded && "line-through",
                    checked && "text-primary font-medium"
                  )}
                >
                  {option.label}
                </span>
              </div>
              <input
                type="radio"
                name="option"
                value={option.value}
                checked={checked}
                onChange={() => handleRadioChange(option.value)}
                className="sr-only"
              />
              {checked && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
              {showExclude && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    handleExcludeToggle(option.value);
                  }}
                >
                  {excluded ? "重置" : "排除"}
                </Button>
              )}
            </div>
          );
        })}
      </RadioGroupPrimitive>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option, index) => {
        const excluded = isExcluded(option.value);
        const checked = isChecked(option.value);
        
        return (
          <div
            key={option.value}
            className={cn(
              "flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
              excluded && "opacity-50",
              checked && "border-primary bg-primary/10 shadow-sm",
              optionClassName
            )}
            onMouseDown={() => startPress(option.value)}
            onMouseUp={() => stopPress(option.value)}
            onMouseLeave={() => stopPress(option.value)}
            onTouchStart={() => startPress(option.value)}
            onTouchEnd={() => stopPress(option.value)}
            onClick={() => handleCheckboxChange(option.value)}
          >
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border font-medium",
                checked ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-primary text-primary"
              )}>
                {getOptionLabel(index)}
              </div>
              <span 
                className={cn(
                  "flex-1",
                  excluded && "line-through",
                  checked && "text-primary font-medium"
                )}
              >
                {option.label}
              </span>
            </div>
            <CheckboxPrimitive.Root
              checked={checked}
              onCheckedChange={() => handleCheckboxChange(option.value)}
              className={cn(
                "peer h-5 w-5 shrink-0 rounded border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground shadow-sm"
              )}
            >
              <CheckboxPrimitive.Indicator className="flex items-center justify-center">
                <svg
                  width="12"
                  height="10"
                  viewBox="0 0 12 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5 1.5L4.5 7.5L1.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
            {showExclude && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡
                  handleExcludeToggle(option.value);
                }}
              >
                {excluded ? "重置" : "排除"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  )
}

export { OptionGroup }

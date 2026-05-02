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
  correctAnswer?: string
  showResult?: boolean
}

function OptionGroup({
  type,
  value,
  onValueChange,
  options,
  className,
  optionClassName,
  showExclude = false,
  onExcludeChange,
  initialExcludedMap = {},
  correctAnswer,
  showResult = false
}: OptionGroupProps) {
  const [excludedMap, setExcludedMap] = React.useState<Record<string, boolean>>(initialExcludedMap);

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

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index)
  }

  const isCorrectOption = (optionValue: string) => {
    return showResult && correctAnswer !== undefined && optionValue === correctAnswer
  }

  const isWrongOption = (optionValue: string) => {
    return showResult && isChecked(optionValue) && correctAnswer !== undefined && optionValue !== correctAnswer
  }

  const stopPress = (id: string) => {
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  const handleLongPressAction = (id: string) => {
    handleExcludeToggle(id);
  };

  const startPress = (id: string) => {
    stopPress(id);
    timers.current[id] = window.setTimeout(() => {
      handleLongPressAction(id);
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
          const correct = isCorrectOption(option.value);
          const wrong = isWrongOption(option.value);

          return (
            <div
              key={option.value}
              className={cn(
                "option-item",
                excluded && "option-excluded",
                checked && !showResult && "option-selected",
                correct && "option-correct",
                wrong && "option-wrong",
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
                  "option-label-circle",
                  correct && "option-label-correct",
                  wrong && "option-label-wrong",
                  checked && !showResult && "option-label-selected",
                  !checked && !correct && !wrong && "option-label-default"
                )}>
                  {correct ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : wrong ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    getOptionLabel(index)
                  )}
                </div>
                <span
                  className={cn(
                    "flex-1 option-text",
                    excluded && "line-through",
                    correct && "option-text-correct",
                    wrong && "option-text-wrong"
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
              {showExclude && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
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
        const correct = isCorrectOption(option.value);
        const wrong = isWrongOption(option.value);

        return (
          <div
            key={option.value}
            className={cn(
              "option-item",
              excluded && "option-excluded",
              checked && !showResult && "option-selected",
              correct && "option-correct",
              wrong && "option-wrong",
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
                "option-label-circle",
                correct && "option-label-correct",
                wrong && "option-label-wrong",
                checked && !showResult && "option-label-selected",
                !checked && !correct && !wrong && "option-label-default"
              )}>
                {correct ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : wrong ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  getOptionLabel(index)
                )}
              </div>
              <span
                className={cn(
                  "flex-1 option-text",
                  excluded && "line-through",
                  correct && "option-text-correct",
                  wrong && "option-text-wrong"
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
                  e.stopPropagation();
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

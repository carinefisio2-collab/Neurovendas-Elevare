import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "./textarea"

interface TextareaWithCounterProps extends React.ComponentProps<"textarea"> {
  maxLength?: number;
  showCounter?: boolean;
  warningThreshold?: number; // Percentage (0-100) at which to show warning color
}

const TextareaWithCounter = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithCounterProps
>(({ className, maxLength, showCounter = true, warningThreshold = 80, value, onChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(value?.toString() || "");
  
  // Sync with external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // If maxLength is set and value exceeds it, don't update
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    setInternalValue(newValue);
    onChange?.(e);
  };

  const currentLength = internalValue.length;
  const percentage = maxLength ? (currentLength / maxLength) * 100 : 0;
  const isWarning = maxLength && percentage >= warningThreshold;
  const isNearLimit = maxLength && percentage >= 95;

  return (
    <div className="relative">
      <Textarea
        className={cn(className)}
        ref={ref}
        value={internalValue}
        onChange={handleChange}
        {...props}
      />
      {showCounter && maxLength && (
        <div className={cn(
          "absolute bottom-2 right-3 text-xs font-medium transition-colors",
          isNearLimit 
            ? "text-red-500" 
            : isWarning 
              ? "text-amber-500" 
              : "text-slate-400"
        )}>
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  )
})
TextareaWithCounter.displayName = "TextareaWithCounter"

export { TextareaWithCounter }

import { useEffect, useRef, useState } from "react";
import { Save, Check, Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date;
}

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ 
  key, 
  data, 
  debounceMs = 1000,
  enabled = true 
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>({ status: "idle" });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>("");

  // Load saved data on mount
  const loadSaved = (): T | null => {
    if (!enabled) return null;
    
    const saved = localStorage.getItem(`elevare_autosave_${key}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading autosave:", e);
      }
    }
    return null;
  };

  // Save data with debounce
  useEffect(() => {
    if (!enabled) return;
    
    const currentData = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (currentData === previousDataRef.current) return;
    previousDataRef.current = currentData;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set saving status
    setStatus({ status: "saving" });

    // Debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`elevare_autosave_${key}`, currentData);
        setStatus({ status: "saved", lastSaved: new Date() });
        
        // Reset to idle after a moment
        setTimeout(() => {
          setStatus((prev) => 
            prev.status === "saved" ? { ...prev, status: "idle" } : prev
          );
        }, 2000);
      } catch (e) {
        console.error("Error saving:", e);
        setStatus({ status: "error" });
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, debounceMs, enabled]);

  // Clear saved data
  const clearSaved = () => {
    localStorage.removeItem(`elevare_autosave_${key}`);
    setStatus({ status: "idle" });
  };

  return { status, loadSaved, clearSaved };
}

// Visual indicator component
interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  className?: string;
}

export function AutoSaveIndicator({ status, className }: AutoSaveIndicatorProps) {
  if (status.status === "idle") return null;

  const statusConfig = {
    saving: {
      icon: Cloud,
      text: "Salvando...",
      color: "text-slate-400",
      animate: true,
    },
    saved: {
      icon: Check,
      text: "Salvo",
      color: "text-green-500",
      animate: false,
    },
    error: {
      icon: CloudOff,
      text: "Erro ao salvar",
      color: "text-red-500",
      animate: false,
    },
  };

  const config = statusConfig[status.status as keyof typeof statusConfig];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs transition-opacity duration-300",
      config.color,
      className
    )}>
      <Icon className={cn("w-3.5 h-3.5", config.animate && "animate-pulse")} />
      <span>{config.text}</span>
    </div>
  );
}

export default useAutoSave;

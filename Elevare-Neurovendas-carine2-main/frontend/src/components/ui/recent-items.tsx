import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentItem {
  id: string;
  title: string;
  type: string;
  preview: string;
  createdAt: string;
  data?: any;
}

interface RecentItemsProps {
  items: RecentItem[];
  onReuse?: (item: RecentItem) => void;
  maxItems?: number;
  className?: string;
}

export function RecentItems({ 
  items, 
  onReuse, 
  maxItems = 3,
  className 
}: RecentItemsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const displayItems = isExpanded ? items : items.slice(0, maxItems);
  
  const handleCopy = async (item: RecentItem) => {
    await navigator.clipboard.writeText(item.preview);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  if (items.length === 0) return null;
  
  return (
    <div className={cn("", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-2 text-slate-600">
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">Últimos gerados ({items.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 animate-fade-up">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.createdAt}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.preview}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Copiar"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {onReuse && (
                    <button
                      onClick={() => onReuse(item)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                      title="Reutilizar"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook to manage recent items in localStorage
export function useRecentItems(key: string, maxItems: number = 10) {
  const [items, setItems] = useState<RecentItem[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem(`elevare_recent_${key}`);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recent items:", e);
      }
    }
  }, [key]);
  
  const addItem = (item: Omit<RecentItem, "id" | "createdAt">) => {
    const newItem: RecentItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString("pt-BR", { 
        day: "2-digit", 
        month: "2-digit", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    };
    
    setItems((prev) => {
      const updated = [newItem, ...prev].slice(0, maxItems);
      localStorage.setItem(`elevare_recent_${key}`, JSON.stringify(updated));
      return updated;
    });
  };
  
  const clearItems = () => {
    setItems([]);
    localStorage.removeItem(`elevare_recent_${key}`);
  };
  
  return { items, addItem, clearItems };
}

export default RecentItems;

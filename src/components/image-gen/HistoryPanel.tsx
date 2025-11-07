import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryItem {
  id: string;
  prompt: string;
  result_image_url: string;
  mode: string;
  style: string | null;
  created_at: string;
}

export function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('generation_history')
        .select('id, prompt, result_image_url, mode, style, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `generated-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('下载成功');
    } catch (error) {
      toast.error('下载失败');
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('提示词已复制');
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        还没有生成历史
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.result_image_url}
                  alt={item.prompt}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => handleCopyPrompt(item.prompt)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                    {item.mode}
                  </span>
                  {item.style && item.style !== 'none' && (
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                      {item.style}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString('zh-CN')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(item.result_image_url, item.id)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    下载
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

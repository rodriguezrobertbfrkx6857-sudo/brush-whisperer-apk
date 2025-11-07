import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Download } from "lucide-react";

const artStyles = [
  { value: "none", label: "No Style (Default)" },
  { value: "Realism", label: "写实风格 (Realism)" },
  { value: "Impressionism", label: "印象派 (Impressionism)" },
  { value: "Abstract", label: "抽象风格 (Abstract)" },
  { value: "Surrealism", label: "超现实主义 (Surrealism)" },
  { value: "Minimalism", label: "极简主义 (Minimalism)" },
  { value: "Pop Art", label: "波普艺术 (Pop Art)" },
  { value: "Black and White", label: "黑白风格 (Black & White)" },
  { value: "Vintage Film", label: "复古胶片风 (Vintage/Film)" },
  { value: "Cyberpunk", label: "赛博朋克风 (Cyberpunk)" },
  { value: "Steampunk", label: "蒸汽朋克风 (Steampunk)" },
  { value: "Anime", label: "动漫/卡通风 (Anime/Cartoon)" },
  { value: "Watercolor", label: "水彩风 (Watercolor)" },
  { value: "Oil Painting", label: "油画风 (Oil Painting)" },
  { value: "Fantasy", label: "幻想风 (Fantasy)" },
  { value: "3D Render", label: "3D渲染风 (3D Render)" },
];

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
}

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入图片描述");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style: selectedStyle }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error("生成图片失败，请重试");
        return;
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast.error("请求过于频繁，请稍后再试");
        } else if (data.error.includes('Payment')) {
          toast.error("需要充值积分才能继续使用");
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          url: data.imageUrl,
          prompt,
          style: selectedStyle,
          timestamp: Date.now()
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        toast.success("图片生成成功！");
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("生成图片时出错");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("图片下载成功！");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("下载失败，请重试");
    }
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              AI 图片生成器
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            用文字创造艺术，让想象成为现实
          </p>
        </header>

        {/* Generation Card */}
        <Card className="p-6 md:p-8 mb-8 shadow-card backdrop-blur-sm bg-card/95 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                图片描述
              </label>
              <Textarea
                placeholder="描述你想要生成的图片... 例如：一只在森林中奔跑的狐狸"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none text-base"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                艺术风格
              </label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isGenerating}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {artStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  生成图片
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">生成的图片</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <Card 
                  key={image.timestamp} 
                  className="overflow-hidden group animate-fadeIn shadow-card hover:shadow-glow transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(image.url, index)}
                          className="w-full bg-primary/90 hover:bg-primary"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          下载图片
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
                    {image.style !== 'none' && (
                      <p className="text-xs text-muted-foreground">
                        风格: {artStyles.find(s => s.value === image.style)?.label}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {generatedImages.length === 0 && (
          <div className="text-center py-16 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground">
              还没有生成图片，输入描述开始创作吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
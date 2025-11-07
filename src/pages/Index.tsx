import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, History } from "lucide-react";
import { ModeSelector } from "@/components/image-gen/ModeSelector";
import { GenerationPanel } from "@/components/image-gen/GenerationPanel";
import { ImageUploader } from "@/components/image-gen/ImageUploader";
import { HistoryPanel } from "@/components/image-gen/HistoryPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Mode = 'text2img' | 'img2img' | 'inpaint' | 'controlnet';

const Index = () => {
  const [mode, setMode] = useState<Mode>('text2img');
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("nsfw, low quality, bad anatomy, blurry");
  const [steps, setSteps] = useState(30);
  const [strength, setStrength] = useState(0.75);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [style, setStyle] = useState("none");
  const [model, setModel] = useState("stability-ai/sdxl");
  const [seed, setSeed] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Mode-specific states
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [controlImage, setControlImage] = useState<string | null>(null);
  const [controlnetType, setControlnetType] = useState("canny");
  const [loraModels, setLoraModels] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入提示词");
      return;
    }

    if ((mode === 'img2img' || mode === 'inpaint') && !sourceImage) {
      toast.error("请上传源图片");
      return;
    }

    if (mode === 'inpaint' && !maskImage) {
      toast.error("请绘制遮罩");
      return;
    }

    if (mode === 'controlnet' && !controlImage) {
      toast.error("请上传控制图片");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('sdxl-generate', {
        body: {
          mode,
          prompt,
          negative_prompt: negativePrompt,
          image_url: sourceImage,
          mask_url: maskImage,
          control_image_url: controlImage,
          controlnet_type: mode === 'controlnet' ? controlnetType : undefined,
          lora_models: loraModels.length > 0 ? loraModels : undefined,
          steps,
          strength,
          width,
          height,
          seed: seed ? parseInt(seed) : undefined,
          style,
          model,
        }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error("生成失败，请重试");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("图片生成成功！");
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("生成图片时出错");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-3 md:p-8 pb-safe">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6 md:mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              AI 图像工作室
            </h1>
          </div>
          <p className="text-base md:text-xl text-muted-foreground px-4">
            Stable Diffusion XL · ControlNet · 专业级图像生成
          </p>
        </header>

        <Tabs defaultValue="generate" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger value="generate" className="text-base">生成</TabsTrigger>
            <TabsTrigger value="history" className="text-base">
              <History className="w-4 h-4 mr-1 md:mr-2" />
              历史
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6">
              <ModeSelector 
                selectedMode={mode} 
                onModeChange={setMode}
                disabled={isGenerating}
              />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">参数设置</h2>
                <GenerationPanel
                  prompt={prompt}
                  setPrompt={setPrompt}
                  negativePrompt={negativePrompt}
                  setNegativePrompt={setNegativePrompt}
                  steps={steps}
                  setSteps={setSteps}
                  strength={strength}
                  setStrength={setStrength}
                  width={width}
                  setWidth={setWidth}
                  height={height}
                  setHeight={setHeight}
                  style={style}
                  setStyle={setStyle}
                  model={model}
                  setModel={setModel}
                  seed={seed}
                  setSeed={setSeed}
                  disabled={isGenerating}
                  showStrength={mode === 'img2img'}
                />

                {mode !== 'text2img' && (
                  <div className="mt-4 space-y-4">
                    <ImageUploader
                      label={mode === 'controlnet' ? "控制图片" : "源图片"}
                      imageUrl={mode === 'controlnet' ? controlImage : sourceImage}
                      onImageChange={mode === 'controlnet' ? setControlImage : setSourceImage}
                      disabled={isGenerating}
                    />

                    {mode === 'inpaint' && (
                      <ImageUploader
                        label="遮罩 (在白色区域绘制)"
                        imageUrl={maskImage}
                        onImageChange={setMaskImage}
                        disabled={isGenerating}
                        allowMask={true}
                      />
                    )}

                    {mode === 'controlnet' && (
                      <div>
                        <Label>ControlNet 类型</Label>
                        <Select value={controlnetType} onValueChange={setControlnetType} disabled={isGenerating}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="canny">Canny 边缘</SelectItem>
                            <SelectItem value="depth">深度图</SelectItem>
                            <SelectItem value="pose">姿态</SelectItem>
                            <SelectItem value="scribble">涂鸦</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-14 text-base md:text-lg font-semibold mt-6 bg-gradient-to-r from-primary to-accent touch-manipulation active:scale-95 transition-transform"
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
              </Card>

              <Card className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">生成结果</h2>
                {generatedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full rounded-lg shadow-lg"
                    />
                    <Button
                      variant="outline"
                      className="w-full h-12 touch-manipulation active:scale-95 transition-transform"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = generatedImage;
                        a.download = 'generated.png';
                        a.click();
                      }}
                    >
                      下载图片
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        生成的图片将显示在这里
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">生成历史</h2>
              <HistoryPanel />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

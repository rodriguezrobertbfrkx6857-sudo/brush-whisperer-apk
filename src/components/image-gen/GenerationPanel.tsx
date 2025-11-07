import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface GenerationPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  steps: number;
  setSteps: (value: number) => void;
  strength: number;
  setStrength: (value: number) => void;
  width: number;
  setWidth: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
  style: string;
  setStyle: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  seed: string;
  setSeed: (value: string) => void;
  disabled?: boolean;
  showStrength?: boolean;
}

const styles = [
  { value: "none", label: "默认" },
  { value: "realistic", label: "写实" },
  { value: "anime", label: "动漫" },
  { value: "cyberpunk", label: "赛博朋克" },
  { value: "oil painting", label: "油画" },
  { value: "watercolor", label: "水彩" },
  { value: "3d render", label: "3D渲染" },
];

const models = [
  { value: "stability-ai/sdxl", label: "SDXL (通用)" },
  { value: "stability-ai/stable-diffusion", label: "SD 1.5 (快速)" },
];

const sizes = [
  { value: "1024x1024", label: "1:1 方形" },
  { value: "1024x768", label: "4:3 横向" },
  { value: "768x1024", label: "3:4 纵向" },
  { value: "1280x720", label: "16:9 宽屏" },
];

export function GenerationPanel({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  steps,
  setSteps,
  strength,
  setStrength,
  width,
  setWidth,
  height,
  setHeight,
  style,
  setStyle,
  model,
  setModel,
  seed,
  setSeed,
  disabled,
  showStrength = false,
}: GenerationPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>提示词 *</Label>
        <Textarea
          placeholder="描述你想生成的图片..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled}
          className="min-h-[100px] mt-2"
        />
      </div>

      <div>
        <Label>负面提示词</Label>
        <Textarea
          placeholder="不想在图片中出现的内容..."
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          disabled={disabled}
          className="min-h-[80px] mt-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>风格</Label>
          <Select value={style} onValueChange={setStyle} disabled={disabled}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styles.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>模型</Label>
          <Select value={model} onValueChange={setModel} disabled={disabled}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>尺寸</Label>
          <Select
            value={`${width}x${height}`}
            onValueChange={(value) => {
              const [w, h] = value.split('x').map(Number);
              setWidth(w);
              setHeight(h);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>随机种子 (可选)</Label>
          <Input
            type="number"
            placeholder="留空随机"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={disabled}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>推理步数: {steps}</Label>
        <Slider
          value={[steps]}
          onValueChange={([value]) => setSteps(value)}
          min={10}
          max={50}
          step={5}
          disabled={disabled}
          className="mt-2"
        />
      </div>

      {showStrength && (
        <div>
          <Label>强度: {strength.toFixed(2)}</Label>
          <Slider
            value={[strength]}
            onValueChange={([value]) => setStrength(value)}
            min={0.1}
            max={1}
            step={0.05}
            disabled={disabled}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}

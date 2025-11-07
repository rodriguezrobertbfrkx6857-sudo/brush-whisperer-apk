import { Card } from "@/components/ui/card";
import { Wand2, Image, Paintbrush, Grid3x3 } from "lucide-react";

type Mode = 'text2img' | 'img2img' | 'inpaint' | 'controlnet';

interface ModeSelectorProps {
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled?: boolean;
}

export function ModeSelector({ selectedMode, onModeChange, disabled }: ModeSelectorProps) {
  const modes = [
    { value: 'text2img' as Mode, label: '文本生图', icon: Wand2, desc: '用文字创造图像' },
    { value: 'img2img' as Mode, label: '图生图', icon: Image, desc: '基于图片生成' },
    { value: 'inpaint' as Mode, label: '局部重绘', icon: Paintbrush, desc: '修改图片局部' },
    { value: 'controlnet' as Mode, label: 'ControlNet', icon: Grid3x3, desc: '结构引导生成' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.value;
        
        return (
          <Card
            key={mode.value}
            className={`p-3 md:p-4 cursor-pointer transition-all hover:shadow-lg touch-manipulation active:scale-95 ${
              isSelected 
                ? 'border-primary bg-primary/5 shadow-glow' 
                : 'hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onModeChange(mode.value)}
          >
            <div className="flex flex-col items-center text-center gap-1.5 md:gap-2">
              <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <div className={`font-medium text-xs md:text-sm ${isSelected ? 'text-primary' : ''}`}>
                  {mode.label}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                  {mode.desc}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

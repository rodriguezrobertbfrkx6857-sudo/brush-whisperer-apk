import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  label: string;
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
  allowMask?: boolean;
}

export function ImageUploader({ 
  label, 
  imageUrl, 
  onImageChange, 
  disabled,
  allowMask = false 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  // Simple drawing for mask (if allowMask is true)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!allowMask || !canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 20;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const maskUrl = canvasRef.current.toDataURL();
      onImageChange(maskUrl);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm md:text-base font-medium">{label}</label>
      
      {!imageUrl ? (
        <Card
          className={`border-2 border-dashed p-6 md:p-8 text-center cursor-pointer transition-colors touch-manipulation active:scale-95 ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm md:text-base text-muted-foreground">
            点击或拖拽上传图片
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            disabled={disabled}
          />
        </Card>
      ) : (
        <Card className="relative">
          <div className="relative">
            <img src={imageUrl} alt="Uploaded" className="w-full rounded-lg" />
            {allowMask && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                width={512}
                height={512}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            )}
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-9 w-9 md:h-10 md:w-10 touch-manipulation active:scale-95 transition-transform"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </Card>
      )}
    </div>
  );
}

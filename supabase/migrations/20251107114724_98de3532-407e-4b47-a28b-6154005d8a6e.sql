-- 创建图片生成历史记录表
CREATE TABLE public.generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  mode TEXT NOT NULL, -- 'text2img', 'img2img', 'inpaint', 'upscale', 'face_restore'
  style TEXT,
  model TEXT,
  steps INTEGER DEFAULT 30,
  strength FLOAT DEFAULT 0.8,
  width INTEGER DEFAULT 1024,
  height INTEGER DEFAULT 1024,
  seed INTEGER,
  lora_models TEXT[], -- 使用的 LoRA 模型
  controlnet_type TEXT, -- 'canny', 'depth', 'pose', 'openpose' 等
  original_image_url TEXT,
  mask_image_url TEXT,
  control_image_url TEXT,
  result_image_url TEXT NOT NULL,
  character_reference_id UUID, -- 用于角色一致性
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建角色引用表用于角色一致性
CREATE TABLE public.character_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  reference_image_url TEXT NOT NULL,
  description TEXT,
  lora_path TEXT, -- 训练的角色 LoRA 路径
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建索引以优化查询
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);
CREATE INDEX idx_generation_history_character_ref ON public.generation_history(character_reference_id);
CREATE INDEX idx_character_references_user_id ON public.character_references(user_id);

-- 启用 RLS
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_references ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（公开访问，因为不需要用户认证）
CREATE POLICY "允许所有人查看生成历史" 
ON public.generation_history 
FOR SELECT 
USING (true);

CREATE POLICY "允许所有人创建生成历史" 
ON public.generation_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "允许所有人查看角色引用" 
ON public.character_references 
FOR SELECT 
USING (true);

CREATE POLICY "允许所有人创建角色引用" 
ON public.character_references 
FOR INSERT 
WITH CHECK (true);
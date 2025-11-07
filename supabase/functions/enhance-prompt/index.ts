import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mode, style } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // 使用 AI 增强提示词
    const systemPrompt = `你是一个专业的 Stable Diffusion 提示词优化专家。
你的任务是将用户的简短描述转换成详细、专业的 Stable Diffusion 提示词。

规则：
1. 保留用户的核心意图
2. 添加细节描述（光照、质量、风格等）
3. 使用英文关键词（更准确）
4. 包含技术参数（如 4K, highly detailed, professional）
5. 如果用户提到风格，强化该风格的特征
6. 输出格式：只返回优化后的提示词，不要解释

示例：
用户输入："一只猫"
优化输出："a cute fluffy cat, sitting on a windowsill, soft natural lighting, high quality, detailed fur texture, professional photography, 4K resolution"

用户输入："赛博朋克城市"
优化输出："cyberpunk city at night, neon lights, flying cars, futuristic skyscrapers, rain-soaked streets, highly detailed, cinematic lighting, blade runner style, 8K, ultra realistic"

当前模式：${mode || 'text2img'}
当前风格：${style || 'none'}

请优化以下提示词，直接返回优化结果：`;

    console.log('Enhancing prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      // 如果增强失败，返回原始提示词
      return new Response(
        JSON.stringify({ enhancedPrompt: prompt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;

    console.log('Enhanced prompt:', enhancedPrompt);

    return new Response(
      JSON.stringify({ enhancedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-prompt function:', error);
    // 出错时返回原始提示词
    return new Response(
      JSON.stringify({ enhancedPrompt: (await req.json()).prompt }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

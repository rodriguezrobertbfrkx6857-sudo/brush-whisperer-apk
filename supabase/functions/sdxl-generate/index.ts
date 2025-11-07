import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      mode,
      prompt,
      negative_prompt,
      image_url,
      mask_url,
      control_image_url,
      controlnet_type,
      lora_models,
      steps = 30,
      guidance_scale = 7.5,
      strength = 0.8,
      width = 1024,
      height = 1024,
      seed,
      style,
      model = "stability-ai/sdxl",
      character_reference_id,
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not configured');
    }

    console.log('Generating with mode:', mode);

    // Build the input based on mode
    let replicateInput: any = {
      prompt: style && style !== 'none' ? `${prompt}, ${style} style` : prompt,
      negative_prompt: negative_prompt || "nsfw, low quality, bad anatomy, blurry",
      num_inference_steps: steps,
      guidance_scale,
      width,
      height,
    };

    if (seed) {
      replicateInput.seed = seed;
    }

    // Select model and adjust input based on mode
    let replicateModel = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
    
    if (mode === 'img2img' && image_url) {
      replicateModel = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
      replicateInput.image = image_url;
      replicateInput.prompt_strength = strength;
    } else if (mode === 'inpaint' && image_url && mask_url) {
      replicateModel = "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3";
      replicateInput.image = image_url;
      replicateInput.mask = mask_url;
    } else if (mode === 'controlnet' && control_image_url && controlnet_type) {
      replicateModel = "lucataco/sdxl-controlnet:59ec0c1f8f7eec18e4ddb6a2cbe63a98187c05d8e5ff89cf6c0bacc9883ab9a7";
      replicateInput.control_image = control_image_url;
      replicateInput.controlnet_conditioning_scale = 0.5;
      replicateInput.control_type = controlnet_type;
    }

    // Add LoRA if specified
    if (lora_models && lora_models.length > 0) {
      replicateInput.lora_urls = lora_models;
    }

    console.log('Using model:', replicateModel);
    console.log('Input:', JSON.stringify(replicateInput, null, 2));

    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: replicateModel.split(':')[1],
        input: replicateInput,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction.id);

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        },
      });

      result = await statusResponse.json();
      attempts++;
      console.log(`Status check ${attempts}:`, result.status);
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Image generation failed');
    }

    if (result.status !== 'succeeded') {
      throw new Error('Image generation timed out');
    }

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from('generation_history').insert({
      prompt,
      negative_prompt,
      mode,
      style,
      model: replicateModel.split(':')[0],
      steps,
      strength,
      width,
      height,
      seed: seed || null,
      original_image_url: image_url || null,
      mask_image_url: mask_url || null,
      control_image_url: control_image_url || null,
      controlnet_type: controlnet_type || null,
      lora_models: lora_models || null,
      character_reference_id: character_reference_id || null,
      result_image_url: imageUrl,
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify({ imageUrl, predictionId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sdxl-generate function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

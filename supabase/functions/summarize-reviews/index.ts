
// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://docs.supabase.com/guides/functions/runtime-deno
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

interface RequestBody {
  reviews: Review[];
  language?: string;
}

interface CategorySummary {
  summary: string;
  cuisine: string;
  atmosphere: string;
  service: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required')
    }

    // Get the request body
    const { reviews, language = 'en' } = await req.json() as RequestBody
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      throw new Error('Reviews array is required')
    }

    console.log(`Generating summary for ${reviews.length} reviews in ${language}`)
    
    // Format the reviews for OpenAI
    const reviewTexts = reviews.map(review => 
      `"${review.text}" (Rating: ${review.rating}/5)`
    ).join("\n\n")

    // Prepare the system prompt based on language
    let systemPrompt = '';
    let userPrompt = '';
    
    if (language === 'en') {
      systemPrompt = 'You are a helpful assistant that analyzes restaurant reviews and provides concise summaries. Extract key information about food quality, atmosphere, and service quality.';
      userPrompt = `Analyze these restaurant reviews and provide:
1. A concise overall summary in 1-2 sentences focusing primarily on food quality and atmosphere.
2. Three specific categorized phrases:
   - Cuisine: A phrase describing the type and quality of food (e.g., "Authentic Italian pasta", "Flavorful Thai curries")
   - Atmosphere: A phrase describing the ambiance/vibe (e.g., "Cozy cafe setting", "Upscale modern decor")
   - Service: A phrase describing staff and service quality (e.g., "Attentive friendly staff", "Prompt professional service")

Reviews:
${reviewTexts}`;
    } else if (language === 'ja') {
      systemPrompt = 'あなたはレストランのレビューを分析し、簡潔な要約を提供する役立つアシスタントです。食品の質、雰囲気、およびサービスの質に関する重要な情報を抽出します。';
      userPrompt = `以下のレストランレビューを分析し、次の情報を提供してください：
1. 主に食品の質と雰囲気に焦点を当てた、1〜2文の簡潔な全体的な要約。
2. 以下の3つの特定のカテゴリーに分類されたフレーズ：
   - 料理：食品の種類と質を説明するフレーズ（例：「本格的なイタリアンパスタ」、「風味豊かなタイカレー」）
   - 雰囲気：雰囲気/雰囲気を説明するフレーズ（例：「居心地の良いカフェの設定」、「高級な現代的な装飾」）
   - サービス：スタッフとサービスの質を説明するフレーズ（例：「気配りのある親切なスタッフ」、「迅速で専門的なサービス」）

レビュー：
${reviewTexts}`;
    } else {
      // Default to English for other languages
      systemPrompt = 'You are a helpful assistant that analyzes restaurant reviews and provides concise summaries. Extract key information about food quality, atmosphere, and service quality.';
      userPrompt = `Analyze these restaurant reviews and provide:
1. A concise overall summary in 1-2 sentences focusing primarily on food quality and atmosphere.
2. Three specific categorized phrases:
   - Cuisine: A phrase describing the type and quality of food (e.g., "Authentic Italian pasta", "Flavorful Thai curries")
   - Atmosphere: A phrase describing the ambiance/vibe (e.g., "Cozy cafe setting", "Upscale modern decor")
   - Service: A phrase describing staff and service quality (e.g., "Attentive friendly staff", "Prompt professional service")

Reviews:
${reviewTexts}`;
    }

    // Call OpenAI API to generate summary
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more affordable model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    const result = await response.json()
    
    if (result.error) {
      throw new Error(`OpenAI API error: ${result.error.message}`)
    }

    const resultContent = result.choices[0].message.content.trim();
    console.log("OpenAI response:", resultContent);
    
    // Parse the response to extract the summary and categories
    const categorySummary = parseOpenAIResponse(resultContent, language);

    // Return the structured summary
    return new Response(
      JSON.stringify(categorySummary),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

// Helper function to parse OpenAI response into structured format
function parseOpenAIResponse(response: string, language: string): CategorySummary {
  const result: CategorySummary = {
    summary: '',
    cuisine: '',
    atmosphere: '',
    service: ''
  };
  
  try {
    // Different parsing logic based on language
    if (language === 'ja') {
      // Japanese parsing
      const lines = response.split('\n').filter(line => line.trim() !== '');
      
      // First paragraph or sentence is the summary
      if (lines.length > 0) {
        result.summary = lines[0].replace(/^[0-9]+\.\s*/, '');
      }
      
      // Look for category labels in Japanese
      for (const line of lines) {
        if (line.includes('料理：')) {
          result.cuisine = line.split('料理：')[1].trim();
        } else if (line.includes('雰囲気：')) {
          result.atmosphere = line.split('雰囲気：')[1].trim();
        } else if (line.includes('サービス：')) {
          result.service = line.split('サービス：')[1].trim();
        }
      }
    } else {
      // Default English parsing
      const lines = response.split('\n').filter(line => line.trim() !== '');
      
      // First paragraph or sentence is the summary
      if (lines.length > 0) {
        result.summary = lines[0].replace(/^[0-9]+\.\s*/, '');
      }
      
      // Look for category labels
      for (const line of lines) {
        if (line.includes('Cuisine:')) {
          result.cuisine = line.split('Cuisine:')[1].trim();
        } else if (line.includes('Atmosphere:')) {
          result.atmosphere = line.split('Atmosphere:')[1].trim();
        } else if (line.includes('Service:')) {
          result.service = line.split('Service:')[1].trim();
        }
      }
    }
    
    // Provide fallbacks if any category is missing
    if (!result.cuisine) result.cuisine = language === 'ja' ? '情報なし' : 'Not mentioned';
    if (!result.atmosphere) result.atmosphere = language === 'ja' ? '情報なし' : 'Not mentioned';
    if (!result.service) result.service = language === 'ja' ? '情報なし' : 'Not mentioned';
    
    return result;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    
    // Return a default structure if parsing fails
    return {
      summary: response.split('\n')[0] || (language === 'ja' ? 'レビューの要約を生成できませんでした。' : 'Could not parse review summary.'),
      cuisine: language === 'ja' ? '情報なし' : 'Not mentioned',
      atmosphere: language === 'ja' ? '情報なし' : 'Not mentioned',
      service: language === 'ja' ? '情報なし' : 'Not mentioned'
    };
  }
}

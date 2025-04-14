
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
    const { reviews } = await req.json() as RequestBody
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      throw new Error('Reviews array is required')
    }

    console.log(`Generating summary for ${reviews.length} reviews`)
    
    // Format the reviews for OpenAI
    const reviewTexts = reviews.map(review => 
      `"${review.text}" (Rating: ${review.rating}/5)`
    ).join("\n\n")

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
            content: 'You are a helpful assistant that summarizes restaurant reviews concisely in 1-2 sentences. Focus PRIMARILY on food quality (taste, presentation, portion sizes) and restaurant atmosphere (ambiance, decor, noise level, cleanliness). Only mention other aspects like service or price if they are strongly emphasized in multiple reviews.'
          },
          {
            role: 'user',
            content: `Summarize these restaurant reviews focusing on food quality and atmosphere in 1-2 concise sentences:\n\n${reviewTexts}`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    const result = await response.json()
    
    if (result.error) {
      throw new Error(`OpenAI API error: ${result.error.message}`)
    }

    // Return the summary
    return new Response(
      JSON.stringify({
        summary: result.choices[0].message.content.trim()
      }),
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

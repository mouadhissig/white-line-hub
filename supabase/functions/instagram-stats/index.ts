import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache
let cachedData: { stats: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000;

function getRateLimitKey(req: Request): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('cf-connecting-ip') || 
         'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientKey = getRateLimitKey(req);
    if (isRateLimited(clientKey)) {
      console.log('Rate limit exceeded for:', clientKey);
      return new Response(
        JSON.stringify({ error: 'Too many requests', stats: { followers: 100, posts: 15, totalLikes: 300 } }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } 
        }
      );
    }

    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      console.log('Returning cached Instagram stats');
      return new Response(
        JSON.stringify({ stats: cachedData.stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    const instagramAccountId = Deno.env.get('INSTAGRAM_ACCOUNT_ID');

    if (!accessToken || !instagramAccountId) {
      console.log('Instagram credentials not configured, returning placeholder data');
      // Return placeholder data if Instagram is not configured
      const placeholderStats = { followers: 100, posts: 15, totalLikes: 300 };
      return new Response(
        JSON.stringify({ stats: placeholderStats, isPlaceholder: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching Instagram account stats...');

    // Fetch Instagram account info
    const accountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=followers_count,media_count&access_token=${accessToken}`
    );

    if (!accountResponse.ok) {
      const error = await accountResponse.text();
      console.error('Instagram API error (account):', error);
      throw new Error(`Instagram API error: ${accountResponse.status}`);
    }

    const accountData = await accountResponse.json();

    // Fetch media with like counts
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media?fields=like_count&limit=100&access_token=${accessToken}`
    );

    let totalLikes = 0;

    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      
      // Sum up likes from all media
      for (const media of mediaData.data || []) {
        if (media.like_count) {
          totalLikes += media.like_count;
        }
      }
    }

    const stats = {
      followers: accountData.followers_count || 0,
      posts: accountData.media_count || 0,
      totalLikes: totalLikes
    };

    console.log('Successfully fetched Instagram stats:', stats);

    // Update cache
    cachedData = { stats, timestamp: now };

    return new Response(
      JSON.stringify({ stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Instagram stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, stats: { followers: 100, posts: 15, totalLikes: 300 } }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

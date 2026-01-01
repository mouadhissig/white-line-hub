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
        JSON.stringify({ error: 'Too many requests', stats: { followers: 150, posts: 10, totalLikes: 500 } }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } 
        }
      );
    }

    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      console.log('Returning cached Facebook stats');
      return new Response(
        JSON.stringify({ stats: cachedData.stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    const pageId = '156324860887838';

    if (!accessToken) {
      throw new Error('Facebook access token not configured');
    }

    console.log('Fetching Facebook page stats...');

    // Fetch page info with followers
    const pageResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`
    );

    if (!pageResponse.ok) {
      const error = await pageResponse.text();
      console.error('Facebook API error (page):', error);
      throw new Error(`Facebook API error: ${pageResponse.status}`);
    }

    const pageData = await pageResponse.json();

    // Fetch posts with likes
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=likes.summary(true)&limit=100&access_token=${accessToken}`
    );

    let totalLikes = 0;
    let postsCount = 0;

    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      postsCount = postsData.data?.length || 0;
      
      // Sum up likes from all posts
      for (const post of postsData.data || []) {
        if (post.likes?.summary?.total_count) {
          totalLikes += post.likes.summary.total_count;
        }
      }
    }

    const stats = {
      followers: pageData.followers_count || pageData.fan_count || 0,
      posts: postsCount,
      totalLikes: totalLikes
    };

    console.log('Successfully fetched Facebook stats:', stats);

    // Update cache
    cachedData = { stats, timestamp: now };

    return new Response(
      JSON.stringify({ stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Facebook stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, stats: { followers: 150, posts: 10, totalLikes: 500 } }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

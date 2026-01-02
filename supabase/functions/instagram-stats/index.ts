import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache
let cachedData: { stats: any; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache (RapidAPI has rate limits)

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
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

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const rapidApiHost = Deno.env.get('RAPIDAPI_INSTAGRAM_HOST');
    const instagramUsername = 'whiteline_issig'; // Your Instagram username

    if (!rapidApiKey || !rapidApiHost) {
      console.log('RapidAPI credentials not configured, returning placeholder data');
      const placeholderStats = { followers: 100, posts: 15, totalLikes: 300 };
      return new Response(
        JSON.stringify({ stats: placeholderStats, isPlaceholder: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching Instagram stats via RapidAPI...');
    console.log('Using host:', rapidApiHost);

    // Fetch user info from RapidAPI Instagram Scraper
    const userInfoResponse = await fetch(
      `https://${rapidApiHost}/v1/info?username_or_id_or_url=${instagramUsername}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost,
        },
      }
    );

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('RapidAPI error:', userInfoResponse.status, errorText);
      throw new Error(`RapidAPI error: ${userInfoResponse.status}`);
    }

    const userData = await userInfoResponse.json();
    console.log('RapidAPI response:', JSON.stringify(userData).substring(0, 500));

    // Extract stats from the response - structure may vary by API
    let followers = 0;
    let posts = 0;
    let totalLikes = 0;

    // Handle different API response structures
    if (userData.data) {
      // Some APIs return data in a nested structure
      followers = userData.data.follower_count || userData.data.followers_count || userData.data.followers || 0;
      posts = userData.data.media_count || userData.data.posts_count || userData.data.posts || 0;
    } else {
      // Direct response structure
      followers = userData.follower_count || userData.followers_count || userData.followers || 0;
      posts = userData.media_count || userData.posts_count || userData.posts || 0;
    }

    // Try to get total likes from recent posts if available
    const mediaData = userData.data?.edge_owner_to_timeline_media?.edges || 
                      userData.edge_owner_to_timeline_media?.edges ||
                      userData.data?.posts ||
                      userData.posts ||
                      [];

    for (const post of mediaData) {
      const likeCount = post.node?.edge_liked_by?.count || 
                        post.edge_liked_by?.count ||
                        post.like_count ||
                        post.likes_count ||
                        0;
      totalLikes += likeCount;
    }

    // If we couldn't get likes, estimate based on followers
    if (totalLikes === 0 && followers > 0) {
      totalLikes = Math.floor(followers * 0.05 * posts); // Rough estimate
    }

    const stats = {
      followers,
      posts,
      totalLikes
    };

    console.log('Successfully fetched Instagram stats via RapidAPI:', stats);

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

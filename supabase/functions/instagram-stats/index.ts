import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const allowedOrigins = [
  "https://whitelineissig.me",
  "https://www.whitelineissig.me",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return (
      hostname.endsWith(".lovableproject.com") ||
      hostname.endsWith(".lovable.app") ||
      hostname.endsWith(".netlify.app")
    );
  } catch {
    return false;
  }
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = isAllowedOrigin(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

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

// Default fallback stats
const fallbackStats = { followers: 100, posts: 15, totalLikes: 300 };

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientKey = getRateLimitKey(req);
    if (isRateLimited(clientKey)) {
      console.log('Rate limit exceeded for client');
      return new Response(
        JSON.stringify({ error: 'Too many requests', stats: fallbackStats }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } 
        }
      );
    }

    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      console.log('Returning cached stats');
      return new Response(
        JSON.stringify({ stats: cachedData.stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const rapidApiHost = Deno.env.get('RAPIDAPI_INSTAGRAM_HOST');
    const instagramUsername = 'whiteline_issig'; // Your Instagram username

    if (!rapidApiKey || !rapidApiHost) {
      console.log('API credentials not configured, returning placeholder data');
      return new Response(
        JSON.stringify({ stats: fallbackStats, isPlaceholder: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching Instagram stats...');

    // Try the user_data endpoint (common format for instagram-scraper-stable-api)
    const userInfoResponse = await fetch(
      `https://${rapidApiHost}/user_data?username_or_url=${instagramUsername}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error('API error:', userInfoResponse.status);
      
      // If 404, try alternative endpoint format
      if (userInfoResponse.status === 404) {
        console.log('Trying alternative endpoint format...');
        
        // Try /user endpoint
        const altResponse = await fetch(
          `https://${rapidApiHost}/user?username=${instagramUsername}`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': rapidApiKey,
              'x-rapidapi-host': rapidApiHost,
            },
          }
        );
        
        if (!altResponse.ok) {
          console.error('Alternative endpoint also failed:', altResponse.status);
          return new Response(
            JSON.stringify({ stats: fallbackStats }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const altData = await altResponse.json();
        console.log('Alternative endpoint succeeded');
        
        // Process alternative response
        const stats = extractStats(altData);
        cachedData = { stats, timestamp: now };
        
        return new Response(
          JSON.stringify({ stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ stats: fallbackStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await userInfoResponse.json();
    console.log('Successfully fetched stats');

    const stats = extractStats(userData);

    // Update cache
    cachedData = { stats, timestamp: now };

    return new Response(
      JSON.stringify({ stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(
      JSON.stringify({ stats: fallbackStats }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function extractStats(userData: any): { followers: number; posts: number; totalLikes: number } {
  let followers = 0;
  let posts = 0;
  let totalLikes = 0;

  // Handle different API response structures
  const data = userData.data || userData;
  
  // Extract follower count (try multiple possible field names)
  followers = data.follower_count || 
              data.followers_count || 
              data.followers || 
              data.edge_followed_by?.count ||
              data.user?.follower_count ||
              0;
  
  // Extract post count
  posts = data.media_count || 
          data.posts_count || 
          data.posts || 
          data.edge_owner_to_timeline_media?.count ||
          data.user?.media_count ||
          0;

  // Try to get total likes from recent posts if available
  const mediaData = data.edge_owner_to_timeline_media?.edges || 
                    data.posts ||
                    data.media ||
                    data.recent_posts ||
                    [];

  if (Array.isArray(mediaData)) {
    for (const post of mediaData) {
      const likeCount = post.node?.edge_liked_by?.count || 
                        post.edge_liked_by?.count ||
                        post.like_count ||
                        post.likes_count ||
                        post.likes ||
                        0;
      totalLikes += likeCount;
    }
  }

  // If we couldn't get likes, estimate based on followers
  if (totalLikes === 0 && followers > 0 && posts > 0) {
    totalLikes = Math.floor(followers * 0.03 * Math.min(posts, 10)); // Rough estimate
  }

  return { followers, posts, totalLikes };
}
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

// Default fallback stats
const fallbackStats = { followers: 150, posts: 10, totalLikes: 500 };

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

    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    const pageId = '156324860887838';

    if (!accessToken) {
      console.error('Access token not configured');
      return new Response(
        JSON.stringify({ stats: fallbackStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching page stats...');

    // Fetch page info with followers
    const pageResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`
    );

    if (!pageResponse.ok) {
      console.error('API error fetching page data:', pageResponse.status);
      return new Response(
        JSON.stringify({ stats: fallbackStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageData = await pageResponse.json();

    // Fetch ALL posts with reactions count (likes, love, etc.)
    let totalLikes = 0;
    let postsCount = 0;
    let nextUrl = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=reactions.summary(total_count)&limit=100&access_token=${accessToken}`;

    // Paginate through all posts to get accurate total
    let hasMore = true;
    while (hasMore) {
      const postsResponse: Response = await fetch(nextUrl);
      
      if (!postsResponse.ok) {
        console.error('API error fetching posts');
        break;
      }

      const postsData: { data?: Array<{ reactions?: { summary?: { total_count?: number } } }>; paging?: { next?: string } } = await postsResponse.json();
      const posts = postsData.data || [];
      postsCount += posts.length;
      
      // Sum up reactions (likes) from all posts
      for (const post of posts) {
        if (post.reactions?.summary?.total_count) {
          totalLikes += post.reactions.summary.total_count;
        }
      }

      // Check if there are more pages
      if (postsData.paging?.next) {
        nextUrl = postsData.paging.next;
      } else {
        hasMore = false;
      }
      
      // Safety limit to prevent infinite loops
      if (postsCount > 500) {
        console.log('Reached safety limit of 500 posts');
        break;
      }
    }

    const stats = {
      followers: pageData.followers_count || pageData.fan_count || 0,
      posts: postsCount,
      totalLikes: totalLikes
    };

    console.log('Successfully fetched stats');

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
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
let cachedData: { posts: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute window

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
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const clientKey = getRateLimitKey(req);
    if (isRateLimited(clientKey)) {
      console.log('Rate limit exceeded for client');
      return new Response(
        JSON.stringify({ error: 'Too many requests', posts: [] }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } 
        }
      );
    }

    // Return cached data if valid
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      console.log('Returning cached posts data');
      return new Response(
        JSON.stringify({ posts: cachedData.posts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    const pageId = '156324860887838';

    if (!accessToken) {
      console.error('Access token not configured');
      return new Response(
        JSON.stringify({ posts: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching page posts...');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=message,created_time,full_picture,permalink_url,reactions.summary(total_count),comments.summary(total_count),shares&limit=3&access_token=${accessToken}`
    );

    if (!response.ok) {
      console.error('API error fetching posts:', response.status);
      return new Response(
        JSON.stringify({ posts: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched posts:', data.data?.length || 0);

    // Update cache
    cachedData = { posts: data.data || [], timestamp: now };

    return new Response(
      JSON.stringify({ posts: data.data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(
      JSON.stringify({ posts: [] }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
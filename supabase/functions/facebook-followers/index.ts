import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const allowedOrigins = [
  'https://whitelineissig.me',
  'https://www.whitelineissig.me',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true'
  };
}

// Simple in-memory cache
let cachedData: { followers: number; timestamp: number } | null = null;
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

// Default fallback value
const fallbackFollowers = 150;

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
        JSON.stringify({ error: 'Too many requests', followers: fallbackFollowers }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } 
        }
      );
    }

    // Return cached data if valid
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      console.log('Returning cached followers data');
      return new Response(
        JSON.stringify({ followers: cachedData.followers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    const pageId = '156324860887838';

    if (!accessToken) {
      console.error('Access token not configured');
      return new Response(
        JSON.stringify({ followers: fallbackFollowers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching page followers...');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      console.error('API error fetching followers:', response.status);
      return new Response(
        JSON.stringify({ followers: fallbackFollowers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched followers');

    // Update cache
    cachedData = { followers: data.followers_count || 0, timestamp: now };

    return new Response(
      JSON.stringify({ followers: data.followers_count || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching followers:', error);
    return new Response(
      JSON.stringify({ followers: fallbackFollowers }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = 'EAAmlh8zZBZCc0BQIeZBrrKcxSlhZBBrBZAJSiA7VKUO7sRVPHML7R7VzMOgZAMXXdmpA6ucSgPnxAAYUM0mfAcXR9x5KWZByDsfCchH2TPthfooePpNjBRLgxzd04ZCsqKaq8vckcgwsUZCWISmKLcwCiCiLC1DoT7Dmisq5Ab5NYyCQ8QDHM9Jsfx2f3RP6XRAexxclvrwfllhZAP';
    const pageId = '156324860887838';

    if (!accessToken) {
      throw new Error('Facebook access token not configured');
    }

    console.log('Fetching Facebook page posts...');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/156324860887838/posts?fields=message,created_time,full_picture,permalink_url&limit=3&access_token=EAAmlh8zZBZCc0BQIeZBrrKcxSlhZBBrBZAJSiA7VKUO7sRVPHML7R7VzMOgZAMXXdmpA6ucSgPnxAAYUM0mfAcXR9x5KWZByDsfCchH2TPthfooePpNjBRLgxzd04ZCsqKaq8vckcgwsUZCWISmKLcwCiCiLC1DoT7Dmisq5Ab5NYyCQ8QDHM9Jsfx2f3RP6XRAexxclvrwfllhZAP`
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Facebook API error:', error);
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched posts:', data.data?.length || 0, 'posts');

    return new Response(
      JSON.stringify({ posts: data.data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, posts: [] }),
      { 
        status: 200, // Return 200 with empty posts
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

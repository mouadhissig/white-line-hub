import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken =
      "EAAmlh8zZBZCc0BQIeZBrrKcxSlhZBBrBZAJSiA7VKUO7sRVPHML7R7VzMOgZAMXXdmpA6ucSgPnxAAYUM0mfAcXR9x5KWZByDsfCchH2TPthfooePpNjBRLgxzd04ZCsqKaq8vckcgwsUZCWISmKLcwCiCiLC1DoT7Dmisq5Ab5NYyCQ8QDHM9Jsfx2f3RP6XRAexxclvrwfllhZAP";
    const pageId = "156324860887838";

    if (!accessToken) {
      throw new Error("Facebook access token not configured");
    }

    console.log("Fetching Facebook page posts...");

    // Fetch last 3 posts
    const postsRes = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/posts?fields=message,created_time,full_picture,permalink_url&limit=3&access_token=${accessToken}`
    );
    if (!postsRes.ok) {
      const error = await postsRes.text();
      console.error("Facebook API error (posts):", error);
      throw new Error(`Facebook API error (posts): ${postsRes.status}`);
    }
    const postsJson = await postsRes.json();

    // Fetch followers count
    const followersRes = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}?fields=followers_count&access_token=${accessToken}`
    );
    if (!followersRes.ok) {
      const error = await followersRes.text();
      console.error("Facebook API error (followers):", error);
      throw new Error(`Facebook API error (followers): ${followersRes.status}`);
    }
    const followersJson = await followersRes.json();

    console.log(
      "Successfully fetched:",
      postsJson.data?.length || 0,
      "posts and",
      followersJson.followers_count || 0,
      "followers"
    );

    return new Response(
      JSON.stringify({
        posts: postsJson.data || [],
        followers: followersJson.followers_count || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching Facebook data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, posts: [], followers: 0 }),
      {
        status: 200, // Return 200 with empty data
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

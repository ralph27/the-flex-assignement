const HOSTAWAY_API_BASE = "https://api.hostaway.com/v1";
const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID || "61148";
const API_KEY =
  process.env.HOSTAWAY_API_KEY ||
  "f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(`${HOSTAWAY_API_BASE}/accessTokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: ACCOUNT_ID,
        client_secret: API_KEY,
        scope: "general",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error("Failed to get access token:", error);
    throw error;
  }
}

export async function fetchHostawayReviews() {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${HOSTAWAY_API_BASE}/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Reviews API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      return data.result || [];
    }

    throw new Error("Unexpected API response format");
  } catch (error) {
    console.error("Hostaway API Error:", error);
    throw error;
  }
}

export async function fetchHostawayListings() {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${HOSTAWAY_API_BASE}/listings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Listings API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    throw error;
  }
}
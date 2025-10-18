// === Netlify Function Proxy for LotteryUpdate000.space ===
// URL format: /.netlify/functions/proxy?url=https://www.megamillions.com/...

export const handler = async (event) => {
  const targetUrl = event.queryStringParameters.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing ?url parameter" }),
    };
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "LotteryUpdate000.space Serverless Proxy",
      },
    });

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": response.headers.get("content-type") || "text/plain",
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

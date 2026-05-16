// functions/api/generate.js
// Cloudflare Pages Function - API 키를 안전하게 서버에서 처리

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS 헤더
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const { imageBase64, typeId, level, prompt } = body;

    const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API 키가 설정되지 않았습니다. Cloudflare 환경변수를 확인하세요." }),
        { status: 500, headers: corsHeaders }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1500,
        system: `너는 한국 수능/모의고사 영어 전문 출제 AI야. ${level} 수준에 맞는 고품질 변형 문제를 만들어. 
지문 내용을 정확히 파악하고, 실제 수능 형식과 동일하게 문제를 출제해. 
한국어로 문제 안내와 해설을 작성하고, 지문/보기는 원문 영어 그대로 활용해.`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "API 오류" }),
        { status: response.status, headers: corsHeaders }
      );
    }

    const text = data.content?.map((b) => b.text || "").join("") || "";
    return new Response(JSON.stringify({ result: text }), { headers: corsHeaders });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

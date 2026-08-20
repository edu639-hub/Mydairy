/**
 * Vercel Serverless Function: /api/analyze
 * Vercel 환경변수(process.env.GEMINI_API_KEY)를 읽어 구글 Gemini 3.6 Flash와 통신하는 백엔드 핸들러
 */

export default async function handler(req, res) {
    // CORS 헤더 설정 (모든 도메인 허용)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. POST 요청만 지원합니다.' });
    }

    try {
        const { text } = req.body || {};

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ error: '일기 내용(text)이 전달되지 않았습니다.' });
        }

        // Vercel 환경변수(GEMINI_API_KEY) 읽기
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'Vercel 서버의 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
                guide: 'Vercel 프로젝트 설정 > Environment Variables에서 GEMINI_API_KEY가 등록되어 있는지 확인해 주세요.'
            });
        }

        const prompt = `
당신은 사람들의 지친 마음을 다정하게 위로하고 깊이 공감해 주는 1:1 전문 심리상담 AI입니다.
사용자가 작성한 아래 일기 전체를 읽고, 일기에 등장하는 구체적인 행동, 사건, 인물, 그리고 마음의 결을 정밀하게 분석하여 따뜻한 공감 편지글을 작성해 주세요.

[사용자의 일기 내용]:
${text.trim()}

반드시 아래 JSON 형식으로만 순수하게 응답해 주세요:
{
  "emotionName": "일기 내용에 딱 맞는 구체적인 대표 감정 (예: 새로운 시작을 앞둔 긴장과 설렘, 친구와 함께한 다정한 온기, 지친 하루 끝의 나른한 휴식 등)",
  "emotionEmoji": "해당 감정을 가장 잘 나타내는 이모지 1개 (예: 🌸, 👭, ⏳, ☕, 🛋️, 🌤️, 🎬, 🔥, 🫂 등)",
  "emotionKey": "영문 감정 키 (joy, sadness, anger, anxiety, calmness, achievement 중 1개)",
  "feedbackMessage": "일기 속에 등장한 구체적인 내용과 작성자의 마음을 직접 언급하며 건네는 3~5문장의 따뜻하고 다정한 1:1 맞춤 심리상담 편지글 (존댓말 사용)",
  "aiTip": "💡 오늘 밤 실천할 수 있는 구체적인 힐링 팁 1줄"
}
`;

        const requestPayload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        };

        const endpoints = [
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            "https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-pro:generateContent",
            "https://generativelanguage.googleapis.com/v1/models/gemini-3.6-pro:generateContent"
        ];

        let lastGoogleError = null;

        // 1. URL 쿼리 파라미터 및 x-goog-api-key 헤더 방식 시도
        for (const baseUrl of endpoints) {
            try {
                const urlWithKey = `${baseUrl}?key=${apiKey}`;
                const googleResponse = await fetch(urlWithKey, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                    },
                    body: JSON.stringify(requestPayload)
                });

                if (googleResponse.ok) {
                    const data = await googleResponse.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawText) {
                        let cleaned = rawText.trim();
                        if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
                        else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
                        return res.status(200).json(JSON.parse(cleaned));
                    }
                } else {
                    const errData = await googleResponse.json().catch(() => ({}));
                    lastGoogleError = {
                        target: baseUrl,
                        auth: 'URL_KEY / x-goog-api-key',
                        status: googleResponse.status,
                        statusText: googleResponse.statusText,
                        details: errData
                    };
                }
            } catch (e) {
                lastGoogleError = { target: baseUrl, status: 'FetchError', message: e.message };
            }
        }

        // 2. Authorization: Bearer 헤더 방식 시도 (OAuth2 / Service Token 지원)
        for (const url of endpoints) {
            try {
                const googleResponse = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(requestPayload)
                });

                if (googleResponse.ok) {
                    const data = await googleResponse.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawText) {
                        let cleaned = rawText.trim();
                        if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
                        else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
                        return res.status(200).json(JSON.parse(cleaned));
                    }
                } else {
                    const errData = await googleResponse.json().catch(() => ({}));
                    lastGoogleError = {
                        target: url,
                        auth: 'Authorization: Bearer',
                        status: googleResponse.status,
                        statusText: googleResponse.statusText,
                        details: errData
                    };
                }
            } catch (e) {
                lastGoogleError = { target: url, status: 'FetchError', message: e.message };
            }
        }

        // 구글 서버 에러 전달
        const statusCode = (lastGoogleError?.status && typeof lastGoogleError.status === 'number') ? lastGoogleError.status : 500;
        return res.status(statusCode).json({
            error: 'Google Gemini 3.6 Flash 호출 실패',
            details: lastGoogleError
        });

    } catch (error) {
        return res.status(500).json({
            error: '서버 내부 처리 중 예외가 발생했습니다.',
            details: error.toString()
        });
    }
}

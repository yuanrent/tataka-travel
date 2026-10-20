import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '找不到 GEMINI_API_KEY' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { destination, days, style } = await request.json();

    const prompt = `你是一位專業旅遊顧問。請為我規劃前往 ${destination} 的 ${days} 天行程，旅遊風格為：${style}。
請直接輸出緊湊精簡的純 JSON 物件（嚴禁包含 markdown 標籤如 \`\`\`json）：
{
  "title": "${destination} ${days} 天自由行",
  "days": [
    {
      "day": 1,
      "spots": [
        {
          "name": "景點名稱",
          "time": "09:00",
          "description": "20字以內的推薦重點"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        // 將思考預算設為 0，關閉思考模式，實現秒級即時輸出
        thinkingConfig: {
          thinkingBudget: 0,
        },
        // 降低創造性以提高推論速度與穩定性
        temperature: 0.2,
      },
    });

    let rawText = response.text || '{}';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const itineraryData = JSON.parse(rawText);
    return NextResponse.json(itineraryData);
  } catch (error: any) {
    console.error('Gemini API 呼叫失敗：', error);
    return NextResponse.json({ error: error.message || '行程生成失敗' }, { status: 500 });
  }
}
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '找不到 GEMINI_API_KEY' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { destination, startDate, endDate, transport, style } = await request.json();

    const prompt = `你是一位專業旅遊規劃顧問。
使用者預計於 ${startDate} 至 ${endDate} 前往「${destination}」。
偏好交通工具：「${transport}」，風格為：「${style}」。

請提供：
1. 該日期區間內，${destination} 當地的特色節慶或當季亮點。
2. 每日行程，包含推薦遊玩時間、簡介與「${transport}」交通建議。
3. 景點名稱。

請直接輸出緊湊純 JSON（嚴禁包含 markdown 標籤如 \`\`\`json）：
{
  "title": "${destination} ${startDate} 至 ${endDate} 專屬行程",
  "festivals": [
    {
      "name": "節慶/盛事名稱",
      "date": "活動日期",
      "description": "30字以內亮點"
    }
  ],
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "spots": [
        {
          "name": "景點名稱",
          "time": "09:00",
          "description": "25字以內推薦重點",
          "transportTips": "交通建議"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // 使用配額更多且速度更快的模型
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
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

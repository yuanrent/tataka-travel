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

    const prompt = `你是一位專業旅遊規劃顧問。請為我規劃前往 ${destination} 的 ${days} 天行程，旅遊風格為：${style}。
請務必嚴格輸出為純 JSON 物件格式（不要包含任何 markdown 標記如 \`\`\`json 或其他文字），格式規範如下：
{
  "title": "${destination} ${days} 天自由行",
  "days": [
    {
      "day": 1,
      "spots": [
        {
          "name": "景點名稱",
          "time": "09:00",
          "description": "簡介與推薦重點"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let rawText = response.text || '{}';
    // 清理可能包含的 markdown 標籤
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const itineraryData = JSON.parse(rawText);
    return NextResponse.json(itineraryData);
  } catch (error: any) {
    console.error('Gemini API 呼叫失敗：', error);
    return NextResponse.json({ error: error.message || '行程生成失敗' }, { status: 500 });
  }
}
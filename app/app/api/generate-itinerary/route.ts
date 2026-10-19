import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { destination, days, style } = await request.json();

    const prompt = `請為我規劃前往 ${destination} 的 ${days} 天自由行行程，旅遊風格偏好為：${style}。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  spots: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        time: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const itineraryData = JSON.parse(response.text || '{}');
    return NextResponse.json(itineraryData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '行程生成失敗，請檢查 API Key' }, { status: 500 });
  }
}
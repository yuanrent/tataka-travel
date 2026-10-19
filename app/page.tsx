'use client';
import { useState } from 'react';

export default function Home() {
  const [destination, setDestination] = useState('東京');
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState('美食散策、輕鬆慢活');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, style }),
      });
      const data = await res.json();
      console.log('API 回傳資料：', data);
      setResult(data);
    } catch (err) {
      alert('生成失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 max-w-3xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">塔塔加 Tataka</h1>
        <p className="text-slate-500 mt-2">AI 自助旅行與社群布告欄平台</p>
      </header>

      {/* 輸入區塊 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">目的地</label>
          <input
            className="w-full border rounded-lg p-2.5 text-slate-800 bg-white"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="例如：京都、首爾、花蓮"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">天數</label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-full border rounded-lg p-2.5 text-slate-800 bg-white"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">偏好風格</label>
            <input
              className="w-full border rounded-lg p-2.5 text-slate-800 bg-white"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="例如：親子、徒步、逛街"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:bg-slate-400"
        >
          {loading ? 'AI 正在規劃專屬行程中...' : '生成專屬行程'}
        </button>
      </div>

      {/* 行程展示區塊 */}
      {result && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {result.title || `${destination} ${days} 天自由行`}
          </h2>
          
          <div className="space-y-6">
            {result.days && result.days.length > 0 ? (
              result.days.map((d: any, index: number) => (
                <div key={d.day || index} className="border-l-2 border-blue-500 pl-4 space-y-3">
                  <h3 className="font-semibold text-lg text-slate-800">
                    第 {d.day || index + 1} 天
                  </h3>
                  <div className="space-y-2">
                    {d.spots?.map((s: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {s.time || '景點'}
                          </span>
                          <span className="font-medium text-slate-800">{s.name || s.spot_name}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {s.description || s.notes || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // 容錯顯示：如果 AI 輸出純文字或非標準陣列，直接顯示回傳文字
              <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
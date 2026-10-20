'use client';

import { useState } from 'react';

interface Spot {
  name: string;
  time: string;
  description: string;
  transportTips?: string;
}

interface DayPlan {
  day: number;
  date?: string;
  spots: Spot[];
}

interface Festival {
  name: string;
  date: string;
  description: string;
}

interface ItineraryResponse {
  title: string;
  festivals?: Festival[];
  days: DayPlan[];
}

export default function Home() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transport, setTransport] = useState('大眾運輸 (捷運/公車/火車)');
  const [style, setStyle] = useState('深度文化與美食');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      alert('請填寫完整目的地與出發/結束日期！');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, startDate, endDate, transport, style }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (data.days?.[0]?.spots?.[0]?.name) {
          setSelectedSpot(data.days[0].spots[0].name);
        }
      } else {
        alert(data.error || '生成失敗，請稍後再試');
      }
    } catch (err) {
      alert('連線異常，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 max-w-6xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight">🏔️ 塔塔加 Tataka</h1>
        <p className="text-slate-600 mt-2 text-sm md:text-base">AI 自助旅行與社群布告欄平台</p>
      </header>

      {/* 表單區塊 */}
      <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">目的地</label>
            <input
              type="text"
              placeholder="例如：東京、京都、清邁"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">主要交通工具</label>
            <select
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="大眾運輸 (捷運/公車/火車)">🚇 大眾運輸 (捷運/公車/火車)</option>
              <option value="租車自駕">🚗 租車自駕</option>
              <option value="機車/單車慢活">🛵 機車 / 單車慢活</option>
              <option value="全程步行 / 城市散策">👟 全程步行 / 散策</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">出發日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">結束日期</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">偏好風格</label>
            <input
              type="text"
              placeholder="例如：美食散策、輕鬆慢活、親子遊"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? 'AI 正在為您搜集節慶與規劃路線中...' : '生成專屬行程'}
          </button>
        </form>
      </section>

      {/* 結果呈現區 */}
      {result && (
        <div className="space-y-8">
          {/* 節慶盛事 */}
          {result.festivals && result.festivals.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-amber-900 mb-3">
                🏮 旅程期間當地節慶與盛事亮點
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.festivals.map((fest, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-amber-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-amber-800">{fest.name}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {fest.date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{fest.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 行程與 Google Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              {result.days.map((d) => (
                <div key={d.day} className="bg-white border border-slate-200 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-emerald-800 border-b pb-3 mb-4">
                    Day {d.day} {d.date && <span className="text-sm text-slate-500 font-normal">({d.date})</span>}
                  </h3>
                  <div className="space-y-4">
                    {d.spots.map((spot, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => setSelectedSpot(spot.name)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedSpot === spot.name
                            ? 'border-blue-600 bg-blue-50/40'
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{spot.name}</span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {spot.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{spot.description}</p>
                        {spot.transportTips && (
                          <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            🚦 交通建議：{spot.transportTips}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Google Map 嵌入 */}
            <div className="lg:col-span-5 sticky top-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">📍 Google Map 導航</h3>
                  {selectedSpot && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        destination + ' ' + selectedSpot
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      開啟 Google Maps ↗
                    </a>
                  )}
                </div>
                <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    title="Google Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      destination + ' ' + (selectedSpot || destination)
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">點選左側景點即可切換地圖座標</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

import React, { useState, useEffect } from 'react';

function gregorianToHijri(year, month, day) {
  const jd1 = Math.floor((14 - month) / 12);
  const y = year + 4800 - jd1;
  const m = month + 12 * jd1 - 3;
  let J = day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100)
    + Math.floor(y / 400) - 32045;
  let l = J - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
    + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  return { hYear, hMonth, hDay };
}

const HIJRI_MONTHS = [
  "Muharram","Safar","Rabi al-Awwal","Rabi al-Thani",
  "Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban",
  "Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah"
];

const HIJRI_MONTHS_AR = [
  "محرم","صفر","ربيع الأول","ربيع الآخر",
  "جمادى الأولى","جمادى الآخرة","رجب","شعبان",
  "رمضان","شوال","ذو القعدة","ذو الحجة"
];

const FESTIVALS = [
  { name: "Islamic New Year", hDate: { m: 1, d: 1 }, desc: "1st of Muharram" },
  { name: "Mawlid al-Nabi", hDate: { m: 3, d: 12 }, desc: "12th of Rabi al-Awwal" },
  { name: "Isra and Mi'raj", hDate: { m: 7, d: 27 }, desc: "27th of Rajab" },
  { name: "Ramadan Begins", hDate: { m: 9, d: 1 }, desc: "1st of Ramadan" },
  { name: "Laylat al-Qadr", hDate: { m: 9, d: 27 }, desc: "27th of Ramadan" },
  { name: "Eid ul-Fitr", hDate: { m: 10, d: 1 }, desc: "1st of Shawwal" },
  { name: "Eid ul-Adha", hDate: { m: 12, d: 10 }, desc: "10th of Dhu al-Hijjah" },
];

function findHijriFestivalGregorian(targetHYear, targetHMonth, targetHDay, baseYear) {
  // Simple scan approach within a year range to find matching Hijri date
  const start = new Date(baseYear - 1, 0, 1);
  for (let i = 0; i < 730; i++) { // scan 2 years
    const d = new Date(start.getTime() + i * 86400000);
    const h = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
    if (h.hMonth === targetHMonth && h.hDay === targetHDay) {
      if (!targetHYear || h.hYear === targetHYear) {
        return d;
      }
    }
  }
  return null;
}

export default function IslamicCalendar() {
  const [activeTab, setActiveTab] = useState('converter');
  
  // Converter state
  const [calcDate, setCalcDate] = useState('');
  const [hijriResult, setHijriResult] = useState(null);

  // Today
  const today = new Date();
  const [todayHijri, setTodayHijri] = useState(null);

  // Festivals state
  const [festivals, setFestivals] = useState([]);
  const [festYear, setFestYear] = useState(today.getFullYear());
  const [festLoading, setFestLoading] = useState(false);

  useEffect(() => {
    const h = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setTodayHijri(h);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateDate = () => {
    if (!calcDate) return;
    const [y, m, d] = calcDate.split('-').map(Number);
    const res = gregorianToHijri(y, m, d);
    setHijriResult(res);
  };

  useEffect(() => {
    setFestLoading(true);
    setTimeout(() => {
      const results = [];
      FESTIVALS.forEach(f => {
        // Find gregorian date for this festival around festYear
        const dt = findHijriFestivalGregorian(null, f.hDate.m, f.hDate.d, festYear);
        if (dt) {
          results.push({ ...f, date: dt });
        }
      });
      results.sort((a,b) => a.date - b.date);
      setFestivals(results);
      setFestLoading(false);
    }, 100);
  }, [festYear]);

  return (
    <div className="max-w-2xl mx-auto rounded-2xl shadow-sm border border-emerald-200 bg-white overflow-hidden mt-6">
      
      {/* Header */}
      <div className="bg-emerald-700 text-white p-8 relative overflow-hidden">
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 font-serif leading-none select-none">☪</div>
        <h1 className="text-2xl font-serif mb-2 tracking-wide flex items-center gap-3">
          <span className="text-3xl">☪</span> Islamic Calendar (Hijri)
        </h1>
        {todayHijri && (
          <p className="text-emerald-100 text-sm font-light mt-3 py-2 px-4 bg-emerald-800/50 rounded-lg inline-block border border-emerald-600/50">
            Today: <span className="font-semibold text-white">{todayHijri.hDay} {HIJRI_MONTHS[todayHijri.hMonth - 1]} {todayHijri.hYear}</span> 
            <span className="ml-3 font-serif text-lg tracking-wider" dir="rtl">{HIJRI_MONTHS_AR[todayHijri.hMonth - 1]}</span>
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex border-b border-emerald-100 bg-emerald-50/30">
        <button 
          onClick={() => setActiveTab('converter')}
          className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'converter' ? 'text-emerald-700 border-emerald-700 bg-white' : 'text-slate-500 border-transparent hover:text-emerald-700 hover:bg-emerald-50'}`}
        >
          🔄 Date Converter
        </button>
        <button 
          onClick={() => setActiveTab('festivals')}
          className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'festivals' ? 'text-emerald-700 border-emerald-700 bg-white' : 'text-slate-500 border-transparent hover:text-emerald-700 hover:bg-emerald-50'}`}
        >
          📅 Islamic Festivals
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* CONVERTER TAB */}
        {activeTab === 'converter' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Gregorian to Hijri</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Convert any Gregorian date to the Islamic Hijri calendar format.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Select Date</label>
                <input 
                  type="date" 
                  value={calcDate}
                  onChange={e => { setCalcDate(e.target.value); setHijriResult(null); }}
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50"
                />
              </div>
              <button 
                onClick={calculateDate}
                disabled={!calcDate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-emerald-200/50 transition-all hover:-translate-y-0.5"
              >
                Convert to Hijri →
              </button>
            </div>

            {hijriResult && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200 mt-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hijri Equivalent</span>
                <div className="text-3xl font-bold text-emerald-700 mb-2">
                  {hijriResult.hDay} {HIJRI_MONTHS[hijriResult.hMonth - 1]} {hijriResult.hYear}
                </div>
                <div className="text-2xl font-serif text-emerald-800" dir="rtl">
                  {hijriResult.hDay} {HIJRI_MONTHS_AR[hijriResult.hMonth - 1]} {hijriResult.hYear}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FESTIVALS TAB */}
        {activeTab === 'festivals' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-slate-800">Islamic Holidays</h2>
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button onClick={() => setFestYear(y => y - 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all">❮</button>
                <span className="font-semibold text-slate-700 min-w-[3rem] text-center">{festYear}</span>
                <button onClick={() => setFestYear(y => y + 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all">❯</button>
              </div>
            </div>

            {festLoading ? (
              <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Calculating festival dates...</div>
            ) : (
              <div className="space-y-4">
                {festivals.map((f, i) => {
                  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                  return (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100 bg-white shadow-sm border-slate-100">
                      <div className="w-16 h-16 shrink-0 bg-emerald-50 rounded-xl border border-emerald-200/50 flex flex-col items-center justify-center pt-1 shadow-sm group-hover:shadow-md group-hover:bg-emerald-100/50 transition-all">
                        <span className="text-2xl font-bold text-emerald-600 leading-none">{f.date.getDate()}</span>
                        <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">{months[f.date.getMonth()]}</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-baseline gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800 text-base">{f.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">Hijri Date: {f.hDate.d} {HIJRI_MONTHS[f.hDate.m - 1]} • {f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

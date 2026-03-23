import React, { useState, useEffect } from 'react';

// --- Indian National Calendar (Saka) Calculator ---
function gregorianToSaka(year, month, day) {
  const SAKA_MONTHS = [
    "Chaitra","Vaishakha","Jyaistha","Ashadha","Shravana","Bhadra",
    "Asvina","Kartika","Agrahayana","Pausa","Magha","Phalguna"
  ];
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const dayOfYear = [0,31,isLeap?29:28,31,30,31,30,31,31,30,31,30,31]
    .slice(0, month).reduce((a,b) => a+b, 0) + day;
  const sakaYear = year - 78;
  let sakaMonth, sakaDay;
  const chatraStart = isLeap ? 80 : 81; // March 21 or 22
  if (dayOfYear >= chatraStart) {
    const d = dayOfYear - chatraStart;
    if (d < 30) { sakaMonth = 1; sakaDay = d + 1; }
    else if (d < 61) { sakaMonth = 2; sakaDay = d - 29; }
    else if (d < 92) { sakaMonth = 3; sakaDay = d - 60; }
    else if (d < 123) { sakaMonth = 4; sakaDay = d - 91; }
    else if (d < 154) { sakaMonth = 5; sakaDay = d - 122; }
    else if (d < 185) { sakaMonth = 6; sakaDay = d - 153; }
    else if (d < 215) { sakaMonth = 7; sakaDay = d - 184; }
    else if (d < 245) { sakaMonth = 8; sakaDay = d - 214; }
    else if (d < 275) { sakaMonth = 9; sakaDay = d - 244; }
    else if (d < 305) { sakaMonth = 10; sakaDay = d - 274; }
    else if (d < 335) { sakaMonth = 11; sakaDay = d - 304; }
    else { sakaMonth = 12; sakaDay = d - 334; }
  } else {
    sakaMonth = 12; sakaDay = dayOfYear + (isLeap ? 6 : 5); // Dec shift
  }
  return { sakaYear: sakaMonth === 12 && dayOfYear < chatraStart ? sakaYear - 1 : sakaYear, sakaMonth: SAKA_MONTHS[sakaMonth - 1], sakaDay };
}

// --- Hijri Logic to find Eid ---
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

function findHijriFestivalGregorian(targetHMonth, targetHDay, baseYear) {
  const start = new Date(baseYear - 1, 0, 1);
  for (let i = 0; i < 730; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    if (d.getFullYear() === baseYear) {
      const h = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
      if (h.hMonth === targetHMonth && h.hDay === targetHDay) return d;
    }
  }
  return null;
}

// --- Tithi Logic to find Holi/Diwali/Dussehra ---
function toJD(year, month, day, hour = 12) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}
function norm360(x) { return ((x % 360) + 360) % 360; }
function ayanamsa(jd) { const T = (jd - 2451545.0) / 36525; return 23.85 + 0.013604167 * T * 100; }
function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M = norm360(357.52911 + 35999.05029 * T);
  const Mr = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr);
  return norm360(L0 + C);
}
function moonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const Lp = norm360(218.3164477 + 481267.88123421 * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T);
  const D = norm360(297.8501921 + 445267.1114034 * T);
  return norm360(Lp + 6.288774 * Math.sin(Mp * Math.PI/180) + 1.274027 * Math.sin((2*D - Mp) * Math.PI/180) + 0.658314 * Math.sin(2*D * Math.PI/180));
}
function getTithi(jd) {
  return Math.floor(norm360(norm360(moonLongitude(jd) - ayanamsa(jd)) - norm360(sunLongitude(jd) - ayanamsa(jd))) / 12) + 1;
}
function fromJD(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E) + f;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  return { year, month, day: Math.floor(day) };
}

function findHinduFestivalDate(year, tithi, teluguMonth) {
  const startJD = toJD(year, 1, 1, 6);
  for (let offset = 0; offset < 400; offset++) {
    const jd = startJD + offset;
    const t = getTithi(jd);
    if (t === tithi) {
      const sunRashi = Math.floor(norm360(sunLongitude(jd) - ayanamsa(jd)) / 30) % 12;
      if (sunRashi === teluguMonth) {
        const { year: y, month: m, day: d } = fromJD(jd);
        if (y === year) return new Date(y, m - 1, d);
      }
    }
  }
  return null;
}

export default function IndianCalendar() {
  const [activeTab, setActiveTab] = useState('converter');
  
  // Converter state
  const [calcDate, setCalcDate] = useState('');
  const [sakaResult, setSakaResult] = useState(null);

  // Today
  const today = new Date();
  const [todaySaka, setTodaySaka] = useState(null);

  // Festivals state
  const [holidays, setHolidays] = useState([]);
  const [festYear, setFestYear] = useState(today.getFullYear());
  const [festLoading, setFestLoading] = useState(false);

  useEffect(() => {
    const s = gregorianToSaka(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setTodaySaka(s);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateDate = () => {
    if (!calcDate) return;
    const [y, m, d] = calcDate.split('-').map(Number);
    const res = gregorianToSaka(y, m, d);
    setSakaResult(res);
  };

  useEffect(() => {
    setFestLoading(true);
    setTimeout(() => {
      const staticHolidays = [
        { name: "Republic Day", date: new Date(festYear, 0, 26) },
        { name: "Independence Day", date: new Date(festYear, 7, 15) },
        { name: "Gandhi Jayanti", date: new Date(festYear, 9, 2) },
        { name: "Christmas", date: new Date(festYear, 11, 25) },
      ];

      const eid = findHijriFestivalGregorian(10, 1, festYear);
      if (eid) staticHolidays.push({ name: "Eid ul-Fitr", date: eid });

      const holi = findHinduFestivalDate(festYear, 15, 11);
      if (holi) staticHolidays.push({ name: "Holi", date: holi });

      const dussehra = findHinduFestivalDate(festYear, 10, 6);
      if (dussehra) staticHolidays.push({ name: "Dussehra", date: dussehra });

      const diwali = findHinduFestivalDate(festYear, 29, 6);
      if (diwali) staticHolidays.push({ name: "Diwali", date: diwali });

      staticHolidays.sort((a,b) => a.date - b.date);
      setHolidays(staticHolidays);
      setFestLoading(false);
    }, 100);
  }, [festYear]);

  return (
    <div className="max-w-2xl mx-auto rounded-2xl shadow-sm border border-blue-200 bg-white overflow-hidden mt-6">
      
      {/* Header */}
      <div className="bg-blue-800 text-white p-8 relative overflow-hidden">
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 font-serif leading-none select-none">🇮🇳</div>
        <h1 className="text-2xl font-serif mb-2 tracking-wide flex items-center gap-3">
          <span className="text-3xl">🇮🇳</span> Indian National Calendar (Saka)
        </h1>
        {todaySaka && (
          <p className="text-blue-100 text-sm font-light mt-3 py-2 px-4 bg-blue-900/50 rounded-lg inline-block border border-blue-600/50">
            Today: <span className="font-semibold text-white">{todaySaka.sakaDay} {todaySaka.sakaMonth} {todaySaka.sakaYear} Saka Era</span>
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex border-b border-blue-100 bg-blue-50/30">
        <div className="flex border-b border-blue-100 bg-blue-50/30 w-full">
          <button 
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'converter' ? 'text-blue-700 border-blue-700 bg-white' : 'text-slate-500 border-transparent hover:text-blue-700 hover:bg-blue-50'}`}
          >
            🔄 Convert to Saka
          </button>
          <button 
            onClick={() => setActiveTab('festivals')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'festivals' ? 'text-blue-700 border-blue-700 bg-white' : 'text-slate-500 border-transparent hover:text-blue-700 hover:bg-blue-50'}`}
          >
            🎡 National Holidays
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* CONVERTER TAB */}
        {activeTab === 'converter' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Gregorian to Saka Converter</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Convert any Gregorian date to the official Indian National Calendar (Saka Samvat).
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Select Date</label>
                <input 
                  type="date" 
                  value={calcDate}
                  onChange={e => { setCalcDate(e.target.value); setSakaResult(null); }}
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
                />
              </div>
              <button 
                onClick={calculateDate}
                disabled={!calcDate}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-blue-200/50 transition-all hover:-translate-y-0.5"
              >
                Convert to Saka →
              </button>
            </div>

            {sakaResult && (
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200 mt-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Saka Equivalent</span>
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {sakaResult.sakaDay} {sakaResult.sakaMonth} {sakaResult.sakaYear}
                </div>
                <div className="text-sm text-blue-600/80 uppercase tracking-widest font-medium">Saka Era</div>
              </div>
            )}
          </div>
        )}

        {/* FESTIVALS TAB */}
        {activeTab === 'festivals' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-slate-800">National Holidays</h2>
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button onClick={() => setFestYear(y => y - 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all">❮</button>
                <span className="font-semibold text-slate-700 min-w-[3rem] text-center">{festYear}</span>
                <button onClick={() => setFestYear(y => y + 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all">❯</button>
              </div>
            </div>

            {festLoading ? (
              <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Calculating holiday dates...</div>
            ) : (
              <div className="space-y-4">
                {holidays.map((h, i) => {
                  const s = gregorianToSaka(h.date.getFullYear(), h.date.getMonth() + 1, h.date.getDate());
                  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                  return (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100 bg-white shadow-sm border-slate-100">
                      <div className="w-16 h-16 shrink-0 bg-blue-50 rounded-xl border border-blue-200/50 flex flex-col items-center justify-center pt-1 shadow-sm group-hover:shadow-md group-hover:bg-blue-100/50 transition-all">
                        <span className="text-2xl font-bold text-blue-600 leading-none">{h.date.getDate()}</span>
                        <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest mt-1">{months[h.date.getMonth()]}</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-baseline gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800 text-base">{h.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">Saka Date: {s.sakaDay} {s.sakaMonth} {s.sakaYear}</p>
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

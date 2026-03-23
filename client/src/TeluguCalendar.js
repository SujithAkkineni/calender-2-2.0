import React, { useState, useEffect } from 'react';

// Jean Meeus astronomical algorithms
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
function getNakshatra(jd) {
  return Math.floor(norm360(moonLongitude(jd) - ayanamsa(jd)) / (360 / 27));
}

const TITHI_NAMES_TEL = ["పాడ్యమి","విదియ","తదియ","చవితి","పంచమి","షష్టి","సప్తమి","అష్టమి","నవమి","దశమి","ఏకాదశి","ద్వాదశి","త్రయోదశి","చతుర్దశి","పౌర్ణమి"];
const NAKSHATRA_NAMES = ["అశ్విని","భరణి","కృత్తిక","రోహిణి","మృగశిర","ఆర్ద్ర","పునర్వసు","పుష్యమి","ఆశ్లేష","మఘ","పూర్వఫల్గుణి","ఉత్తరఫల్గుణి","హస్త","చిత్త","స్వాతి","విశాఖ","అనూరాధ","జ్యేష్ఠ","మూల","పూర్వాషాఢ","ఉత్తరాషాఢ","శ్రవణం","ధనిష్ఠ","శతభిషం","పూర్వాభాద్ర","ఉత్తరాభాద్ర","రేవతి"];
const TELUGU_MONTHS = ["చైత్రం","వైశాఖం","జ్యేష్ఠం","ఆషాఢం","శ్రావణం","భాద్రపదం","ఆశ్వయుజం","కార్తీకం","మార్గశిరం","పుష్యం","మాఘం","ఫాల్గుణం"];

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

function getTeluguMonth(jd) {
  const sunLon = norm360(sunLongitude(jd) - ayanamsa(jd));
  return TELUGU_MONTHS[Math.floor(sunLon / 30) % 12];
}


const FESTIVAL_DEFS = [
  { name: "Ugadi", nameT: "ఉగాది", desc: "Telugu New Year – Chaitra Shukla Pratipada", tithi: 1, month: 0, tag: "major" },
  { name: "Sri Rama Navami", nameT: "శ్రీరామ నవమి", desc: "Birth of Lord Rama – Chaitra Shukla Navami", tithi: 9, month: 0, tag: "major" },
  { name: "Hanuman Jayanti", nameT: "హనుమాన్ జయంతి", desc: "Chaitra Shukla Purnima", tithi: 15, month: 0, tag: "festival" },
  { name: "Akshaya Tritiya", nameT: "అక్షయ తృతీయ", desc: "Vaishakha Shukla Tritiya", tithi: 3, month: 1, tag: "festival" },
  { name: "Vaikunta Ekadashi", nameT: "వైకుంఠ ఏకాదశి", desc: "Margashirsha Shukla Ekadashi", tithi: 11, month: 8, tag: "major" },
  { name: "Vinayaka Chaturthi", nameT: "వినాయక చవితి", desc: "Bhadrapada Shukla Chaturthi", tithi: 4, month: 5, tag: "major" },
  { name: "Mahalaya Amavasya", nameT: "మహాలయ అమావాస్య", desc: "Bhadrapada Krishna Amavasya", tithi: 30, month: 5, tag: "vrat" },
  { name: "Navaratri Begins", nameT: "నవరాత్రులు", desc: "Ashwina Shukla Pratipada", tithi: 1, month: 6, tag: "major" },
  { name: "Dussehra / Vijayadashami", nameT: "దసరా / విజయదశమి", desc: "Ashwina Shukla Dashami", tithi: 10, month: 6, tag: "major" },
  { name: "Deepavali / Naraka Chaturdashi", nameT: "దీపావళి", desc: "Ashwina Krishna Chaturdashi", tithi: 29, month: 6, tag: "major" },
  { name: "Kartika Pournami", nameT: "కార్తీక పౌర్ణమి", desc: "Kartika Shukla Purnima", tithi: 15, month: 7, tag: "festival" },
  { name: "Karthika Somavaram", nameT: "కార్తీక సోమవారం", desc: "Kartika month Mondays – especially auspicious for Shiva worship", tithi: null, month: 7, tag: "vrat", specialDay: 1 },
  { name: "Makara Sankranti", nameT: "మకర సంక్రాంతి", desc: "Sun enters Capricorn – Solar festival", tithi: null, month: -1, tag: "major", solarDate: { m: 1, d: 14 } },
  { name: "Shivaratri", nameT: "మహా శివరాత్రి", desc: "Magha/Phalguna Krishna Chaturdashi", tithi: 29, month: 10, tag: "major" },
  { name: "Holi / Kamadahana", nameT: "హోలీ / కామదహనం", desc: "Phalguna Shukla Purnima", tithi: 15, month: 11, tag: "festival" },
  { name: "Ekadashi (Vaikunta)", nameT: "ఏకాదశి వ్రతం", desc: "Every Shukla Ekadashi – major vrat day", tithi: 11, month: -1, tag: "vrat", everyMonth: true },
];

const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_EN_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function findFestivalDate(year, tithi, teluguMonth, solarDate) {
  if (solarDate) {
    return new Date(year, solarDate.m - 1, solarDate.d);
  }
  const startJD = toJD(year, 1, 1, 6);
  for (let offset = 0; offset < 400; offset++) {
    const jd = startJD + offset;
    const t = getTithi(jd);
    if (t === tithi) {
      if (teluguMonth === -1) {
        const { year: y, month: m, day: d } = fromJD(jd);
        return new Date(y, m - 1, d);
      }
      const sunRashi = Math.floor(norm360(sunLongitude(jd) - ayanamsa(jd)) / 30) % 12;
      if (sunRashi === teluguMonth) {
        const { year: y, month: m, day: d } = fromJD(jd);
        return new Date(y, m - 1, d);
      }
    }
  }
  return null;
}

export default function TeluguCalendar() {
  const [activeTab, setActiveTab] = useState('birthday');
  
  // Birthday state
  const [dob, setDob] = useState('');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [bdayResult, setBdayResult] = useState(null);
  const [bdayLoading, setBdayLoading] = useState(false);
  const [bdayError, setBdayError] = useState('');

  // Festivals state
  const [currentFestYear, setCurrentFestYear] = useState(new Date().getFullYear());
  const [festivals, setFestivals] = useState({});
  const [festLoading, setFestLoading] = useState(false);

  const calculateBirthday = () => {
    setBdayResult(null);
    setBdayError('');
    if (!dob) {
      setBdayError('Please enter your date of birth.');
      return;
    }

    setBdayLoading(true);
    setTimeout(() => {
      try {
        const [y, m, d] = dob.split('-').map(Number);
        const birthJD = toJD(y, m, d, 6);
        const birthTithi = getTithi(birthJD);
        const birthNakshatra = getNakshatra(birthJD);
        
        const birthPaksha = birthTithi <= 15 ? 'Shukla Paksha (శుక్ల పక్షం)' : 'Krishna Paksha (కృష్ణ పక్షం)';
        const tithiInPaksha = birthTithi <= 15 ? birthTithi : birthTithi - 15;
        const tithiName = TITHI_NAMES_TEL[Math.min(tithiInPaksha - 1, 14)];

        const annivApprox = toJD(targetYear, m, d, 6);
        let bestJD = null;
        let bestDiff = 999;

        for (let offset = -45; offset <= 45; offset++) {
          const testJD = annivApprox + offset;
          const testTithi = getTithi(testJD);
          if (testTithi === birthTithi) {
            const diff = Math.abs(offset);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestJD = testJD;
            }
          }
        }

        if (!bestJD) {
          const startJD = toJD(targetYear, 1, 1, 6);
          for (let offset = 0; offset < 365; offset++) {
            const testJD = startJD + offset;
            if (getTithi(testJD) === birthTithi) {
              bestJD = testJD;
              break;
            }
          }
        }

        setBdayResult({
          tithiText: `${tithiInPaksha} – ${tithiName}`,
          pakshaText: birthPaksha,
          nakshatraText: NAKSHATRA_NAMES[birthNakshatra] || 'Unknown',
          monthText: getTeluguMonth(birthJD),
          targetYear,
          bestJD,
          matchInfo: `Tithi: ${tithiName} (${birthPaksha.split(' ')[0]} ${birthPaksha.split(' ')[1]})`
        });
      } catch (e) {
        setBdayError('Error in calculation: ' + e.message);
      } finally {
        setBdayLoading(false);
      }
    }, 100);
  };

  const loadFestivals = (year) => {
    setFestLoading(true);
    setTimeout(() => {
      const results = [];
      FESTIVAL_DEFS.forEach(f => {
        if (f.everyMonth) return;
        let date = null;
        if (f.solarDate) {
          date = new Date(year, f.solarDate.m - 1, f.solarDate.d);
        } else if (f.tithi !== null) {
          date = findFestivalDate(year, f.tithi, f.month);
        } else if (f.specialDay === 1) {
          const startJD = toJD(year, 1, 1, 6);
          for (let offset = 0; offset < 400; offset++) {
            const jd = startJD + offset;
            const sunRashi = Math.floor(norm360(sunLongitude(jd) - ayanamsa(jd)) / 30) % 12;
            if (sunRashi === f.month) {
              const { year: y, month: m, day: d } = fromJD(jd);
              const dt = new Date(y, m - 1, d);
              if (dt.getDay() === 1) { date = dt; break; }
            }
          }
        }
        if (date && date.getFullYear() === year) {
          results.push({ ...f, date });
        }
      });

      results.sort((a, b) => a.date - b.date);

      const byMonth = {};
      results.forEach(r => {
        const key = r.date.getMonth();
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(r);
      });

      setFestivals(byMonth);
      setFestLoading(false);
    }, 100);
  };

  useEffect(() => {
    if (activeTab === 'festivals') {
      loadFestivals(currentFestYear);
    }
  }, [activeTab, currentFestYear]);

  return (
    <div className="max-w-2xl mx-auto rounded-2xl shadow-sm border border-orange-200 bg-white overflow-hidden mt-6">
      
      {/* Header */}
      <div className="bg-orange-600 text-white p-8 relative overflow-hidden">
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 font-serif leading-none select-none">ఓం</div>
        <h1 className="text-2xl font-serif mb-2 tracking-wide flex items-center gap-3">
          <span className="text-3xl">🗓</span> తెలుగు పంచాంగం
        </h1>
        <p className="text-orange-100/90 text-sm font-light">Telugu Calendar · Tithi · Nakshatra · Festivals</p>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-orange-100 bg-orange-50/30">
        <button 
          onClick={() => setActiveTab('birthday')}
          className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'birthday' ? 'text-orange-600 border-orange-600 bg-white' : 'text-slate-500 border-transparent hover:text-orange-600 hover:bg-orange-50'}`}
        >
          🎂 Telugu Birthday
        </button>
        <button 
          onClick={() => setActiveTab('festivals')}
          className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'festivals' ? 'text-orange-600 border-orange-600 bg-white' : 'text-slate-500 border-transparent hover:text-orange-600 hover:bg-orange-50'}`}
        >
          🪔 Festivals
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* BIRTHDAY TAB */}
        {activeTab === 'birthday' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Find Your Telugu Birthday</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                In Telugu tradition, your birthday is celebrated on the same <strong className="text-orange-600">Tithi</strong> (lunar day) 
                each year instead of the Gregorian date.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Find For Year</label>
                <select 
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-slate-50"
                >
                  {[...Array(7)].map((_, i) => {
                    const y = new Date().getFullYear() - 1 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
              <button 
                onClick={calculateBirthday}
                disabled={bdayLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-orange-200/50 transition-all hover:-translate-y-0.5"
              >
                {bdayLoading ? 'Calculating...' : 'Find Telugu Birthday →'}
              </button>
            </div>

            {bdayError && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{bdayError}</div>}

            {bdayResult && (
              <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">Your Birth Details</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tithi (తిథి)</label>
                    <span className="text-slate-800 font-medium">{bdayResult.tithiText}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paksha</label>
                    <span className="text-slate-800 font-medium">{bdayResult.pakshaText}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nakshatra (నక్షత్రం)</label>
                    <span className="text-slate-800 font-serif text-lg">{bdayResult.nakshatraText}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telugu Month</label>
                    <span className="text-slate-800 font-serif text-lg">{bdayResult.monthText}</span>
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Telugu Birthday in {bdayResult.targetYear}</label>
                  {bdayResult.bestJD ? (() => {
                    const { year: ry, month: rm, day: rd } = fromJD(bdayResult.bestJD);
                    const dateObj = new Date(ry, rm - 1, rd);
                    return (
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {rd} {dateObj.toLocaleDateString('en-IN', { month: 'long' })} {ry}
                          <span className="text-sm font-normal text-slate-500 ml-3">
                            {dateObj.toLocaleDateString('en-IN', { weekday: 'long' })}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">{bdayResult.matchInfo}</div>
                      </div>
                    );
                  })() : (
                    <div className="text-slate-500">Could not find matching tithi in {bdayResult.targetYear}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FESTIVALS TAB */}
        {activeTab === 'festivals' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-xs text-orange-800 mb-6 flex gap-3 leading-relaxed">
              <span className="text-base leading-none">ℹ️</span>
              Dates are calculated using lunisolar tithi positions and are approximate (±1 day). For precise muhurtam, consult a local jyothishyudu.
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-slate-800">Telugu Festivals</h2>
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button onClick={() => setCurrentFestYear(y => y - 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all">❮</button>
                <span className="font-semibold text-slate-700 min-w-[3rem] text-center">{currentFestYear}</span>
                <button onClick={() => setCurrentFestYear(y => y + 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all">❯</button>
              </div>
            </div>

            {festLoading ? (
              <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Calculating festival dates...</div>
            ) : Object.keys(festivals).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No festivals calculated for this year.</div>
            ) : (
              <div className="space-y-8">
                {Object.keys(festivals).sort((a,b) => Number(a)-Number(b)).map(mKey => (
                  <div key={mKey}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                      {MONTHS_EN_FULL[mKey]} {currentFestYear}
                    </div>
                    <div className="space-y-4">
                      {festivals[mKey].map((f, i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                          <div className="w-14 h-14 shrink-0 bg-yellow-50 rounded-xl border border-yellow-200/50 flex flex-col items-center justify-center pt-1.5 shadow-sm group-hover:shadow-md group-hover:bg-yellow-100/50 transition-all">
                            <span className="text-xl font-bold text-yellow-600 leading-none">{f.date.getDate()}</span>
                            <span className="text-[9px] font-bold text-yellow-600/60 uppercase tracking-widest mt-1">{MONTHS_EN[f.date.getMonth()]}</span>
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{f.name}</h4>
                              <span className="font-serif text-[13px] text-slate-500">{f.nameT}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                f.tag === 'major' ? 'bg-orange-100 text-orange-600' :
                                f.tag === 'festival' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-indigo-50 text-indigo-500'
                              }`}>
                                {f.tag}
                              </span>
                              <p className="text-xs text-slate-500 leading-snug">{f.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Built with Jean Meeus Astronomical Algorithms</p>
      </div>
    </div>
  );
}

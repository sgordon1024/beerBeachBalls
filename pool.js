/* Beerbeachballs pick'em: shared data + engine. To add an entry, paste its BBBCODE line into ENTRIES. */
/* Games in kickoff order. Records/ranks/spreads pulled from ESPN on Sept 21 —
   refresh before Saturday. rank = current AP Top 25. spread null = no line (small schools). */
const GAMES = [
  { id:'vt-bc',    espnId:'401858242', time:'12:00 PM', spread:'VT -14',    away:{tid:'259', name:'Virginia Tech',  rec:'3-0', rank:null}, home:{tid:'103', name:'Boston College', rec:'2-1', rank:null} },
  { id:'cnu-sus',  espnId:'401908704', time:'12:00 PM', spread:null,        away:{tid:'3112',name:'Chris Newport',  rec:'2-0', rank:null}, home:{tid:'216', name:'Susquehanna',    rec:'3-0', rank:null} },
  { id:'tex-tenn', espnId:'401856704', time:'12:00 PM', spread:'TEX -4.5',  away:{tid:'251', name:'Texas',          rec:'3-0', rank:1},    home:{tid:'2633',name:'Tennessee',      rec:'3-0', rank:14} },
  { id:'ucla-md',  espnId:'401858462', time:'1:30 PM',  spread:'UCLA -1.5', away:{tid:'26',  name:'UCLA',           rec:'3-0', rank:null}, home:{tid:'120', name:'Maryland',       rec:'2-1', rank:null} },
  { id:'nd-pur',   espnId:'401858467', time:'2:00 PM',  spread:'ND -27.5',  away:{tid:'87',  name:'Notre Dame',     rec:'3-0', rank:3},    home:{tid:'2509',name:'Purdue',         rec:'1-2', rank:null} },
  { id:'ou-uga',   espnId:'401856700', time:'3:30 PM',  spread:'UGA -14',   away:{tid:'201', name:'Oklahoma',       rec:'2-1', rank:null}, home:{tid:'61',  name:'Georgia',        rec:'3-0', rank:2} },
  { id:'iowa-mich',espnId:'401858463', time:'3:30 PM',  spread:'MICH -5.5', away:{tid:'2294',name:'Iowa',           rec:'3-0', rank:17},   home:{tid:'130', name:'Michigan',       rec:'3-0', rank:18} },
  { id:'tcu-ucf',  espnId:'401856815', time:'3:30 PM',  spread:'TCU -3',    away:{tid:'2628',name:'TCU',            rec:'2-1', rank:null}, home:{tid:'2116',name:'UCF',            rec:'2-1', rank:null} },
  { id:'van-aub',  espnId:'401856698', time:'4:15 PM',  spread:'AUB -9.5',  away:{tid:'238', name:'Vanderbilt',     rec:'3-0', rank:null}, home:{tid:'2',   name:'Auburn',         rec:'2-1', rank:null} },
  { id:'jmu-odu',  espnId:'401869961', time:'6:00 PM',  spread:'JMU -6',    away:{tid:'256', name:'James Madison',  rec:'3-0', rank:null}, home:{tid:'295', name:'Old Dominion',   rec:'1-2', rank:null} },
  { id:'okst-wvu', espnId:'401856881', time:'7:00 PM',  spread:'WVU -2.5',  away:{tid:'197', name:'Oklahoma St',    rec:'2-1', rank:null}, home:{tid:'277', name:'West Virginia',  rec:'3-0', rank:null} },
  { id:'tam-lsu',  espnId:'401856702', time:'7:30 PM',  spread:'LSU -9.5',  away:{tid:'245', name:'Texas A&M',      rec:'2-1', rank:23},   home:{tid:'99',  name:'LSU',            rec:'2-1', rank:10} },
  { id:'ore-usc',  espnId:'401858469', time:'7:30 PM',  spread:'ORE -3',    away:{tid:'2483',name:'Oregon',         rec:'2-1', rank:20},   home:{tid:'30',  name:'USC',            rec:'4-0', rank:12} },
  { id:'hcu-unt',  espnId:'401862783', time:'7:30 PM',  spread:null,        away:{tid:'2277',name:'Hou Christian',  rec:'2-2', rank:null}, home:{tid:'249', name:'North Texas',    rec:'1-2', rank:null} },
  { id:'tlsa-ark', espnId:'401856697', time:'8:00 PM',  spread:'ARK -6.5',  away:{tid:'202', name:'Tulsa',          rec:'3-0', rank:null}, home:{tid:'8',   name:'Arkansas',       rec:'1-2', rank:null} },
];

const ENTRIES = [
  'BBBCODE|Uncle Iroh|hcu-unt=249@15,nd-pur=87@14,vt-bc=259@13,ou-uga=61@12,tam-lsu=99@11,van-aub=2@10,tlsa-ark=8@9,jmu-odu=256@8,tcu-ucf=2628@7,tex-tenn=251@6,okst-wvu=197@5,ore-usc=30@4,iowa-mich=2294@3,ucla-md=120@2,cnu-sus=216@1',
  'BBBCODE|Hor Hey|vt-bc=259@15,cnu-sus=216@14,nd-pur=2509@13,ucla-md=26@12,tex-tenn=251@11,ou-uga=61@10,iowa-mich=130@9,tcu-ucf=2116@8,van-aub=238@7,jmu-odu=256@6,tam-lsu=245@5,okst-wvu=277@4,ore-usc=2483@3,hcu-unt=249@2,tlsa-ark=8@1',
  'BBBCODE|TheToddFather|nd-pur=87@15,vt-bc=259@14,tam-lsu=99@13,jmu-odu=256@12,ou-uga=61@11,ore-usc=30@10,tcu-ucf=2628@9,tlsa-ark=8@8,iowa-mich=130@7,van-aub=2@6,tex-tenn=2633@5,ucla-md=120@4,okst-wvu=277@3,hcu-unt=249@2,cnu-sus=216@1',
  'BBBCODE|Jamison Ford|vt-bc=259@15,van-aub=2@14,nd-pur=87@13,tcu-ucf=2116@12,ou-uga=61@11,jmu-odu=256@10,ucla-md=26@9,ore-usc=30@8,hcu-unt=249@7,tex-tenn=251@6,okst-wvu=197@5,iowa-mich=2294@4,tam-lsu=99@3,cnu-sus=216@2,tlsa-ark=202@1',
  'BBBCODE|Justin|nd-pur=87@15,hcu-unt=249@14,ou-uga=61@13,vt-bc=259@12,van-aub=2@11,jmu-odu=256@10,iowa-mich=130@9,tex-tenn=251@8,tlsa-ark=8@7,tcu-ucf=2628@6,okst-wvu=197@5,ucla-md=120@4,tam-lsu=99@3,ore-usc=30@2,cnu-sus=3112@1',
  'BBBCODE|Todd’s submissive cub|cnu-sus=3112@15,vt-bc=259@14,tex-tenn=2633@13,ucla-md=120@12,nd-pur=87@11,ou-uga=61@10,iowa-mich=130@9,tcu-ucf=2628@8,van-aub=2@7,jmu-odu=256@6,okst-wvu=197@5,tam-lsu=245@4,ore-usc=2483@3,hcu-unt=2277@2,tlsa-ark=8@1',
  'BBBCODE|Roman|nd-pur=87@15,okst-wvu=197@14,vt-bc=259@13,tex-tenn=2633@12,ucla-md=26@11,cnu-sus=3112@10,tam-lsu=99@9,ou-uga=61@8,iowa-mich=2294@7,tcu-ucf=2628@6,van-aub=2@5,jmu-odu=256@4,ore-usc=30@3,hcu-unt=249@2,tlsa-ark=202@1',
  'BBBCODE|The Lord|nd-pur=87@15,jmu-odu=256@14,ou-uga=61@13,cnu-sus=3112@12,tex-tenn=251@11,ucla-md=26@10,iowa-mich=130@9,vt-bc=259@8,tcu-ucf=2116@7,van-aub=2@6,okst-wvu=277@5,tam-lsu=245@4,ore-usc=2483@3,hcu-unt=249@2,tlsa-ark=8@1',
  'BBBCODE|Marci|nd-pur=87@15,ou-uga=61@14,tam-lsu=99@13,van-aub=2@12,tex-tenn=251@11,ore-usc=2483@10,iowa-mich=2294@9,tlsa-ark=8@8,jmu-odu=256@7,okst-wvu=277@6,vt-bc=259@5,tcu-ucf=2628@4,ucla-md=26@3,hcu-unt=249@2,cnu-sus=216@1',
  'BBBCODE|Robert Reed|hcu-unt=249@15,nd-pur=87@14,ou-uga=61@13,ucla-md=120@12,tcu-ucf=2628@11,cnu-sus=3112@10,tex-tenn=251@9,iowa-mich=130@8,van-aub=2@7,ore-usc=2483@6,vt-bc=259@5,tlsa-ark=8@4,jmu-odu=256@3,okst-wvu=277@2,tam-lsu=245@1',
  'BBBCODE|DiSalvo|nd-pur=87@15,ou-uga=61@14,tex-tenn=251@13,tam-lsu=99@12,jmu-odu=256@11,tlsa-ark=202@10,vt-bc=259@9,tcu-ucf=2116@8,van-aub=2@7,hcu-unt=2277@6,cnu-sus=3112@5,ucla-md=120@4,iowa-mich=130@3,okst-wvu=197@2,ore-usc=2483@1',
  'BBBCODE|Bernie|nd-pur=87@15,ou-uga=61@14,vt-bc=259@13,tam-lsu=99@12,van-aub=2@11,tlsa-ark=8@10,iowa-mich=130@9,cnu-sus=216@8,ucla-md=120@7,tex-tenn=2633@6,okst-wvu=277@5,jmu-odu=256@4,ore-usc=2483@3,tcu-ucf=2628@2,hcu-unt=249@1',
  'BBBCODE|Phil|nd-pur=87@15,ou-uga=61@14,vt-bc=259@13,tex-tenn=251@12,jmu-odu=256@11,tam-lsu=99@10,hcu-unt=249@9,iowa-mich=130@8,okst-wvu=277@7,van-aub=2@6,cnu-sus=216@5,tlsa-ark=202@4,tcu-ucf=2116@3,ucla-md=26@2,ore-usc=2483@1',
  'BBBCODE|Papa Gordon|nd-pur=87@15,hcu-unt=249@14,ou-uga=61@13,vt-bc=259@12,van-aub=2@11,tam-lsu=99@10,jmu-odu=256@9,tlsa-ark=8@8,iowa-mich=130@7,tex-tenn=251@6,tcu-ucf=2628@5,okst-wvu=277@4,ore-usc=2483@3,ucla-md=26@2,cnu-sus=216@1',
  'BBBCODE|Stinnie|nd-pur=87@15,ou-uga=61@14,tex-tenn=251@13,ucla-md=26@12,vt-bc=259@11,tcu-ucf=2628@10,iowa-mich=2294@9,van-aub=238@8,okst-wvu=277@7,tam-lsu=99@6,ore-usc=30@5,tlsa-ark=8@4,jmu-odu=256@3,hcu-unt=249@2,cnu-sus=216@1',
];
/* =====================================================
   POOL ENGINE: live scores, win odds, standings.
   Shared by pickem.html (phone) and board.html (iPad).
   ===================================================== */
const Pool = (() => {
  const byId = Object.fromEntries(GAMES.map(g => [g.id, g]));
  const N = GAMES.length;
  const entries = ENTRIES.map(code => {
    const [, name, list] = code.split('|');
    const picks = list.split(',').map(s => {
      const [game, rest] = s.split('=');
      const [team, pts] = rest.split('@');
      return { game, team: team === '-' ? null : team, pts: +pts };
    });
    return { name, picks };
  });
  let games = {}; // id -> { state, detail, winner, scores, pAway, clock, period, updated }
  let updatedAt = null;

  const phi = x => { // standard normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };
  // Pregame fallback from the listed spread, e.g. 'TEX -4.5'
  function spreadPAway(g, abbr) {
    if (!g.spread) return 0.5;
    const m = g.spread.match(/^(.+?)\s+-([\d.]+)$/);
    if (!m) return 0.5;
    const favAway = abbr.away && m[1].toUpperCase() === abbr.away.toUpperCase();
    const favHome = abbr.home && m[1].toUpperCase() === abbr.home.toUpperCase();
    const p = phi(+m[2] / 13.5);
    return favAway ? p : favHome ? 1 - p : 0.5;
  }
  // Live fallback from score margin and time left
  function marginPAway(margin, period, clockSec, prior) {
    const left = Math.max(0, (4 - Math.min(period, 4)) * 900 + clockSec) / 3600;
    if (left <= 0) return margin > 0 ? 1 : margin < 0 ? 0 : 0.5;
    const exp = margin + (prior - 0.5) * 20 * left;
    return phi(exp / (13.5 * Math.sqrt(left) + 0.01));
  }

  async function fetchGame(g) {
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${g.espnId}`);
    const d = await r.json();
    const c = d.header.competitions[0];
    const st = c.status.type;
    const comp = {}; c.competitors.forEach(x => comp[x.homeAway] = x);
    const away = comp.away, home = comp.home;
    const scores = { [away.id]: away.score, [home.id]: home.score };
    const abbr = { away: away.team && away.team.abbreviation, home: home.team && home.team.abbreviation };
    let winner = null;
    if (st.completed) {
      winner = away.winner ? away.id : home.winner ? home.id : (+away.score > +home.score ? away.id : home.id);
    }
    let prior = spreadPAway(g, abbr);
    if (d.predictor && d.predictor.awayTeam && d.predictor.awayTeam.gameProjection)
      prior = (+d.predictor.awayTeam.gameProjection) / 100;
    let pAway = prior;
    const wp = d.winprobability || [];
    if (winner) pAway = winner === g.away.tid ? 1 : 0;
    else if (st.state === 'in') {
      if (wp.length) pAway = 1 - wp[wp.length - 1].homeWinPercentage;
      else {
        const clk = (c.status.displayClock || '0:00').split(':');
        pAway = marginPAway((+away.score || 0) - (+home.score || 0), c.status.period || 1, (+clk[0]) * 60 + (+clk[1] || 0), prior);
      }
    }
    let poss = null;
    if (d.drives && d.drives.current && st.state === 'in') poss = d.drives.current.team && d.drives.current.team.id;
    return { state: st.state, detail: st.shortDetail, winner, scores, pAway: Math.min(0.999, Math.max(0.001, pAway)), poss };
  }

  async function refresh() {
    await Promise.all(GAMES.map(async g => {
      try { games[g.id] = await fetchGame(g); }
      catch (e) { try { games[g.id] = await fetchGame(g); } catch (e2) { /* keep last known */ } }
    }));
    updatedAt = new Date();
  }

  function pPick(p) { // chance this pick ends up correct
    const r = games[p.game], g = byId[p.game];
    if (!p.team) return 0;
    if (!r) return 0.5;
    return p.team === g.away.tid ? r.pAway : 1 - r.pAway;
  }

  function standings(sims = 4000) {
    const rows = entries.map(e => {
      let pts = 0, max = 0, proj = 0, w = 0, l = 0, liveUp = 0, liveDown = 0, sweat = null;
      for (const p of e.picks) {
        const r = games[p.game], g = byId[p.game];
        if (r && r.winner) {
          if (p.team === r.winner) { pts += p.pts; max += p.pts; proj += p.pts; w++; } else l++;
          continue;
        }
        if (p.team) max += p.pts;
        proj += pPick(p) * p.pts;
        if (r && r.state === 'in' && p.team) {
          const opp = p.team === g.away.tid ? g.home.tid : g.away.tid;
          const diff = (+r.scores[p.team] || 0) - (+r.scores[opp] || 0);
          if (diff > 0) liveUp++; else if (diff < 0) liveDown++;
          if (!sweat || p.pts > sweat.pts) sweat = { pts: p.pts, game: p.game, team: p.team, diff, detail: r.detail };
        }
      }
      return { name: e.name, entry: e, pts, max, proj, w, l, liveUp, liveDown, sweat, winPct: 0, cashPct: 0, solo: 0 };
    });

    // Solo picks: picks nobody else made on that game
    for (const g of GAMES) {
      const counts = {};
      entries.forEach(e => { const p = e.picks.find(x => x.game === g.id); if (p && p.team) counts[p.team] = (counts[p.team] || 0) + 1; });
      rows.forEach(r => { const p = r.entry.picks.find(x => x.game === g.id); if (p && p.team && counts[p.team] === 1) r.solo++; });
    }

    // Monte Carlo: simulate the rest of the day
    const open = GAMES.filter(g => !(games[g.id] && games[g.id].winner));
    const idx = Object.fromEntries(GAMES.map((g, i) => [g.id, i]));
    const pickTable = rows.map(r => { const a = new Array(N).fill(null); r.entry.picks.forEach(p => a[idx[p.game]] = p); return a; });
    const win = new Float64Array(rows.length), cash = new Float64Array(rows.length);
    const tot = new Float64Array(rows.length);
    for (let s = 0; s < sims; s++) {
      const outcome = {};
      for (const g of open) { const pa = games[g.id] ? games[g.id].pAway : 0.5; outcome[g.id] = Math.random() < pa ? g.away.tid : g.home.tid; }
      for (let i = 0; i < rows.length; i++) {
        let t = rows[i].pts;
        for (const g of open) { const p = pickTable[i][idx[g.id]]; if (p && p.team === outcome[g.id]) t += p.pts; }
        tot[i] = t;
      }
      let best = -1; for (let i = 0; i < rows.length; i++) if (tot[i] > best) best = tot[i];
      const firsts = []; for (let i = 0; i < rows.length; i++) if (tot[i] === best) firsts.push(i);
      firsts.forEach(i => win[i] += 1 / firsts.length);
      if (firsts.length > 1) firsts.forEach(i => cash[i] += 1 / 1);
      else {
        cash[firsts[0]] += 1;
        let second = -1; for (let i = 0; i < rows.length; i++) if (tot[i] < best && tot[i] > second) second = tot[i];
        const seconds = []; for (let i = 0; i < rows.length; i++) if (tot[i] === second) seconds.push(i);
        seconds.forEach(i => cash[i] += 1 / seconds.length);
      }
    }
    rows.forEach((r, i) => { r.winPct = win[i] / sims * 100; r.cashPct = Math.min(100, cash[i] / sims * 100); });

    rows.sort((a, b) => b.pts - a.pts || b.proj - a.proj);
    let rank = 0, prev = null;
    rows.forEach((r, i) => { if (r.pts !== prev) { rank = i + 1; prev = r.pts; } r.rank = rank; });
    return rows;
  }

  function consensus(gameId) { // how many picked each side
    const g = byId[gameId]; const c = { [g.away.tid]: 0, [g.home.tid]: 0 };
    entries.forEach(e => { const p = e.picks.find(x => x.game === gameId); if (p && p.team) c[p.team]++; });
    return c;
  }

  return { byId, N, entries, refresh, standings, consensus, pPick, get games() { return games; }, get updatedAt() { return updatedAt; } };
})();

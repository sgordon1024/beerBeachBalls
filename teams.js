/* Beerbeachballs teams + lawn games: shared live state.
   Everything is an append-only log of small JSON events on an ntfy.sh topic (no signup, kept 12 hours).
   Events:
     {t:'join', id, name, num}            person signs in with their hat number (id = 'n:' + lowercase name)
     {t:'leave', id}                      person changed name/number
     {t:'team', num, name, by}            team name for a hat number
     {t:'result', rid, game, winner, losers:[num], score, by}   a finished game
     {t:'void', rid, by}                  undo a logged game
     {t:'bracket', bid, game, seeds:[num], by}   start (or restart) a single-elim bracket for a game; latest per game wins
   Bracket matches are ordinary 'result' events tagged {bid, match:'r<round>m<index>'}, so bracket wins earn tokens too.
   A result logged from the free-form form also counts for a bracket match when it's the same game and the same two teams.
   Scoring: 1 token per win (house rules). */
const Teams = (() => {
  const TOPIC = 'bbb-teams-7f3c91e2b54d';
  const BASE = 'https://ntfy.sh/' + TOPIC;
  const GAMES = [
    { id: 'flip',  name: 'Flip Cup',      emoji: '🥤', bracket: true },
    { id: 'pong',  name: 'Beer Pong',     emoji: '🏓', bracket: true },
    { id: 'corn',  name: 'Cornhole',      emoji: '🌽', bracket: true },
    { id: 'kart',  name: 'Mario Kart 64', emoji: '🏎️' },   // free-for-all, no bracket
  ];
  const gameById = Object.fromEntries(GAMES.map(g => [g.id, g]));
  const idFor = name => 'n:' + String(name).trim().toLowerCase().replace(/\s+/g, ' ');

  const seen = new Set();
  const people = {};      // id -> { name, num, time } | { gone, time }
  const teamNames = {};   // num -> { name, time }
  const results = {};     // rid -> { rid, game, winner, losers, score, by, time }
  const voided = {};      // rid -> time
  const brackets = {};    // game -> { bid, game, seeds, by, time }
  const listeners = [];
  let connected = false, es = null;

  function apply(msg) {
    if (!msg || msg.event !== 'message' || seen.has(msg.id)) return false;
    seen.add(msg.id);
    let ev; try { ev = JSON.parse(msg.message); } catch (e) { return false; }
    const t = msg.time;
    if (ev.t === 'join' && ev.id && ev.name && ev.num) {
      if (!people[ev.id] || people[ev.id].time <= t) people[ev.id] = { name: String(ev.name).slice(0, 30), num: +ev.num, time: t };
    } else if (ev.t === 'leave' && ev.id) {
      if (!people[ev.id] || people[ev.id].time <= t) people[ev.id] = { gone: true, time: t };
    } else if (ev.t === 'team' && ev.num) {
      if (!teamNames[ev.num] || teamNames[ev.num].time <= t) teamNames[ev.num] = { name: String(ev.name || '').slice(0, 40), time: t };
    } else if (ev.t === 'result' && ev.rid && ev.winner && Array.isArray(ev.losers)) {
      results[ev.rid] = { rid: ev.rid, game: String(ev.game || 'other').slice(0, 40), winner: +ev.winner,
        losers: ev.losers.map(Number).filter(n => n && n !== +ev.winner), score: String(ev.score || '').slice(0, 30), by: String(ev.by || ''), time: t,
        bid: ev.bid ? String(ev.bid) : null, match: ev.match ? String(ev.match) : null };
    } else if (ev.t === 'bracket' && ev.bid && ev.game && Array.isArray(ev.seeds)) {
      const g = String(ev.game);
      if (!brackets[g] || brackets[g].time <= t) brackets[g] = { bid: ev.bid, game: g, seeds: ev.seeds.map(Number).filter(n => n > 0), by: String(ev.by || ''), time: t };
    } else if (ev.t === 'void' && ev.rid) {
      voided[ev.rid] = t;
    } else return false;
    return true;
  }
  const emit = () => listeners.forEach(f => { try { f(); } catch (e) {} });

  async function send(ev) {
    const r = await fetch(BASE, { method: 'POST', body: JSON.stringify(ev) });
    if (!r.ok) throw new Error('send failed ' + r.status);
    if (apply(await r.json())) emit();
  }

  function teams() {
    const byNum = {}, latest = {};
    Object.entries(people).forEach(([id, p]) => { if (!p.gone) { const k = idFor(p.name); if (!latest[k] || latest[k].time < p.time) latest[k] = { id, time: p.time }; } });
    Object.entries(people).forEach(([id, p]) => {
      if (p.gone || latest[idFor(p.name)].id !== id) return;
      (byNum[p.num] = byNum[p.num] || []).push({ id, ...p });
    });
    // teams that only appear in results still count
    Object.values(results).forEach(r => [r.winner, ...r.losers].forEach(n => { if (!byNum[n]) byNum[n] = []; }));
    return Object.keys(byNum).map(Number).sort((a, b) => a - b).map(n => ({
      num: n, members: byNum[n].sort((a, b) => a.time - b.time), name: teamNames[n] && teamNames[n].name
    }));
  }
  function label(num) {
    const t = teams().find(x => x.num === num);
    if (t && t.name) return t.name;
    if (t && t.members.length) return t.members.map(m => m.name).join(' & ');
    return 'Team #' + num;
  }
  function gameInfo(id) { return gameById[id] || { id, name: id, emoji: '🎯' }; }

  function feed() { // newest first, voids removed
    return Object.values(results).filter(r => !voided[r.rid]).sort((a, b) => b.time - a.time);
  }
  function standings() {
    const rows = {};
    teams().forEach(t => rows[t.num] = { num: t.num, name: label(t.num), members: t.members, wins: 0, losses: 0, byGame: {}, last: 0 });
    feed().forEach(r => {
      const w = rows[r.winner]; if (w) { w.wins++; w.byGame[r.game] = (w.byGame[r.game] || 0) + 1; w.last = Math.max(w.last, r.time); }
      r.losers.forEach(n => { const l = rows[n]; if (l) { l.losses++; l.last = Math.max(l.last, r.time); } });
    });
    const list = Object.values(rows).sort((a, b) => b.wins - a.wins || a.losses - b.losses || a.num - b.num);
    let rank = 0, prev = null;
    list.forEach((r, i) => { const k = r.wins + '/' + r.losses; if (k !== prev) { rank = i + 1; prev = k; } r.rank = rank; });
    return list;
  }

  /* ---------- Brackets (single elimination) ---------- */
  const roundName = (r, total) => r === total - 1 ? 'Final' : r === total - 2 ? 'Semifinals' : r === total - 3 ? 'Quarterfinals' : 'Round ' + (r + 1);
  function bracket(game) {
    const b = brackets[game];
    if (!b || b.seeds.length < 2) return null;
    const n = b.seeds.length;
    let size = 2; while (size < n) size *= 2;
    const byes = size - n;
    // first round: the first `byes` teams get a bye, the rest pair up
    const first = [];
    for (let i = 0; i < byes; i++) first.push([b.seeds[i], null]);
    for (let i = byes; i < n; i += 2) first.push([b.seeds[i], b.seeds[i + 1]]);
    const total = Math.log2(size);
    const live = feed().slice().reverse(); // oldest first
    const claimed = new Set();
    const rounds = [];
    let pairs = first;
    for (let r = 0; r < total; r++) {
      const round = pairs.map(([a, c], i) => {
        const m = { id: `r${r}m${i}`, round: r, a, b: c, winner: null, rid: null, score: '', bye: false };
        if (a && c === null && r === 0) { m.winner = a; m.bye = true; return m; }
        if (!a || !c) return m;
        const fits = x => x.game === game && !claimed.has(x.rid) && x.time >= b.time &&
          ((x.winner === a && x.losers.includes(c)) || (x.winner === c && x.losers.includes(a)));
        const hit = live.find(x => x.bid === b.bid && x.match === m.id && fits(x)) || live.find(x => !x.bid && fits(x));
        if (hit) { claimed.add(hit.rid); m.winner = hit.winner; m.rid = hit.rid; m.score = hit.score; }
        return m;
      });
      rounds.push({ name: roundName(r, total), matches: round });
      const next = [];
      for (let i = 0; i < round.length; i += 2) next.push([round[i].winner, round[i + 1] ? round[i + 1].winner : null]);
      pairs = next;
    }
    const final = rounds[rounds.length - 1].matches[0];
    return { ...b, rounds, champion: final.winner, size };
  }
  function upNext() { // matches ready to play across all brackets
    const out = [];
    Object.keys(brackets).forEach(g => { const br = bracket(g); if (!br) return;
      br.rounds.forEach(r => r.matches.forEach(m => { if (m.a && m.b && !m.winner) out.push({ ...m, game: g, round: r.name }); })); });
    return out;
  }

  async function loadAll() {
    const r = await fetch(BASE + '/json?poll=1&since=all');
    let changed = false;
    (await r.text()).split('\n').filter(Boolean).forEach(line => { try { changed = apply(JSON.parse(line)) || changed; } catch (e) {} });
    connected = true; emit();
  }
  function stream() {
    if (es) es.close();
    es = new EventSource(BASE + '/sse?since=all');
    es.onopen = () => { connected = true; emit(); };
    es.onmessage = e => { try { if (apply(JSON.parse(e.data))) emit(); } catch (err) {} };
    es.onerror = () => { connected = false; emit(); };
  }
  function start() {
    stream(); // the stream replays history (since=all), so no separate load is needed
    setTimeout(() => { if (!es || es.readyState !== 1) loadAll().catch(() => { connected = false; emit(); }); }, 8000);
    setInterval(() => { if (!es || es.readyState !== 1) loadAll().catch(() => {}); }, 60000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && (!es || es.readyState === 2)) stream(); });
  }
  const newRid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  return {
    GAMES, idFor, gameInfo, teams, label, feed, standings, send, start, newRid, bracket, upNext,
    get brackets() { return brackets; },
    onChange: f => listeners.push(f),
    get people() { return people; }, get connected() { return connected; },
  };
})();

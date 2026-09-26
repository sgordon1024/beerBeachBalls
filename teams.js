/* Beerbeachballs teams + lawn games: shared live state.
   Everything is an append-only log of small JSON events on an ntfy.sh topic (no signup, kept 12 hours).
   Events:
     {t:'join', id, name, num}            person signs in with their hat number (id = 'n:' + lowercase name)
     {t:'leave', id}                      person changed name/number
     {t:'team', num, name, by}            team name for a hat number
     {t:'result', rid, game, winner, losers:[num], score, by}   a finished game
     {t:'void', rid, by}                  undo a logged game
   Scoring: 1 token per win (house rules). */
const Teams = (() => {
  const TOPIC = 'bbb-teams-7f3c91e2b54d';
  const BASE = 'https://ntfy.sh/' + TOPIC;
  const GAMES = [
    { id: 'flip',  name: 'Flip Cup',      emoji: '🥤' },
    { id: 'pong',  name: 'Beer Pong',     emoji: '🏓' },
    { id: 'corn',  name: 'Cornhole',      emoji: '🌽' },
    { id: 'kart',  name: 'Mario Kart 64', emoji: '🏎️' },
  ];
  const gameById = Object.fromEntries(GAMES.map(g => [g.id, g]));
  const idFor = name => 'n:' + String(name).trim().toLowerCase().replace(/\s+/g, ' ');

  const seen = new Set();
  const people = {};      // id -> { name, num, time } | { gone, time }
  const teamNames = {};   // num -> { name, time }
  const results = {};     // rid -> { rid, game, winner, losers, score, by, time }
  const voided = {};      // rid -> time
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
        losers: ev.losers.map(Number).filter(n => n && n !== +ev.winner), score: String(ev.score || '').slice(0, 30), by: String(ev.by || ''), time: t };
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
    loadAll().catch(() => { connected = false; emit(); }).finally(stream);
    setInterval(() => { if (!es || es.readyState !== 1) loadAll().catch(() => {}); }, 60000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && (!es || es.readyState === 2)) stream(); });
  }
  const newRid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  return {
    GAMES, idFor, gameInfo, teams, label, feed, standings, send, start, newRid,
    onChange: f => listeners.push(f),
    get people() { return people; }, get connected() { return connected; },
  };
})();

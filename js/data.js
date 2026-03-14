async function loadClubData() {
  const res = await fetch('data/club-data.json');
  return res.json();
}

function getLatestTest(player) {
  return [...player.tests].sort((a,b) => a.date.localeCompare(b.date)).at(-1);
}

function getFirstTest(player) {
  return [...player.tests].sort((a,b) => a.date.localeCompare(b.date))[0];
}

function getAlertLevel(test) {
  const dims = Object.values(test.dimensions);
  const veryLowCount = dims.filter(v => v < 40).length;
  if (test.score < 45 || veryLowCount >= 2) return 'danger';
  if (test.score < 55 || dims.some(v => v < 45)) return 'warn';
  return 'ok';
}

function alertLabel(level) {
  if (level === 'danger') return 'Rouge';
  if (level === 'warn') return 'Orange';
  return 'Vert';
}

function teamLatestPlayers(team) {
  return team.players.map(player => ({ player, latest: getLatestTest(player), first: getFirstTest(player) }));
}

function avg(values) {
  return values.length ? Math.round(values.reduce((a,b) => a + b, 0) / values.length) : 0;
}

function computeTeamSummary(team) {
  const latest = teamLatestPlayers(team);
  const score = avg(latest.map(x => x.latest.score));
  const confiance = avg(latest.map(x => x.latest.dimensions.confiance));
  const regulation = avg(latest.map(x => x.latest.dimensions.regulation));
  const engagement = avg(latest.map(x => x.latest.dimensions.engagement));
  const stabilite = avg(latest.map(x => x.latest.dimensions.stabilite));
  const alerts = latest.filter(x => getAlertLevel(x.latest) !== 'ok').length;
  const profileCounts = {};
  latest.forEach(x => { profileCounts[x.latest.profil] = (profileCounts[x.latest.profil] || 0) + 1; });
  const dominantProfile = Object.entries(profileCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
  const seasonSeries = collectTeamSeasonSeries(team);
  return { score, confiance, regulation, engagement, stabilite, alerts, dominantProfile, seasonSeries };
}

function collectTeamSeasonSeries(team) {
  const byDate = {};
  team.players.forEach(player => {
    player.tests.forEach(test => {
      if (!byDate[test.date]) byDate[test.date] = [];
      byDate[test.date].push(test.score);
    });
  });
  return Object.entries(byDate)
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([date, scores]) => ({ date, score: avg(scores) }));
}

function computeClubSummary(data) {
  const teams = data.teams.map(team => ({ team, summary: computeTeamSummary(team) }));
  const allPlayersLatest = data.teams.flatMap(team => teamLatestPlayers(team).map(x => x.latest));
  return {
    teams,
    totalPlayers: data.teams.reduce((sum, team) => sum + team.players.length, 0),
    averageScore: avg(allPlayersLatest.map(t => t.score)),
    totalAlerts: allPlayersLatest.filter(test => getAlertLevel(test) !== 'ok').length,
    strongestDimension: strongestDimension(allPlayersLatest),
    weakestDimension: weakestDimension(allPlayersLatest)
  };
}

function strongestDimension(tests) {
  const dimAvgs = dimensionAverages(tests);
  return Object.entries(dimAvgs).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';
}

function weakestDimension(tests) {
  const dimAvgs = dimensionAverages(tests);
  return Object.entries(dimAvgs).sort((a,b)=>a[1]-b[1])[0]?.[0] || '—';
}

function dimensionAverages(tests) {
  return {
    confiance: avg(tests.map(t=>t.dimensions.confiance)),
    regulation: avg(tests.map(t=>t.dimensions.regulation)),
    engagement: avg(tests.map(t=>t.dimensions.engagement)),
    stabilite: avg(tests.map(t=>t.dimensions.stabilite))
  };
}

function formatDimensionName(key) {
  return ({ confiance:'Confiance', regulation:'Régulation', engagement:'Engagement', stabilite:'Stabilité' })[key] || key;
}

function getTeamById(data, id) {
  return data.teams.find(t => t.id === id) || data.teams[0];
}

function getPlayerById(data, id) {
  for (const team of data.teams) {
    const player = team.players.find(p => p.id === id);
    if (player) return { team, player };
  }
  return null;
}

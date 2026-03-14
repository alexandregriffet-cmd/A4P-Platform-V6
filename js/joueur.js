document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadClubData();
  const params = new URLSearchParams(window.location.search);
  const record = getPlayerById(data, params.get('player'));
  if (!record) return;

  const {team, player} = record;
  const latest = getLatestTest(player);
  const first = getFirstTest(player);

  document.getElementById('player-name').textContent = `${player.firstName} ${player.lastName}`;
  document.getElementById('player-meta').textContent = `${team.name} · ${player.position}`;
  document.getElementById('player-score').textContent = `${latest.score}/100`;
  document.getElementById('player-profile').textContent = latest.profil;
  document.getElementById('player-progress').textContent = `${latest.score - first.score >= 0 ? '+' : ''}${latest.score - first.score}`;

  buildRadarChart('player-radar', latest.dimensions, `${player.firstName} ${player.lastName}`);
  buildLineChart('player-history', player.tests.map(t => t.date), player.tests.map(t => t.score), 'Historique des tests');

  const tbody = document.querySelector('#history-table tbody');
  tbody.innerHTML = [...player.tests].sort((a,b)=>a.date.localeCompare(b.date)).map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.score}</td>
      <td>${t.dimensions.confiance}</td>
      <td>${t.dimensions.regulation}</td>
      <td>${t.dimensions.engagement}</td>
      <td>${t.dimensions.stabilite}</td>
      <td>${t.profil}</td>
    </tr>
  `).join('');

  const compareText = `Entre le premier test (${first.date}) et le plus récent (${latest.date}), ${player.firstName} ${player.lastName} progresse de ${latest.score - first.score >= 0 ? '+' : ''}${latest.score - first.score} point(s). La dynamique la plus favorable concerne ${formatDimensionName(Object.entries(latest.dimensions).sort((a,b)=> (b[1]-first.dimensions[b[0]]) - (a[1]-first.dimensions[a[0]]))[0][0]).toLowerCase()}, tandis que la priorité de consolidation reste ${formatDimensionName(Object.entries(latest.dimensions).sort((a,b)=>a[1]-b[1])[0][0]).toLowerCase()}.`;
  document.getElementById('compare-summary').textContent = compareText;
});

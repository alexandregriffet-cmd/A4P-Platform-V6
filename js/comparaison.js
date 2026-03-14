document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadClubData();
  const compareTeam = document.getElementById('compare-team');
  compareTeam.innerHTML = data.teams.map(team => `<option value="${team.id}">${team.name}</option>`).join('');

  function render(teamId) {
    const team = getTeamById(data, teamId);
    const latestPlayers = teamLatestPlayers(team);
    const players = latestPlayers.map(x => x.player);
    const selectA = document.getElementById('player-a');
    const selectB = document.getElementById('player-b');
    const options = players.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    selectA.innerHTML = options;
    selectB.innerHTML = options;
    if (players[1]) selectB.value = players[1].id;
    updatePlayers();
  }

  function updatePlayers() {
    const playerAId = document.getElementById('player-a').value;
    const playerBId = document.getElementById('player-b').value;
    const recordA = getPlayerById(data, playerAId);
    const recordB = getPlayerById(data, playerBId);
    if (!recordA || !recordB) return;
    const latestA = getLatestTest(recordA.player);
    const latestB = getLatestTest(recordB.player);
    document.getElementById('compare-a').innerHTML = `<strong>${recordA.player.firstName} ${recordA.player.lastName}</strong><br>Score : ${latestA.score}/100<br>Profil : ${latestA.profil}`;
    document.getElementById('compare-b').innerHTML = `<strong>${recordB.player.firstName} ${recordB.player.lastName}</strong><br>Score : ${latestB.score}/100<br>Profil : ${latestB.profil}`;
    buildBarChart('players-compare-chart', ['Confiance','Régulation','Engagement','Stabilité'], [latestA.dimensions.confiance, latestA.dimensions.regulation, latestA.dimensions.engagement, latestA.dimensions.stabilite], recordA.player.firstName);
    buildBarChart('teams-compare-chart', data.teams.map(t=>t.name), data.teams.map(t=>computeTeamSummary(t).score), 'Comparaison équipes');
    document.getElementById('advanced-summary').textContent = `${recordA.player.firstName} ${recordA.player.lastName} et ${recordB.player.firstName} ${recordB.player.lastName} peuvent être comparés sur leurs ressources actuelles. La lecture staff gagne en pertinence lorsqu'elle rapproche le score global, la dynamique de progression et la nature des fragilités dominantes, plutôt que de réduire l'analyse à un simple classement.`;
  }

  compareTeam.addEventListener('change', e => render(e.target.value));
  document.getElementById('player-a').addEventListener('change', updatePlayers);
  document.getElementById('player-b').addEventListener('change', updatePlayers);
  render(data.teams[0].id);
});

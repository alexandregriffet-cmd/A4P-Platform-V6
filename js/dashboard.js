document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadClubData();
  const club = computeClubSummary(data);

  document.getElementById('club-name').textContent = data.club.name;
  document.getElementById('season-name').textContent = data.club.season;
  document.getElementById('kpi-score').textContent = `${club.averageScore}/100`;
  document.getElementById('kpi-players').textContent = club.totalPlayers;
  document.getElementById('kpi-alerts').textContent = club.totalAlerts;
  document.getElementById('kpi-weakness').textContent = formatDimensionName(club.weakestDimension);

  const latestTests = data.teams.flatMap(team => team.players.map(player => getLatestTest(player)));
  const dims = dimensionAverages(latestTests);
  buildRadarChart('club-radar', dims, 'Club');

  const teamNames = club.teams.map(x => x.team.name);
  const teamScores = club.teams.map(x => x.summary.score);
  buildBarChart('teams-compare', teamNames, teamScores, 'Score moyen');

  const tbody = document.querySelector('#teams-table tbody');
  tbody.innerHTML = club.teams.map(({team, summary}) => `
    <tr>
      <td><a href="equipe.html?team=${team.id}"><strong>${team.name}</strong></a></td>
      <td>${team.players.length}</td>
      <td>${summary.score}</td>
      <td>${summary.dominantProfile}</td>
      <td>${summary.alerts}</td>
      <td><a class="badge" href="equipe.html?team=${team.id}">Ouvrir</a></td>
    </tr>
  `).join('');

  const alertRoot = document.getElementById('alerts-list');
  const alerts = data.teams.flatMap(team => teamLatestPlayers(team).map(x => ({team: team.name, player: x.player, latest: x.latest}))).filter(x => getAlertLevel(x.latest) !== 'ok');
  alertRoot.innerHTML = alerts.length ? alerts.map(x => {
    const level = getAlertLevel(x.latest);
    return `
      <div class="list-item">
        <div>
          <strong>${x.player.firstName} ${x.player.lastName}</strong><br>
          <span>${x.team} · ${x.player.position}</span>
        </div>
        <div>
          <span class="badge ${level}">${alertLabel(level)}</span>
        </div>
      </div>`;
  }).join('') : '<p class="panel-note">Aucune alerte active actuellement.</p>';

  const staffText = `Le club présente un score mental moyen de ${club.averageScore}/100. La dimension collective la plus solide est ${formatDimensionName(club.strongestDimension).toLowerCase()}, tandis que la priorité de travail actuelle concerne ${formatDimensionName(club.weakestDimension).toLowerCase()}. ${club.totalAlerts} joueur(s) apparaissent en vigilance renforcée, ce qui justifie une lecture staff ciblée et un accompagnement différencié par équipe.`;
  document.getElementById('staff-summary').textContent = staffText;

  document.getElementById('raw-json').textContent = JSON.stringify(data, null, 2);
});

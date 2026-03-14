document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadClubData();
  const params = new URLSearchParams(window.location.search);
  const team = getTeamById(data, params.get('team'));
  const summary = computeTeamSummary(team);
  const latestPlayers = teamLatestPlayers(team);

  document.getElementById('team-name').textContent = team.name;
  document.getElementById('team-category').textContent = `${team.category} · ${team.players.length} joueurs`;
  document.getElementById('team-score').textContent = `${summary.score}/100`;
  document.getElementById('team-profile').textContent = summary.dominantProfile;
  document.getElementById('team-alerts').textContent = summary.alerts;
  document.getElementById('team-priority').textContent = formatDimensionName(weakestDimension(latestPlayers.map(x => x.latest)));

  buildRadarChart('team-radar', {
    confiance: summary.confiance,
    regulation: summary.regulation,
    engagement: summary.engagement,
    stabilite: summary.stabilite
  }, team.name);

  buildLineChart('team-season', summary.seasonSeries.map(x => x.date), summary.seasonSeries.map(x => x.score), 'Progression saison');

  const profileCounts = {};
  latestPlayers.forEach(x => { profileCounts[x.latest.profil] = (profileCounts[x.latest.profil] || 0) + 1; });
  const profileRoot = document.getElementById('profile-split');
  profileRoot.innerHTML = Object.entries(profileCounts).sort((a,b)=>b[1]-a[1]).map(([profile, count]) => `
    <div class="list-item"><span><strong>${profile}</strong></span><span>${count} joueur(s)</span></div>
  `).join('');

  const tbody = document.querySelector('#players-table tbody');
  tbody.innerHTML = latestPlayers.map(x => {
    const level = getAlertLevel(x.latest);
    const delta = x.latest.score - x.first.score;
    const deltaLabel = `${delta >= 0 ? '+' : ''}${delta}`;
    return `
    <tr>
      <td><a href="joueur.html?player=${x.player.id}"><strong>${x.player.firstName} ${x.player.lastName}</strong></a></td>
      <td>${x.player.position}</td>
      <td>${x.latest.score}</td>
      <td>${x.latest.dimensions.confiance}</td>
      <td>${x.latest.dimensions.regulation}</td>
      <td>${x.latest.dimensions.engagement}</td>
      <td>${x.latest.dimensions.stabilite}</td>
      <td>${deltaLabel}</td>
      <td><span class="badge ${level}">${alertLabel(level)}</span></td>
    </tr>`;
  }).join('');

  const compareRoot = document.getElementById('comparison-box');
  const best = [...latestPlayers].sort((a,b)=>b.latest.score-a.latest.score)[0];
  const mostProgress = [...latestPlayers].sort((a,b)=>(b.latest.score-b.first.score)-(a.latest.score-a.first.score))[0];
  compareRoot.innerHTML = `
    <div class="alert-box"><strong>Meilleur score actuel :</strong> ${best.player.firstName} ${best.player.lastName} (${best.latest.score}/100)</div>
    <div class="alert-box"><strong>Plus forte progression :</strong> ${mostProgress.player.firstName} ${mostProgress.player.lastName} (${mostProgress.latest.score - mostProgress.first.score >= 0 ? '+' : ''}${mostProgress.latest.score - mostProgress.first.score})</div>
  `;

  const staffSummary = `L'équipe ${team.name} présente actuellement un score moyen de ${summary.score}/100. L'engagement collectif reste un point d'appui solide (${summary.engagement}/100), tandis que ${formatDimensionName('regulation').toLowerCase()} appelle encore de la consolidation lorsqu'elle descend sous les seuils de stabilité attendus. ${summary.alerts} joueur(s) nécessitent une vigilance particulière. Une stratégie staff efficace consiste à distinguer le travail collectif sur la gestion de la pression et le suivi individuel des profils les plus fragiles.`;
  document.getElementById('staff-summary').textContent = staffSummary;
});

function buildRadarChart(canvasId, dimensions, label) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Confiance', 'Régulation', 'Engagement', 'Stabilité'],
      datasets: [{
        label,
        data: [dimensions.confiance, dimensions.regulation, dimensions.engagement, dimensions.stabilite],
        backgroundColor: 'rgba(36,83,138,0.18)',
        borderColor: '#24538a',
        pointBackgroundColor: '#17385d',
        pointRadius: 3
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } },
      plugins: { legend: { display: false } }
    }
  });
}

function buildLineChart(canvasId, labels, values, label='Progression') {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        fill: true,
        tension: .3,
        borderColor: '#17385d',
        backgroundColor: 'rgba(23,56,93,.12)'
      }]
    },
    options: { maintainAspectRatio:false, plugins:{legend:{display:false}} }
  });
}

function buildBarChart(canvasId, labels, values, label='Scores') {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label, data: values, backgroundColor: ['#17385d','#24538a','#4a79ad','#8db0cf'] }]
    },
    options: { maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{min:0,max:100}} }
  });
}

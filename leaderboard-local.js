const leaderboardData = [
  { name: 'Twisted Mind', score: 55 },
  { name: 'Teddy the Bear', score: 12 },
  { name: 'Shine vombat', score: 8 },
  { name: 'Speedy Gonzales', score: 11 },
  { name: 'Fromage Français', score: 9 },
  { name: 'Sauerkraut Fritz', score: 10 },
  { name: 'Pizza Pete', score: 13 },
  { name: 'Coco Chanel', score: 8 },
  { name: 'Rocky Balboa', score: 12 },
  { name: 'Sunny Day', score: 9 }
];

// Table rendering
function renderLeaderboard(data) {
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = ''; // Clear the table

  data.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td style="width: 5rem; text-align: right;">${entry.score}</td>
    `;
    tbody.appendChild(row);
  });
}

// Update the leaderboard data
function updateScore(name, score) {
  leaderboardData.push({ name, score });
  leaderboardData.sort((a, b) => b.score - a.score); // Sort the data
  leaderboardData.splice(10);                       // Keep only the top 10 scores
  renderLeaderboard(leaderboardData);              // Re-render the table
}

// Initialisation
leaderboardData.sort((a, b) => b.score - a.score); // Initial sorting
renderLeaderboard(leaderboardData);               // Rebder the table

// Add a new score
updateScore('Fast Fox', 43);

async function submitScore(name, score) {
  try {
    const response = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const updatedData = await response.json(); 
    renderLeaderboard(updatedData);           
  } catch (error) {
    console.error('Error posting to leaderboard:', error);
    alert('Leaderboard submission failed! Please try again later.');
  }
}

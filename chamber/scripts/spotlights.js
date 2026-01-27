const container = document.getElementById("spotlight-container");

async function loadSpotlights() {
  try {
    const response = await fetch("data/members.json");
    const data = await response.json();

    // Solo Silver (2) y Gold (3)
    const eligible = data.members.filter(member =>
      member.level === 2 || member.level === 3
    );

    // Aleatorios
    const selected = eligible
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    selected.forEach(member => {
      const card = document.createElement("section");

      card.innerHTML = `
        <h3>${member.name}</h3>
        <img src="images/${member.image}" alt="${member.name} logo">
        <p>${member.address}</p>
        <p>${member.phone}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p><strong>${member.level === 3 ? "Gold" : "Silver"} Member</strong></p>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Spotlights error:", error);
  }
}

loadSpotlights();

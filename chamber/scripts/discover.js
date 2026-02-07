const cards = document.querySelector('.cards');

/* ===== DATA DISCOVER ===== */
const discoverItems = [
  {
    title: "Main Plaza",
    image: "discover/discover1.jpg",
    address: "Plaza de Armas, Lima",
    description: "The heart of the city with historic buildings and public events."
  },
  {
    title: "Historic Center",
    image: "discover/discover2.jpg",
    address: "Historic District, Lima",
    description: "Colonial architecture and cultural heritage sites."
  },
  {
    title: "Local Market",
    image: "discover/discover3.jpg",
    address: "Central Market, Lima",
    description: "Fresh local products and traditional food."
  },
  {
    title: "City Park",
    image: "discover/discover4.jpg",
    address: "Green Park Avenue, Lima",
    description: "A large park for recreation and outdoor activities."
  },
  {
    title: "University Area",
    image: "discover/discover5.jpg",
    address: "University Avenue, Lima",
    description: "Educational hub with modern facilities."
  },
  {
    title: "Commercial Zone",
    image: "discover/discover6.jpg",
    address: "Business District, Lima",
    description: "Main business and shopping area."
  },
  {
    title: "Cultural Event",
    image: "discover/discover7.jpg",
    address: "Cultural Center, Lima",
    description: "Local events and cultural activities."
  },
  {
    title: "City View",
    image: "discover/discover8.jpg",
    address: "Viewpoint Hill, Lima",
    description: "Panoramic view of the city."
  }
];

/* ===== BUILD CARDS ===== */
discoverItems.forEach((item, index) => {
  const card = document.createElement('section');
  card.classList.add('card');
  card.style.gridArea = `card${index + 1}`;

  card.innerHTML = `
    <h2>${item.title}</h2>
    <figure>
      <img src="images/${item.image}"
           alt="${item.title}"
           loading="lazy">
    </figure>
    <address>${item.address}</address>
    <p>${item.description}</p>
    <button>Learn More</button>
  `;

  cards.appendChild(card);
});

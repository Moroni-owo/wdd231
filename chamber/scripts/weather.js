const apiKey = "TU_API_KEY_AQUI";
const lat = -12.0464;
const lon = -77.0428;

const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

async function getWeather() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("current-temp").textContent =
      Math.round(data.list[0].main.temp);

    document.getElementById("weather-desc").textContent =
      data.list[0].weather[0].description;

    const forecast = document.getElementById("forecast");
    forecast.innerHTML = "";

    const days = data.list.filter(item =>
      item.dt_txt.includes("12:00:00")
    ).slice(0, 3);

    days.forEach(day => {
      const p = document.createElement("p");
      p.textContent = `${new Date(day.dt_txt).toLocaleDateString()} : ${Math.round(day.main.temp)}°C`;
      forecast.appendChild(p);
    });
  } catch (error) {
    console.error("Weather error:", error);
  }
}

getWeather();

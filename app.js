const apiKey = 'API KEY de Openwather '; // Reemplaza con tu API Key real

function getWeather(lat, lon, ciudadFallback = false) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const icon = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      const weather = `
        <h2>${ciudadFallback ? 'Ciudad Juárez, CHIH (por defecto)' : data.name}</h2>
        <img src="${iconUrl}" alt="${data.weather[0].description}">
        <p>Temperatura: ${data.main.temp} °C</p>
        <p>Clima: ${data.weather[0].description}</p>
      `;
      document.getElementById('weather-info').innerHTML = weather;

      localStorage.setItem('weatherData', JSON.stringify(data));
    })
    .catch(() => {
      const saved = localStorage.getItem('weatherData');
      if (saved) {
        const data = JSON.parse(saved);
        const icon = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        const weather = `
          <h2>(Offline) ${data.name}</h2>
          <img src="${iconUrl}" alt="${data.weather[0].description}">
          <p>Temperatura: ${data.main.temp} °C</p>
          <p>Clima: ${data.weather[0].description}</p>
        `;
        document.getElementById('weather-info').innerHTML = weather;
      } else {
        document.getElementById('weather-info').innerHTML = `<p>No se pudo obtener el clima ni datos guardados.</p>`;
      }
    });
}

// Lógica principal
function initApp() {
  const fallbackPref = localStorage.getItem('useCiudadJuarez');
  if (fallbackPref === 'true') {
    showCiudadJuarez();
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        let locationMsg = `
          <p>📍 Lat: ${lat.toFixed(4)} | Lon: ${lon.toFixed(4)}<br>
          🔍 Precisión: ${accuracy.toFixed(0)} metros</p>
        `;

        if (accuracy > 1000) {
          locationMsg += `
            <p style="color: red;">
              ⚠️ Ubicación poco precisa. Se recomienda activar GPS o usar Wi-Fi.
            </p>`;
        }

        document.getElementById('location').innerHTML = locationMsg;
        getWeather(lat, lon);
      },
      error => {
        console.warn('Error en geolocalización:', error.message);
        document.getElementById('location').innerHTML = `
          <p>⚠️ No se pudo obtener tu ubicación.<br>
          Usando Ciudad Juárez por defecto.</p>`;
        showCiudadJuarez();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    document.getElementById('location').innerHTML = `
      <p>⚠️ Geolocalización no soportada. Mostrando Ciudad Juárez.</p>`;
    showCiudadJuarez();
  }
}

// Función para mostrar clima de Ciudad Juárez
function showCiudadJuarez() {
  localStorage.setItem('useCiudadJuarez', 'true');
  getWeather(31.7390, -106.4850, true);
  document.getElementById('location').innerHTML += `
    <p> 🛜 Mostrando clima de Ciudad Juárez (modo manual o por defecto).</p>`;
}

// Botón: usar Ciudad Juárez manualmente
document.getElementById('fallback-btn').addEventListener('click', () => {
  showCiudadJuarez();
});

// Ejecutar
initApp();

// Service Worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker registrado'))
    .catch(err => console.error('❌ Error al registrar Service Worker:', err));
}

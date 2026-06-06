const key = "f8c8ea05c27d362281e2d2ca41801051";
const cityInput = document.getElementById("city");
const loader = document.getElementById("loader");
const cityName = document.getElementById("cityName");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.getElementById("themeBtn");
const currentDiv = document.getElementById("current");
const forecastDiv = document.getElementById("forecast");

searchBtn.onclick = getWeather;
cityInput.addEventListener("keypress", function(e){
  if(e.key === "Enter"){
    getWeather();
  }
});
themeBtn.onclick = toggleTheme;

window.onload = () => {
  getLocationWeather();
  autoTheme();
  let last = localStorage.getItem("city");
  let theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark");
  if (last) { cityInput.value = last; getWeather(); }
};

function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function icon(cond){
  cond = cond.toLowerCase();
  if(cond.includes("cloud")) return "☁️";
  if(cond.includes("rain")) return "🌧️";
  if(cond.includes("clear")) return "☀️";
  if(cond.includes("snow")) return "❄️";
  return "🌤️";
}

function setTheme(cond){
  document.body.classList.remove("sunny","rain","snow","cloud");
  cond = cond.toLowerCase();
  if(cond.includes("clear")) document.body.classList.add("sunny");
  else if(cond.includes("rain")) document.body.classList.add("rain");
  else if(cond.includes("snow")) document.body.classList.add("snow");
  else if(cond.includes("cloud")) document.body.classList.add("cloud");
  else if(cond.includes("wind")){
  iconBox.innerHTML = `<div class="wind"></div>`;
}
}

async function getWeather(){
  let city = cityInput.value.trim();
  if(!city) return;
  loader.style.display = "block";
  document.querySelector(".container").classList.add("float");
  setTimeout(() => {
    document.querySelector(".container").classList.remove("float");
  }, 900);

  currentDiv.innerHTML = "";
  forecastDiv.innerHTML = "";


  localStorage.setItem("city", city);

  try {
    // Single reliable API call (current + forecast together)
    let res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`
    );

    let data = await res.json();

    if(data.cod !== "200"){
      currentDiv.innerHTML = "❌ City not found";
      return;
    }

    renderForecast(data);

  } catch(err)
    {
      console.error(err);
      loader.style.display = "none";
    }
}


function render(data){
  let cond = data.current.weather[0].main;
  setTheme(cond);

  currentDiv.classList.remove("show");
  forecastDiv.classList.remove("show");

  currentDiv.innerHTML =
    `<div style="font-size:55px">${icon(cond)}</div>
     <div style="font-size:32px">${Math.round(data.current.temp)}°C</div>
     <div style="font-size:20px; margin-bottom:6px">${cond}</div>`;

  let days = data.daily.slice(0,7).map(d=>{
    let dt = new Date(d.dt * 1000)
      .toLocaleDateString('en-US',{ weekday:'short' });

    return `
      <div class="day">
        ${dt} ${icon(d.weather[0].main)}
        ${Math.round(d.temp.max)}° /
        ${Math.round(d.temp.min)}°
      </div>
    `;
  }).join("");

  forecastDiv.innerHTML = days;

  setTimeout(()=> currentDiv.classList.add("show"), 10);
  setTimeout(()=> forecastDiv.classList.add("show"), 50);
}
function renderForecast(data){

  loader.style.display = "none";
  const descDiv = document.createElement("div");
  currentDiv.appendChild(descDiv);

  let cond = data.list[0].weather[0].main;
  let today = data.list[0];   // <-- THIS LINE MUST BE HERE (inside the function)

  cityName.innerText = data.city.name;

  setTheme(cond);

  currentDiv.classList.remove("show");
  forecastDiv.classList.remove("show");

  currentDiv.innerHTML =
    `<div style="font-size:55px">${icon(cond)}</div>
     <div style="font-size:32px">${Math.round(today.main.temp)}°C</div>
     <div style="font-size:18px; margin-bottom:4px">
        ${today.weather[0].description}
     </div>
     <div style="font-size:14px; opacity:.8;">
        H: ${Math.round(today.main.temp_max)}° • 
        L: ${Math.round(today.main.temp_min)}°
     </div>
     <div style="font-size:14px; opacity:.8; margin-top:4px;">
        💨 ${today.wind.speed} m/s • 💧 ${today.main.humidity}%
     </div>`;

  let days = data.list
    .filter((item, index) => index % 8 === 0)
    .slice(0,7)
    .map(d => {
      let dt = new Date(d.dt * 1000)
        .toLocaleDateString('en-US',{ weekday:'short' });

      return `<div class="day">
        ${dt} ${icon(d.weather[0].main)}
        ${Math.round(d.main.temp_max)}° /
        ${Math.round(d.main.temp_min)}°
      </div>`;
    })
    .join("");

  forecastDiv.innerHTML = `<div class="forecast-box">${days}</div>`;

  setTimeout(()=> currentDiv.classList.add("show"),10);
  setTimeout(()=> forecastDiv.classList.add("show"),50);
  let labels = data.list.slice(0,8).map(d =>
  new Date(d.dt * 1000).getHours() + ":00"
);

let temps = data.list.slice(0,8).map(d => d.main.temp);

new Chart(document.getElementById("tempChart"), {
  type: "line",
  data: {
    labels: labels,
    datasets: [{
      label: "Temp °C",
      data: temps,
      borderWidth: 2,
      tension: 0.4
    }]
  },
  options: {
    plugins: { legend: { display: false } }
  }
});
}

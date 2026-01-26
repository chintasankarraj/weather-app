const key = "f8c8ea05c27d362281e2d2ca41801051";
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.getElementById("themeBtn");
const currentDiv = document.getElementById("current");
const forecastDiv = document.getElementById("forecast");

searchBtn.onclick = getWeather;
themeBtn.onclick = toggleTheme;

window.onload = () => {
  let last = localStorage.getItem("city");
  let theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark");
  if (last) { cityInput.value = last; getWeather(); }
}

function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark":"light");
}

function icon(cond){
  cond=cond.toLowerCase();
  if(cond.includes("cloud")) return "☁️";
  if(cond.includes("rain")) return "🌧️";
  if(cond.includes("clear")) return "☀️";
  if(cond.includes("snow")) return "❄️";
  return "🌤️";
}

function setTheme(cond){
  document.body.classList.remove("sunny","rain","snow","cloud");
  cond=cond.toLowerCase();
  if(cond.includes("clear")) document.body.classList.add("sunny");
  else if(cond.includes("rain")) document.body.classList.add("rain");
  else if(cond.includes("snow")) document.body.classList.add("snow");
  else if(cond.includes("cloud")) document.body.classList.add("cloud");
}

async function getWeather(){
  let city = cityInput.value;
  if(!city) return;

  localStorage.setItem("city", city);

  let cache=localStorage.getItem("cache-"+city);
  if(cache){
    cache=JSON.parse(cache);
    if(Date.now()-cache.time < 60000){
      render(cache.data);
      return;
    }
  }

  // step1: get lat/lon
  let geo = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`);
  let geoData = await geo.json();
  if(geoData.cod!==200){ currentDiv.innerHTML="City not found"; return; }

  let {lat,lon} = geoData.coord;

  // step2: get 7-day
  let one = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
  let data = await one.json();

  localStorage.setItem("cache-"+city, JSON.stringify({time:Date.now(),data}));

  render(data);
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
    let dt = new Date(d.dt*1000).toLocaleDateString('en-US',{weekday:'short'});
    return `<div class="day">${dt} ${icon(d.weather[0].main)} ${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°</div>`;
  }).join("");

  forecastDiv.innerHTML = days;

  setTimeout(()=> currentDiv.classList.add("show"),10);
  setTimeout(()=> forecastDiv.classList.add("show"),50);
}

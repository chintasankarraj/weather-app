/*=========================================================
    SkyCast Weather Dashboard
    Part 1 - Foundation
=========================================================*/


// =====================================================
// API CONFIGURATION
// =====================================================

const API_KEY = "f8c8ea05c27d362281e2d2ca41801051";

const BASE_URL = "https://api.openweathermap.org/data/2.5";


// =====================================================
// DOM ELEMENTS
// =====================================================

const cityInput = document.getElementById("city");

const searchBtn = document.getElementById("searchBtn");

// const themeBtn = document.getElementById("themeBtn");

const locationBtn = document.getElementById("locationBtn");

const loader = document.getElementById("loader");

const cityName = document.getElementById("cityName");

const currentDiv = document.getElementById("current");

const forecastDiv = document.getElementById("forecast");

const sunInfo = document.getElementById("sunInfo");

const aqiInfo = document.getElementById("aqiInfo");

const hourlyForecast = document.getElementById("hourlyForecast");

const chartCanvas = document.getElementById("tempChart");

const historyList = document.getElementById("historyList");

const container = document.querySelector(".container");


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let weatherChart = null;

let currentTheme = "light";

let currentCity = "";

let cityTimezone = 0;

let recentSearches = [];

let favouriteCities = [];

// ====================================
// RECENT SEARCHES
// ====================================

function saveRecentSearch(city){

    city = city.trim();

    if(!city) return;

    // Remove duplicate if it already exists
    recentSearches = recentSearches.filter(
        c => c.toLowerCase() !== city.toLowerCase()
    );

    // Add newest city to the beginning
    recentSearches.unshift(city);

    // Keep only last 5 searches
    if(recentSearches.length > 5){
        recentSearches.pop();
    }

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(recentSearches)
    );

    renderRecentSearches();
}

function renderRecentSearches(){

    historyList.innerHTML = "";

    recentSearches.forEach(city=>{

        const chip = document.createElement("div");

        chip.className = "history-item";

        chip.textContent = city;

        chip.onclick = ()=>{

            cityInput.value = city;

            getWeather();

        };

        historyList.appendChild(chip);

    });

}

// =====================================================
// EVENT LISTENERS
// =====================================================

// Search Button

if (searchBtn) {
    searchBtn.addEventListener("click", getWeather);
}

if (cityInput) {
    cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            getWeather();
        }
    });
}

// if (themeBtn) {
//     themeBtn.addEventListener("click", () => {
//     console.log("Theme button clicked");
//     });
// }

if (locationBtn) {
    locationBtn.addEventListener("click", getCurrentLocation);
}

// =====================================================
// INITIALIZE APPLICATION
// =====================================================

window.addEventListener("load",()=>{

    initializeApp();

});


// =====================================================
// INITIALIZATION
// =====================================================

// function initializeApp(){

//     loadTheme();

//     loadLastCity();

//     loadRecentSearches();

//     autoTheme();

// }


// =====================================================
// LOCAL STORAGE
// =====================================================

// function loadTheme(){

//     const savedTheme = localStorage.getItem("theme");

//     if(savedTheme==="dark"){

//         document.body.classList.add("dark");

//         currentTheme="dark";

//     }

// }


// function saveTheme(){

//     localStorage.setItem("theme",currentTheme);

// }


function loadLastCity(){

    const city = localStorage.getItem("lastCity");

    if(city){

        cityInput.value = city;

        currentCity = city;

        getWeather();

    }

}


// function saveLastCity(city){

//     localStorage.setItem("lastCity",city);

// }


function loadRecentSearches(){

    const saved = localStorage.getItem("recentSearches");

    if(saved){

        recentSearches = JSON.parse(saved);

    }

}


function saveRecentSearches(){

    localStorage.setItem(

        "recentSearches",

        JSON.stringify(recentSearches)

    );

}


// =====================================================
// LOADER
// =====================================================

function showLoader(){

    loader.style.display="block";

}


function hideLoader(){

    loader.style.display="none";

}


// =====================================================
// CONTAINER ANIMATION
// =====================================================

function animateContainer(){

    container.classList.add("float");

    setTimeout(()=>{

        container.classList.remove("float");

    },800);

}

/*=========================================================
    Part 2 : API • Weather • Geolocation
=========================================================*/


// =====================================================
// WEATHER SEARCH
// =====================================================

async function getWeather(){

    const city = cityInput.value.trim();

    if(city===""){

        showError("Please enter a city.");

        return;

    }

    currentCity = city;

    saveLastCity(city);

    animateContainer();

    showLoader();

    try{

        const response = await fetch(

`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`

        );

        const data = await response.json();

        hideLoader();

       if(data.cod !== "200"){

    showError("City not found.");

    return;

}

renderWeather(data);

// Save successful search
saveRecentSearch(city);

        renderWeather(data);

    }

    catch(error){

        hideLoader();

        console.error(error);

        showError("Network Error");

    }

}



// =====================================================
// CURRENT LOCATION
// =====================================================

function getCurrentLocation(){

    if(!navigator.geolocation){

        showError("Geolocation not supported");

        return;

    }

    showLoader();

    navigator.geolocation.getCurrentPosition(

        fetchLocationWeather,

        locationError

    );

}



async function fetchLocationWeather(position){

    const lat = position.coords.latitude;

    const lon = position.coords.longitude;

    try{

        const response = await fetch(

`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`

        );

        const data = await response.json();

        hideLoader();

        renderWeather(data);

    }

    catch(error){

        hideLoader();

        showError("Unable to fetch location.");

    }

}



function locationError(){

    hideLoader();

    showError("Location permission denied.");

}



// // =====================================================
// // THEME
// // =====================================================

// function toggleTheme(){

//     document.body.classList.toggle("dark");

//     currentTheme =

//     document.body.classList.contains("dark")

//     ?

//     "dark"

//     :

//     "light";

//     saveTheme();

// }



// function autoTheme(){

//     const hour = new Date().getHours();

//     if(hour>=18 || hour<=6){

//         document.body.classList.add("dark");

//     }

// }



// =====================================================
// ERROR MESSAGE
// =====================================================

function showError(message){

    currentDiv.innerHTML=

    `

    <div class="error-box">

        ❌ ${message}

    </div>

    `;

    forecastDiv.innerHTML="";

}



// =====================================================
// WEATHER BACKGROUND
// =====================================================

function updateTheme(condition){

    document.body.classList.remove(

        "sunny",

        "cloud",

        "rain",

        "snow"

    );

    const weather =

    condition.toLowerCase();

    if(weather.includes("clear"))

        document.body.classList.add("sunny");

    else if(weather.includes("cloud"))

        document.body.classList.add("cloud");

    else if(weather.includes("rain"))

        document.body.classList.add("rain");

    else if(weather.includes("snow"))

        document.body.classList.add("snow");

}

/*=========================================================
    Part 3 : Render Weather
=========================================================*/

// =====================================================
// MAIN RENDER
// =====================================================

// function renderWeather(data){

//     const current = data.list[0];

//     cityName.innerHTML =
//         `${data.city.name}, ${data.city.country}`;

//     updateTheme(current.weather[0].main);

//     renderCurrentWeather(current);

//     renderForecast(data.list);

// }


// =====================================================
// CURRENT WEATHER
// =====================================================

function renderCurrentWeather(weather){

    currentDiv.classList.remove("show");

    currentDiv.innerHTML = `

        <div id="anim-icon">

            ${weatherIcon(weather.weather[0].main)}

        </div>

        <div class="current-temp">

            ${Math.round(weather.main.temp)}°C

        </div>

        <div class="feels">

            Feels Like ${Math.round(weather.main.feels_like)}°C

        </div>

        <div class="description">

            ${capitalize(weather.weather[0].description)}

        </div>

        <div class="details">

            <div class="detail-card">

                <div class="detail-title">💨 Wind</div>

                <div class="detail-value">

                    ${weather.wind.speed} m/s

                </div>

            </div>

            <div class="detail-card">

                <div class="detail-title">💧 Humidity</div>

                <div class="detail-value">

                    ${weather.main.humidity}%

                </div>

            </div>

            <div class="detail-card">

                <div class="detail-title">👁 Visibility</div>

                <div class="detail-value">

                    ${(weather.visibility/1000).toFixed(1)} km

                </div>

            </div>

            <div class="detail-card">

                <div class="detail-title">📈 Pressure</div>

                <div class="detail-value">

                    ${weather.main.pressure} hPa

                </div>

            </div>

        </div>

    `;

    setTimeout(()=>{

        currentDiv.classList.add("show");

    },100);

}


// =====================================================
// FORECAST
// =====================================================

function renderForecast(list){

    forecastDiv.classList.remove("show");

    const dailyData = {};

    list.forEach(item=>{

        const date = new Date((item.dt + cityTimezone) * 1000)
            .toISOString()
            .split("T")[0];

        if(!dailyData[date]){

            dailyData[date]={

                temps:[],

                weather:item.weather[0].main,

                dt:item.dt

            };

        }

        dailyData[date].temps.push(item.main.temp);

    });

    const forecast = Object.values(dailyData).slice(0,5);

    forecastDiv.innerHTML = forecast.map(day=>{

        const weekday = new Date((day.dt + cityTimezone) * 1000)
            .toLocaleDateString("en-US",{

                weekday:"short",

                timeZone:"UTC"

            });

        const maxTemp = Math.max(...day.temps);

        const minTemp = Math.min(...day.temps);

        return `

        <div class="day">

            <div class="day-name">

                ${weekday}

            </div>

            <div class="day-icon">

                ${weatherEmoji(day.weather)}

            </div>

            <div class="day-temp">

                ${Math.round(maxTemp)}°

                /

                ${Math.round(minTemp)}°

            </div>

        </div>

        `;

    }).join("");

    setTimeout(()=>{

        forecastDiv.classList.add("show");

    },150);

}

// ====================================
// HOURLY FORECAST
// ====================================

function renderHourlyForecast(list){

    hourlyForecast.innerHTML = "";

    const nextHours = list.slice(0,8);

    nextHours.forEach((item,index)=>{

        const date = new Date((item.dt + cityTimezone) * 1000);

        let time;

        if(index===0){

            time = "Now";

        }else{

time = date.toUTCString().match(/\d{1,2}:\d{2}/)[0];

const hour = date.getUTCHours();

time = new Date(Date.UTC(1970,0,1,hour,0))
    .toLocaleTimeString([],{
        hour:'numeric',
        hour12:true,
        timeZone:'UTC'
    });

        }

        const temp = Math.round(item.main.temp);

        const weather = item.weather[0].main;

        const icon = weatherEmoji(weather);

        hourlyForecast.innerHTML += `

            <div class="hour-card">

                <div class="hour-time">${time}</div>

                <div class="hour-icon">${icon}</div>

                <div class="hour-temp">${temp}°</div>

            </div>

        `;

    });

}

// =====================================================
// WEATHER ICONS
// =====================================================

function weatherIcon(condition){

    condition = condition.toLowerCase();

    if(condition.includes("clear"))

        return `<div class="sun"></div>`;

    if(condition.includes("cloud"))

        return `<div class="cloud-anim"></div>`;

    if(condition.includes("rain"))

        return `<div class="rain-anim"></div>`;

    if(condition.includes("snow"))

        return `<div class="snow-anim">❄</div>`;

    return "☀";

}



function weatherEmoji(condition){

    condition = condition.toLowerCase();

    if(condition.includes("clear")) return "☀";

    if(condition.includes("cloud")) return "☁";

    if(condition.includes("rain")) return "🌧";

    if(condition.includes("snow")) return "❄";

    if(condition.includes("storm")) return "⛈";

    return "🌤";

}



// =====================================================
// UTILITIES
// =====================================================

function capitalize(text){

    return text
    .split(" ")
    .map(word=>

        word.charAt(0).toUpperCase() +

        word.slice(1)

    )

    .join(" ");

}

/*=========================================================
    Part 4 : Charts • Theme • Local Storage
=========================================================*/


// =====================================================
// TEMPERATURE CHART
// =====================================================

function renderChart(current,list){

const labels = list
    .slice(0, 8)
    .map((item, index) => {

        const date = new Date((item.dt + cityTimezone) * 1000);

        return date.toLocaleTimeString([],{
    hour:"numeric",
    hour12:true,
    timeZone:"UTC"
});

        return date.toLocaleTimeString([], {
            hour: "numeric",
            hour12: true,
            timeZone: "UTC"
        });

    });

    const temperatures = list
        .slice(0,8)
        .map(item => item.main.temp);


    if(weatherChart){

        weatherChart.destroy();

    }
    const ctx = chartCanvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0,0,0,300);
    gradient.addColorStop(0,"rgba(79,142,247,.45)");
    gradient.addColorStop(1,"rgba(79,142,247,0)");


    weatherChart = new Chart(chartCanvas,{

        type:"line",

        data:{

            labels:labels,

            datasets:[{

                label:"Temperature",

                data:temperatures,

                borderColor:"#4F8EF7",

                backgroundColor: gradient,

                fill:true,

                tension:.55,

                pointRadius:6,
                pointHoverRadius:8,
                pointBorderWidth:2,

                pointBackgroundColor:"#ffffff"

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,
            layout: {
                padding: {
                    left: 15,
                    right: 15,
                    top: 15,
                    bottom: 15
                }
            },

            plugins:{

                tooltip:{
                    backgroundColor:"#111827",
                    titleColor:"#fff",
                    bodyColor:"#fff",
                    padding:12,
                    cornerRadius:12
                },

                legend:{

                    display:false

                }

            },

            scales:{

                x:{
                    ticks:{
                        color:"#fff",
                        padding:10,
                        font:{
                            size:12
                        }
                    },
                    grid:{
                        display:false
                    }
                },

                y:{
                    ticks:{
                        color:"#fff",
                        padding:10,
                        font:{
                            size:12
                        }
                    },
                    grid:{
                        color:"rgba(255,255,255,.08)"
                }
            }

        }

        }

    });

}

// ====================================
// RAIN ANIMATION
// ====================================

function createRain(){

    const rain = document.getElementById("rainContainer");

    rain.innerHTML="";

    for(let i=0;i<120;i++){

        const drop=document.createElement("div");

        drop.className="raindrop";

        drop.style.left=Math.random()*100+"vw";

        drop.style.animationDuration=

            (1.0+Math.random()*1.0)+"s";

        drop.style.animationDelay=

            Math.random()*2+"s";

        rain.appendChild(drop);

    }

}

function clearRain(){

    document.getElementById("rainContainer").innerHTML="";

}



// ====================================
// WEATHER BACKGROUND
// ====================================

function setWeatherBackground(weather){

    const bg = document.getElementById("weatherBackground");

    // Remove previous background classes
    bg.className = "";
    clearRain();
    switch(weather.toLowerCase()){

        case "clear":
            bg.classList.add("bg-clear");
            break;

        case "clouds":
            bg.classList.add("bg-clouds");
            break;

        case "rain":
        case "drizzle":
            bg.classList.add("bg-rain");
            createRain();
            break;

        case "thunderstorm":
            bg.classList.add("bg-thunder");
            break;

        case "snow":
            bg.classList.add("bg-snow");
            break;

        case "mist":
        case "fog":
        case "haze":
        case "smoke":
            bg.classList.add("bg-mist");
            break;

        default:
            bg.classList.add("bg-clear");
    }

}
// =====================================================
// UPDATE WEATHER
// =====================================================

function renderWeather(data){

    cityTimezone = data.city.timezone;

    const current = data.list[0];
    setWeatherBackground(current.weather[0].main);

    cityName.innerHTML =
        `${data.city.name}, ${data.city.country}`;

    updateTheme(current.weather[0].main);

   renderCurrentWeather(current);

renderSunInfo(data.city);

fetchAQI(
    data.city.coord.lat,
    data.city.coord.lon
);

// NEW
renderHourlyForecast(data.list);

renderForecast(data.list);

renderChart(data.list[0], data.list);
}

// ====================================
// SUNRISE & SUNSET
// ====================================

function renderSunInfo(city){

const sunriseDate = new Date((city.sunrise + cityTimezone) * 1000);

const sunsetDate = new Date((city.sunset + cityTimezone) * 1000);

const sunrise = sunriseDate.toLocaleTimeString([],{

    hour:'2-digit',

    minute:'2-digit',

    hour12:true,

    timeZone:'UTC'

});

const sunset = sunsetDate.toLocaleTimeString([],{

    hour:'2-digit',

    minute:'2-digit',

    hour12:true,

    timeZone:'UTC'

});

    sunInfo.innerHTML = `

        <div class="sun-card">

            <h4>🌅 Sunrise</h4>

            <p>${sunrise}</p>

        </div>

        <div class="sun-card">

            <h4>🌇 Sunset</h4>

            <p>${sunset}</p>

        </div>

    `;

}

// ====================================
// AIR QUALITY INDEX
// ====================================

async function fetchAQI(lat, lon){

    try{

        const response = await fetch(

`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`

        );

        const data = await response.json();

        renderAQI(data.list[0].main.aqi);

    }

    catch(error){

        console.error("AQI Error:", error);

    }

}

function renderAQI(aqi){

    let status = "";
    let color = "";

    switch(aqi){

        case 1:
            status = "Good";
            color = "#22c55e";
            break;

        case 2:
            status = "Fair";
            color = "#84cc16";
            break;

        case 3:
            status = "Moderate";
            color = "#eab308";
            break;

        case 4:
            status = "Poor";
            color = "#f97316";
            break;

        case 5:
            status = "Very Poor";
            color = "#ef4444";
            break;
    }

    aqiInfo.innerHTML = `

        <div class="aqi-card">

            <h3>🌫 Air Quality</h3>

            <div
                class="aqi-value"
                style="color:${color};"
            >
                AQI ${aqi}
            </div>

            <div class="aqi-status">

                ${status}

            </div>

        </div>

    `;

}

// =====================================================
// RECENT SEARCHES
// =====================================================

function addRecentSearch(city){

    city = city.trim();

    recentSearches =

    recentSearches.filter(c=>c!==city);

    recentSearches.unshift(city);

    if(recentSearches.length>5){

        recentSearches.pop();

    }

    saveRecentSearches();

}



// =====================================================
// FAVORITES (Foundation)
// =====================================================

function addFavourite(city){

    if(favouriteCities.includes(city))

        return;

    favouriteCities.push(city);

    localStorage.setItem(

        "favourites",

        JSON.stringify(favouriteCities)

    );

}



// =====================================================
// AUTO SAVE CITY
// =====================================================

function saveLastCity(city){

    localStorage.setItem(

        "lastCity",

        city

    );

}



// =====================================================
// APP START
// =====================================================

function initializeApp(){

    // loadTheme();

    loadRecentSearches();

    loadLastCity();

    // autoTheme();

}



// =====================================================
// SMALL UTILITIES
// =====================================================

function celsius(value){

    return `${Math.round(value)}°C`;

}


function km(value){

    return `${(value/1000).toFixed(1)} km`;

}


function pressure(value){

    return `${value} hPa`;

}



// =====================================================
// DEBUG MODE
// =====================================================

console.log(

"%cSkyCast Ready ☀",

"color:#4F8EF7;font-size:18px;font-weight:bold"

);
recentSearches = JSON.parse(
    localStorage.getItem("recentSearches")
) || [];

renderRecentSearches();

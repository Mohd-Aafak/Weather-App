const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherResult = document.getElementById("weather-result");

const cityName = document.getElementById("city-name");
const conditionText = document.getElementById("condition");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const humidityValue = document.getElementById("humidity");
const windSpeedValue = document.getElementById("wind-speed");

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchInputCity();
    }
});

searchBtn.addEventListener("click", searchInputCity);

function searchInputCity() {
    const city = cityInput.value.trim();

    if (city === "") {
        cityName.textContent = "Enter a city";
        conditionText.textContent = "Please enter a city name to continue.";
        return;
    }

    searchInput(city);
}

async function searchInput(city) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    cityName.textContent = "Loading...";
    conditionText.textContent = "Fetching weather information...";
    weatherIcon.textContent = "🌍";

    try {
        const cityURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10`;

        const res1 = await fetch(cityURL);

        if (!res1.ok) {
            throw new Error("City search failed");
        }

        const data1 = await res1.json();

        if (!data1.results || data1.results.length === 0) {
            showError("City not found", "Please check the spelling and try again.");
            return;
        }

        const matchedCity = data1.results.find(function(place) {
            return place.name.toLowerCase() === city.toLowerCase();
        });

        if (!matchedCity) {
            showError("City not found", "Try the correct city name.");
            return;
        }

        const latitude = matchedCity.latitude;
        const longitude = matchedCity.longitude;

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

        const res = await fetch(weatherURL);

        if (!res.ok) {
            throw new Error("Weather fetch failed");
        }

        const data = await res.json();

        if (!data.current) {
            throw new Error("Weather data unavailable");
        }

        const temp = data.current.temperature_2m;
        const humidity = data.current.relative_humidity_2m;
        const wind = data.current.wind_speed_10m;
        const weatherCode = data.current.weather_code;

        let condition = "";
        let icon = "";

        if (weatherCode === 0) {
            condition = "Clear Sky";
            icon = "☀️";
        } else if (weatherCode === 1) {
            condition = "Mainly Clear";
            icon = "🌤️";
        } else if (weatherCode === 2) {
            condition = "Partly Cloudy";
            icon = "⛅";
        } else if (weatherCode === 3) {
            condition = "Overcast";
            icon = "☁️";
        } else if ([45, 48].includes(weatherCode)) {
            condition = "Fog";
            icon = "🌫️";
        } else if ([51, 53, 55, 56, 57].includes(weatherCode)) {
            condition = "Drizzle";
            icon = "🌦️";
        } else if ([61, 63, 65, 66, 67].includes(weatherCode)) {
            condition = "Rain";
            icon = "🌧️";
        } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            condition = "Snow";
            icon = "❄️";
        } else if ([80, 81, 82].includes(weatherCode)) {
            condition = "Rain Showers";
            icon = "🌧️";
        } else if ([95, 96, 99].includes(weatherCode)) {
            condition = "Thunderstorm";
            icon = "⛈️";
        } else {
            condition = "Unknown Condition";
            icon = "🌍";
        }

        cityName.textContent = matchedCity.name;
        conditionText.textContent = condition;
        weatherIcon.textContent = icon;
        temperature.textContent = `${temp}°C`;
        humidityValue.textContent = `${humidity}%`;
        windSpeedValue.textContent = `${wind} km/h`;

    } catch (error) {
        console.error("Error:", error);
        showError("Weather unavailable", "Please check your internet and try again.");
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

function showError(title, message) {
    cityName.textContent = title;
    conditionText.textContent = message;
    weatherIcon.textContent = "⚠️";
    temperature.textContent = "--°C";
    humidityValue.textContent = "--%";
    windSpeedValue.textContent = "-- km/h";
}

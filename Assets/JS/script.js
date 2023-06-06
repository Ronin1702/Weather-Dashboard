$(document).ready(function () {
    // Set a constant for API Key
    const apiKey = 'e21937afa0005be2a3ff4b5545611fd7';

    // Get jQuery objects for DOM elements
    const currentTempEl = $("#temp");
    const currentWindEl = $("#wind");
    const currentHumidityEl = $("#humidity");
    const historyEl = $("#history");
    const fivedayEl = $("#fiveday-header");
    const currentWeatherEl = $("#currentWeather");
    const searchInputEl = $("#searchInput");
    const searchBtnEl = $("#searchBtn");

    let searchHistory = JSON.parse(localStorage.getItem("history")) || [];
    var weatherData; // Declare the weatherData variable

    // Fetch weather data
    function fetchWeatherData(searchInput) {
        const currentWeatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey;
        const forecastWeatherUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey;

        if (searchInput !== null && searchInput !== undefined && searchInput !== "") {
            $.getJSON(currentWeatherUrl)
                .done(function (currentData) {
                    console.log(currentData);
                    // Store current weather data in variables
                    var weatherTemp = currentData.weather[0].icon;
                    weatherData = {
                        temp: currentData.main.temp,
                        wind: currentData.wind.speed,
                        humidity: currentData.main.humidity
                    };

                    return $.getJSON(forecastWeatherUrl);
                })
                .done(function (forecastData) {
                    console.log(forecastData);
                    // Process forecast data and update UI
                    getForecast(weatherData, forecastData);
                    renderCities();
                })
                .fail(function (error) {
                    console.log(error);
                });
        }
    }

    function getForecast(currentWeather, forecastData) {
        // Your logic for processing forecast data and updating the UI goes here
        // Example code:
        console.log("Current Weather:", currentWeather);
        console.log("Forecast Weather:", forecastData);
        // Update the UI with the forecast data
    }

    // Handle form submission
    function handleFormSubmit(event) {
        event.preventDefault();
        var searchInput = searchInputEl.val().trim();
        fetchWeatherData(searchInput);
        storeSearchHistory(searchInput);
    }

    // Add event listener to search button
    searchBtnEl.on("click", handleFormSubmit);

    // Render search history cities
    function renderCities() {
        // Clear previous history
        historyEl.empty();

        for (var i = searchHistory.length - 1; i >= 0; i--) {
            var cityInput = searchHistory[i];
            var cityDiv = $("<div>").text(cityInput);
            cityDiv.on("click", function () {
                fetchWeatherData($(this).text());
            });
            historyEl.append(cityDiv);
        }
    }

    // Handle clear button click
    function handleClearButtonClick() {
        localStorage.clear(); // Clear all items in localStorage
        searchHistory = []; // Clear the search history array
        renderCities(); // Update the UI
    }

    // Add event listener to clear button
    $("#clearBtn").on("click", handleClearButtonClick);
    // Store search history
    function storeSearchHistory(searchInput) {
        searchHistory.push(searchInput);
        if (searchHistory.length > 5) {
            searchHistory = searchHistory.slice(-5);
        }
        localStorage.setItem("history", JSON.stringify(searchHistory));
        localStorage.setItem("City", searchInput); // Store searchInput in localStorage with key "City"
        renderCities();
    }

    // Initialize the page
    function init() {
        renderCities();
    }

    init();
});

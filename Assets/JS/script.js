$(document).ready(function () {
    // Set a constant for API Key
    const apiKey = 'e21937afa0005be2a3ff4b5545611fd7';

    // Get jQuery objects for DOM elements
    const historyEl = $("#history");
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


                    var weatherIcon = currentData.weather[0].icon;
                    weatherData = {
                        temp: convertToFarhenheit(currentData.main.temp),
                        wind: convertToMilesPerHour(currentData.wind.speed),
                        humidity: currentData.main.humidity,
                        icon: weatherIcon
                    };
                    // Update the UI with the current weather data
                    $("#city-name").text(searchInput);
                    $("#temp").text("Temperature: " + weatherData.temp.toFixed(2) + " °F");
                    $("#wind").text("Wind Speed: " + weatherData.wind.toFixed(2) + " mph");
                    $("#humidity").text("Humidity: " + weatherData.humidity + "%");
                    $("#current-pic").attr("src", "http://openweathermap.org/img/w/" + weatherData.icon + ".png");
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

            $.getJSON(forecastWeatherUrl)
                .done(function (forecastData) {
                    getForecast(weatherData, forecastData);
                })
                .fail(function (error) {
                    console.log(error);
                });
        }
    }
    // Function to convert temperature from Celsius to Fahrenheit
    function convertToFarhenheit(kelvin) {
        return (kelvin - 273.15) * 9 / 5 + 32;
    }

    // Function to convert wind speed from meters/second to miles/hour
    function convertToMilesPerHour(mps) {
        return mps * 2.23694;
    }

    function getForecast(currentWeather, forecastData) {
        const forecastContainer = $("#forecast");
        forecastContainer.empty(); // Clear previous forecast cards

        let dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

        // Loop through the dailyData and generate forecast cards for the next 5 days
        for (let i = 0; i < dailyData.length; i++) {
            const forecast = dailyData[i];

            // Extract the relevant data from the forecast object
            const forecastDate = new Date(forecast.dt_txt);
            const forecastTemperature = convertToFarhenheit(forecast.main.temp);
            const forecastWind = convertToMilesPerHour(forecast.wind.speed);
            const forecastHumidity = forecast.main.humidity;
            const forecastIcon = forecast.weather[0].icon;

            // Create a new Date object from the forecast date
            const date = new Date(forecastDate);

            // Extract the day, month, and year
            const day = date.getDate();
            const month = date.getMonth() + 1;  // getMonth() returns a zero-based value
            const year = date.getFullYear();

            // Create a short date string
            const shortDate = month + "/" + day + "/" + year;

            // Create the forecast card element
            const forecastCard = $("<div>").addClass("col-2 forecast bg-primary text-white m-2 rounded");

            // Create the content for the forecast card
            const forecastContent = $("<div>")
                .append($("<p>").text(shortDate))
                .append($("<p>").text("Temp: " + forecastTemperature.toFixed(2) + " °F"))
                .append($("<p>").text("Wind: " + forecastWind.toFixed(2) + " mph"))
                .append($("<p>").text("Humidity: " + forecastHumidity + "%"))
                .append($("<img>").attr("src", "http://openweathermap.org/img/w/" + forecastIcon + ".png"));

            console.log(forecastDate);
            // Append the content to the forecast card
            forecastCard.append(forecastContent);

            // Append the forecast card to the forecast container
            forecastContainer.append(forecastCard);
        }
    }


    // Handle form submission
    function handleFormSubmit(event) {
        event.preventDefault();
        var searchInput = searchInputEl.val().trim();
        fetchWeatherData(searchInput);
        storeSearchHistory(searchInput);
    }

    // Handle keyup event on search input
    searchInputEl.on("keypress", function (event) {
        if (event.which === 13) {
            // Enter key pressed
            handleFormSubmit(event);
        }
    });
    // Add event listener to search button
    searchBtnEl.on("click", handleFormSubmit);

    // Render search history cities
    function renderCities() {
        // Clear previous history
        historyEl.empty();

        for (var i = searchHistory.length; i >= 0; i--) {
            var cityInput = searchHistory[i];
            // Append a city list div of <li>
            var cityDiv = $("<li class='list-group-item'>").text(cityInput);
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
        if (searchHistory.includes(searchInput)) {
            // If it exists, return without adding it again
            return;
        }
        searchHistory.push(searchInput);
        if (searchHistory.length > 5) {
            searchHistory = searchHistory.slice(-5);
        }
        localStorage.setItem("Search History", JSON.stringify(searchHistory));
        localStorage.setItem("City", searchInput); // Store searchInput in localStorage with key "City"
        renderCities();
    }

    // Initialize the page
    function init() {
        renderCities();
    }

    init();
});

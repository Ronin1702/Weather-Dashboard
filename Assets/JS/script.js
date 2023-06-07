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
        const currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey;
        const forecastWeatherUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey;

        if (searchInput !== null && searchInput !== undefined && searchInput !== "") {
            // Get today's date
            let today = new Date();

            // Extract the day, month, and year
            let day = today.getDate();
            let year = today.getFullYear();

            // Get the name of the day of the week
            let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            let dayOfWeek = days[today.getDay()];

            // Get the name of the month
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let month = months[today.getMonth()];

            // Create a formatted date string
            let formattedDate = dayOfWeek + " " + month + " " + day + ", " + year;

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
                    $("#city-name").text(searchInput + " Today, " + formattedDate);
                    $("#temp").text("Temperature: " + weatherData.temp.toFixed(2) + " °F");
                    $("#wind").text("Wind Speed: " + weatherData.wind.toFixed(2) + " MPH");
                    $("#humidity").text("Humidity: " + weatherData.humidity + "%");
                    $("#current-pic").attr("src", "http://openweathermap.org/img/w/" + weatherData.icon + ".png");
                })

            $.getJSON(forecastWeatherUrl)
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
            const forecastCard = $("<div>").addClass("col forecast bg-secondary bg-gradient text-white m-1 rounded");

            // Create the content for the forecast card
            const forecastContent = $("<div>").addClass("col")
                .append($("<p>").addClass("text-center fs-4").text(shortDate))
                .append($("<p>").text("Temp: " + forecastTemperature.toFixed(0) + " °F"))
                .append($("<p>").text("Wind: " + forecastWind.toFixed(0) + " MPH"))
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

        // Check if the search input is not empty
        if (searchInput !== "") {
            fetchWeatherData(searchInput);
            storeSearchHistory(searchInput);

            // Clear the input field
            searchInputEl.val("");
        } else {
            return;// Prevent the rest of the function from running
        }
    }

    // Event for keypress on search input
    $('#searchInput').on('keypress', function (event) {
        if (event.which === 13) {
            // Enter key pressed
            event.preventDefault(); // Prevent the default action (form submission)
            handleFormSubmit(event);
            // Change the class to d-block to display weathers
            $('#weathers').removeClass('d-none').addClass('d-block');
            // Clear the input box
            $('#searchInput').val('');
        }
    });

    // Event for click on search button
    $('#searchBtn').on('click', function (event) {
        var searchInput = searchInputEl.val().trim();
        if (searchInput === "") {

            return; // Prevent the rest of the function from running
        }
        handleFormSubmit(event);
        // Change class to d-block when the search button is clicked
        $('#weathers').removeClass('d-none').addClass('d-block');
        // Clear the input box
        $('#searchInput').val('');
    });


    // Render search history cities
    function renderCities() {
        // Clear previous history
        historyEl.empty();

        for (var i = searchHistory.length; i >= 0; i--) {
            var cityInput = searchHistory[i];
            // Append a city list div of <li>
            var cityDiv = $("<li>").addClass("list-group-item").text(cityInput);
            cityDiv.on("click", function () {
                fetchWeatherData($(this).text());
            });
            historyEl.append(cityDiv);
        }
    }

    // Handle clear button click
    $("#clearBtn").on("click", function () {
        localStorage.clear(); // Clear all items in localStorage
        searchHistory = []; // Clear the search history array
        renderCities(); // Update the UI
        // Clear the search input box
        $("#searchInput").val('');
        // Change class back to d-none when the clear button is clicked
        $("#weathers").removeClass("d-block").addClass("d-none");
    });


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
        localStorage.setItem("Current City", searchInput); // Store searchInput in localStorage with key "City"
        renderCities();
    }

    // Initialize the page
    function init() {
        // If there is history in localStorage, get it and display it
        if (localStorage.getItem("Search History")) {
            searchHistory = JSON.parse(localStorage.getItem("Search History"));
            renderCities();

            // Fetch and display weather data of the last searched city
            let lastSearchedCity = searchHistory[searchHistory.length - 1];
            if (lastSearchedCity) {
                fetchWeatherData(lastSearchedCity);
                // Show the weather card
                $("#weathers").removeClass("d-none").addClass("d-block");
            }
        }
    }

    init();

    // Event delegation
    $(document).on({
        mouseenter: function () {
            $(this).css('background-color', '#0d6efd');
            $(this).css('color', '#ffffff');
            $(this).css('opacity', '75%');
        },
        mouseleave: function () {
            $(this).css('background-color', '');
            $(this).css('color', '');
            $(this).css('opacity', '100%');
        }
    },
        'li.list-group-item'
        );

});


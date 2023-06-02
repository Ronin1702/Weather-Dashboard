$(document).ready(function () {
    // set a constant for API Key
    const apiKey = 'e21937afa0005be2a3ff4b5545611fd7';
    // distinguish current weather and forecast weather APIs
    // var cityName = 'Columbus'

    const currentTempEl = document.getElementById("temp");
    const currentWindEl = document.getElementById("wind");
    const currentHumidityEl = document.getElementById("humidity");
    const historyEl = document.getElementById("history");
    var fivedayEl = document.getElementById("fiveday-header");
    var currentWeatherEl = document.getElementById("currentWeather");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    var searchInput = $('#searchInput').val();
    var currentWeatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey;
    console.log(currentWeatherUrl)

    var forecastWeatherUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey;
    console.log(forecastWeatherUrl)

 // retrieves data from the api
 function fetchWeatherData(searchInput) {
    if (searchInput != null || searchInput != undefined|| searchInput != "") {
      fetch(currentWeatherUrl)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            var weatherData= data;
            console.log(weatherData)
            var weatherTemp = data.weather[0].icon;
            console.log(weatherTemp)
            return fetch(forecastWeatherUrl)
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            weatherForecast = data;
            getForecast(weatherData, weatherForecast);
            renderCities();
        }).catch(function (error) {
      });
    } 
    fetchWeatherData();} 
    // Make the searchBtn work and store inputs into localStorage
    // $("#searchBtn").on("click", function(WeatherData) {
       

    //         if (cityInputs.length > 5) {
    //             cityInputs = cityInputs.slice(-5)

    //         }
    //         for (var i = cityInputs.length - 1; i >= 0; i--) {
    //             var cityInputsDiv = $('<div>').text(cityInputs[i])
    //             cityInputsDiv.on('click', function () {
    //                 WeatherData(cityInputs[i])
    //             })
    //             divEl.append(cityInputsDiv)
    //         }

    //         if (cityInputs !== "") {
    //             function currentCityWeather(cityInput) {
    //                 cityInputs.push(cityInput)
    //                 var newCityInput = JSON.stringify(cityInputs)
    //                 localStorage.setItem('City', newCityInput);
    //                 const divEl = $('#history')
    //                 divEl.empty()

    //                 for (var i = cityInputs.length - 1; i >= 0; i--) {
    //                     var cityInputsDiv = $('<div>').text(cityInputs[i])
    //                     cityInputsDiv.on('click', function () {
    //                         currentCityWeather(cityInputs[i])
    //                     })
    //                     divEl.append(cityInputDiv)
    //                 }
    //             }

    //         }

    //     currentCityWeather(cityInput)
    //     $('#cityInput').val('')
    // })


})

$(function () {
    const apiKey = 'e21937afa0005be2a3ff4b5545611fd7'; //OpenWeahter API Key
    const historyEl = $("#history");
    const searchInputEl = $("#searchInput");
    const searchBtnEl = $("#searchBtn");
  
    let searchHistory = JSON.parse(localStorage.getItem("history")) || []; //get search history from localStorage if there's any
    let weatherData;
  
    function fetchWeatherData(searchInput) {
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${apiKey}`;
      const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchInput}&appid=${apiKey}`;
  
      if (searchInput !== "") {
        let today = new Date();
        let dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
        let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][today.getMonth()];
        let formattedDate = `${dayOfWeek} ${month} ${today.getDate()}, ${today.getFullYear()}`;
  
        $.getJSON(currentWeatherUrl)
          .done(function (currentData) {
            var weatherIcon = currentData.weather[0].icon;
            weatherData = {
              temp: convertToFarhenheit(currentData.main.temp),
              wind: convertToMilesPerHour(currentData.wind.speed),
              humidity: currentData.main.humidity,
              icon: weatherIcon
            };
            //Append texts to the targets below:
            $("#city-name").text(`${searchInput} Today, ${formattedDate}`);
            $("#temp").text(`Temperature: ${weatherData.temp.toFixed(2)} °F`); //round to two decimals
            $("#wind").text(`Wind Speed: ${weatherData.wind.toFixed(2)} MPH`); //round to two decimals
            $("#humidity").text(`Humidity: ${weatherData.humidity}%`);
            $("#current-pic").attr("src", `https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`);
  
            storeSearchHistory(searchInput); //store the search inputs into search history
          })
          .fail(function (error) {
            console.log(error);
          });
  
        $.getJSON(forecastWeatherUrl)
          .done(function (forecastData) {
            getForecast(weatherData, forecastData);
            renderCities();
  
            storeSearchHistory(searchInput);
          })
          .fail(function (error) {
            console.log(error);
          });
      }
    }
  
    function convertToFarhenheit(kelvin) {
      return (kelvin - 273.15) * 9 / 5 + 32; //Original data is in kelvin, convert it to F
    }
  
    function convertToMilesPerHour(mps) { //Original data is in m/s, convert it fo mps
      return mps * 2.23694;
    }
  
    function getForecast(currentWeather, forecastData) {
      const forecastContainer = $("#forecast");
      forecastContainer.empty();
  
      let dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00")); // get rid off the times in the string
  
      for (let i = 0; i < dailyData.length; i++) {
        const forecast = dailyData[i];
        const forecastDate = new Date(forecast.dt_txt);
        const forecastTemperature = convertToFarhenheit(forecast.main.temp);
        const forecastWind = convertToMilesPerHour(forecast.wind.speed);
        const forecastHumidity = forecast.main.humidity;
        const forecastIcon = forecast.weather[0].icon;
        const date = new Date(forecastDate); //make a shorter date format so that it will fit in the cards
        const day = date.getDate();
        const month = date.getMonth() + 1; //month array starts at 0 so add 1 for Jan
        const year = date.getFullYear();
        const shortDate = `${month}/${day}/${year}`; //put them together can name it shortDate
  
        const forecastCard = $("<div>").addClass("col forecast bg-secondary bg-gradient text-white m-1 rounded"); 
        const forecastContent = $("<div>").addClass("col") //add the class col to make the cards display evenly regardless screensize
          .append($("<p>").addClass("text-center fs-4").text(shortDate))
          .append($("<p>").text(`Temp: ${forecastTemperature.toFixed(0)} °F`)) //round to no decimals
          .append($("<p>").text(`Wind: ${forecastWind.toFixed(0)} MPH`)) //round to no decimals
          .append($("<p>").text(`Humidity: ${forecastHumidity}%`))
          .append($("<img>").attr("src", `https://openweathermap.org/img/wn/${forecastIcon}@2x.png`)); //make the icon 2x size
  
        forecastCard.append(forecastContent);
        forecastContainer.append(forecastCard);
      }
    }
  
    function formatInput(input) { //make a function to ensure all inputs are recordede with first letter capitalized in each word
      let words = input.toLowerCase().split(' ');
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
      return words.join(' ');
    }
  
    function handleFormSubmit(event) {
      event.preventDefault();
      var searchInput = formatInput(searchInputEl.val().trim());
  
      if (searchInput !== "") {
        fetchWeatherData(searchInput);
        searchInputEl.val("");
      }
    }
  
    $('#searchInput').on('keypress', function (event) {
      if (event.which === 13) {
        event.preventDefault();
        handleFormSubmit(event);
        $('#weathers').removeClass('d-none').addClass('d-block'); //display the weathers when enter is pressed
        $('#searchInput').val(''); //clean the input box and ready it for new inputs
      }
    });
  
    $('#searchBtn').on('click', function (event) {
      var searchInput = searchInputEl.val().trim();
      if (searchInput === "") {
        return;
      }
      handleFormSubmit(event);
      $('#weathers').removeClass('d-none').addClass('d-block'); //also display the weather when search is submitted
      $('#searchInput').val(''); //also clean out the input for incoming inputs
    });
  
    function renderCities() {
      historyEl.empty();
  
      for (var i = searchHistory.length; i >= 0; i--) {
        var cityInput = searchHistory[i];
        var cityDiv = $("<li>").addClass("list-group-item").text(cityInput);
        cityDiv.on("click", function () {
          fetchWeatherData($(this).text());
        });
        historyEl.append(cityDiv);
      }
    }
  
    $("#clearBtn").on("click", function () { //make a clear button to clear all histories
      localStorage.clear();
      searchHistory = [];
      renderCities();
      $("#searchInput").val('');
      $("#weathers").removeClass("d-block").addClass("d-none");
    });
  
    function storeSearchHistory(searchInput) {
      searchInput = formatInput(searchInput);
  
      if (searchHistory.includes(searchInput)) {
        return;
      }
      searchHistory.push(searchInput);
      if (searchHistory.length > 5) {
        searchHistory = searchHistory.slice(-5);
      }
      localStorage.setItem("Search History", JSON.stringify(searchHistory));
      localStorage.setItem("Current City", searchInput);
      renderCities();
    }
  
    function init() {
      if (localStorage.getItem("Search History")) {
        searchHistory = JSON.parse(localStorage.getItem("Search History"));
        renderCities();
  
        let lastSearchedCity = searchHistory[searchHistory.length - 1];
        if (lastSearchedCity) {
          fetchWeatherData(lastSearchedCity);
          $("#weathers").removeClass("d-none").addClass("d-block");
        }
      }
    }
  
    init();
  
    $(document).on({ //first try to use javascript to add a css class within jQuery
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
      'li.list-group-item' //targeting the li in the list-group-item
    );
  });
  
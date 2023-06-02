// Make a API KEY constant
const APIKey = '792a0295ecec4f1950461726eb6aa2ac';

// Get input city weather
// I copied the sample code from my previous project Work-Day-Scheduler and modified them as below
$(document).ready(function () {
    $('#searchBtn') = function () {
        var cityWeatherUrl = "https://api.openweathermap.org/data/3.0/forecast?q=" + cityName + "appid" + APIKey;
        fetch(cityWeatherUrl)
            .then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {
                        responseText.textContent = data;
                        console.log(data)
                    }
                    )
                } return response.json();

            })
    }
})

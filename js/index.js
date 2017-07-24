(function() {

    const API_WOLDTIME_KEY = "4f48bb8456e24561960170705172007";
    const API_WOLDTIME = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WOLDTIME_KEY + "&q=";
    const API_WEATHER_KEY = "80114c7878f599621184a687fc500a12";
    const API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
    const IMG_WEATHER = "http://openweathermap.org/img/w/";

    let today = new Date(),
        timeNow = today.toLocaleTimeString(); // nos muestra hora:minutos AM o PM, ejem: 07:15 PM

    let $body = $("body"),
        $loader = $(".loader");

    let nombreNuevaCiudad = $("[data-input='cityAdd']"),
        buttonAdd = $("[data-button='add']");

    let cities = [],
        buttonLoad = $("[data-saved-cities]");

    $(buttonAdd).on("click", addNewCity);

    $(nombreNuevaCiudad).on('keypress', function(e) {
        if (e.which === 13) // which es para saber que codigo de la tecla presionada es
        {
            addNewCity(e);
        }
    });

    $(buttonLoad).on("click", loadSavedCities);

    let cityWeather = {};
    cityWeather.zone;
    cityWeather.icon;
    cityWeather.temp;
    cityWeather.temp_max;
    cityWeather.temp_min;
    cityWeather.main;

    if (navigator.geolocation) {
        //true
        navigator.geolocation.getCurrentPosition(getCoords, errorFound);
    } else {
        alert("Actualiza tu navegador");
    }

    function errorFound(error) {
        alert("ocurrio un error " + error.code);
        // 0: Error desconocido
        // 1: Permiso denegado
        // 2: Posicion no esta disponible
        // 3: Timeout
    }

    function getCoords(position) {
        let lat = position.coords.latitude,
            lon = position.coords.longitude;
        console.log(`${"Latitud: " + lat + "\nLongitud: " + lon }`);
        $.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
    }

    function getCurrentWeather(data) {
        cityWeather.zone = data.name;
        cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
        cityWeather.temp = data.main.temp - 273.15;
        cityWeather.temp_max = data.main.temp_max - 273.15;
        cityWeather.temp_min = data.main.temp_min - 273.15;
        cityWeather.main = data.weather[0].main;

        renderTemplate(cityWeather);
    }

    // render template
    function activateTemplate(id) {
        let t = document.querySelector(id);
        return document.importNode(t.content, true);
    }

    function renderTemplate(cityWeather, localTime) {
        let clone = activateTemplate('#template--city');
        let timeToShow;

        if (localTime) {
            timeToShow = localTime.split(" ")[1];
        } else {
            timeToShow = timeNow;
        }

        clone.querySelector("[data-time]").innerHTML = timeToShow;
        clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
        clone.querySelector("[data-icon]").src = cityWeather.icon;
        clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
        clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1);
        clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);

        $($loader).hide();
        $($body).append(clone);
    }

    function addNewCity(e) {
        e.preventDefault(); // le quita la funcionalidad al boton submit
        $.getJSON(API_WEATHER_URL + "q=" + $(nombreNuevaCiudad).val(), getWeatherNewCity);
    } // fin de addNewCity

    function getWeatherNewCity(data)
    {
        $.getJSON(API_WOLDTIME + $(nombreNuevaCiudad).val(), function(response) {

            $(nombreNuevaCiudad).val();
            cityWeather = {};
            cityWeather.zone = data.name;
            cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
            cityWeather.temp = data.main.temp - 273.15;
            cityWeather.temp_max = data.main.temp_max - 273.15;
            cityWeather.temp_min = data.main.temp_min - 273.15;
            cityWeather.main = data.weather[0].main;

            renderTemplate(cityWeather, response.data.time_zone[0].localtime);

            cities.push(cityWeather);
            localStorage.setItem("cities", JSON.stringify(cities)); // stringgify guarda en tipo objeto
        });
    }
    
    function loadSavedCities(e)
    {
        e.preventDefault();
        
        function renderCities(cities)
        {
            cities.forEach(function(city)
            {
                renderTemplate(city);
            });
        }
        let cities = JSON.parse(localStorage.getItem("cities"));
        renderCities(cities);
    }

})();
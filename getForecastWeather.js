// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var accents = require("remove-accents");
const apiKey = process.env.API_KEY || require('./config.json').apiKey;

// Function
async function getForecastWeather(search, forecast) {
    apiCityURL = `https://nominatim.openstreetmap.org/search/${accents.remove(search)}?format=json&limit=1`;

    // Fetch city inputted to get its coordinates
    const cityResponse = await fetch(apiCityURL);
    const cityData = await cityResponse.json();

    // Answer if fail
    const FAIL = new MessageEmbed()
        .setColor("#FFD800")
        .setTitle("Cette ville n'existe pas")
        .setTimestamp()
        .setFooter({ text: `Météo à ${search}`, iconURL: "https://cdn.discordapp.com/app-icons/766729142325608448/8eac1c43e5011e7797dd34d106cb67f4.png" })

    // Sends failing message if Nominatim response is empty
    if (!cityData[0]) {
        return { embeds: [FAIL] };
    } else {
        var latitude = cityData[0].lat;
        var longitude = cityData[0].lon;
        var cityName = cityData[0].display_name;
        var cityNameDisplay = cityName.split(",");
    }

    // Weather API Call
    apiWeatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&lang=fr&key=${apiKey}`;
    const weatherResponse = await fetch(apiWeatherURL);
    const weatherData = await weatherResponse.json();



    // Values except AQI, sunset and sunrise time
    var temp = Math.round(weatherData['data'][forecast]['temp']);
    var app_temp = Math.round((weatherData['data'][forecast]['app_max_temp'] + weatherData['data'][forecast]['app_max_temp']) / 2);
    var wind_spd = weatherData['data'][forecast]['wind_spd'];
    wind_spd = !isNaN(wind_spd) ? (weatherData['data'][forecast]['wind_spd'] * 3.6).toFixed(1) : 0;
    var clouds = Math.round(weatherData['data'][forecast]['clouds']);
    var rh = Math.round(weatherData['data'][forecast]['rh']);
    var precip = weatherData['data'][forecast]['precip'];
    precip = !isNaN(wind_spd) ? (weatherData['data'][forecast]['precip'] * 3.6).toFixed(1) : 0;
    var snow = weatherData['data'][forecast]['snow'];
    snow = !isNaN(snow) ? (weatherData['data'][forecast]['snow']).toFixed(1) : 0;
    var sunset = new Date(weatherData['data'][forecast]['sunset_ts'] * 1000).toLocaleTimeString("fr-FR", {timeZone: "Europe/Paris", timeStyle: "short"});
    var sunrise = new Date(weatherData['data'][forecast]['sunrise_ts'] * 1000).toLocaleTimeString("fr-FR", {timeZone: "Europe/Paris", timeStyle: "short"});

    var date = new Date(weatherData['data'][forecast]['valid_date']);

    // Answer
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const weatherEmbed = new MessageEmbed()
        .setColor("#FFD800")
        .setTitle(`La météo à ${cityNameDisplay[0]}, ${weatherData['country_code']} :`)
        .setDescription(`**Prévisions pour le ${date.toLocaleDateString("fr-FR", options)}**`)
        .setThumbnail(`https://www.weatherbit.io/static/img/icons/${weatherData['data'][forecast]['weather']['icon']}.png`)
        .addFields(
            { name: "Météo", value: weatherData['data'][forecast]['weather']['description'], inline: true },
            { name: "Température", value: `${temp}°C`, inline: true },
            { name: "Ressenti", value: `${app_temp}°C`, inline: true },
            { name: "Vitesse du vent", value: `${wind_spd} km/h`, inline: true },
            { name: "Direction du vent", value: weatherData['data'][forecast]['wind_cdir_full'], inline: true },
            { name: "Couverture nuageuse", value: `${clouds} %`, inline: true },
            { name: "Probabilité de précipitations", value: `${weatherData['data'][forecast]['pop']} %`, inline: true },
            { name: "Taux d'humidité", value: `${rh} %`, inline: true },
            { name: "Précipitations", value: `${precip} mm/h`, inline: true },
            { name: "Chutes de neige", value: `${snow} mm/h`, inline: true },
            { name: "Lever du soleil", value: sunrise, inline: true },
            { name: "Coucher du soleil", value: sunset, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Météo à ${cityNameDisplay[0]}`, iconURL: "https://cdn.discordapp.com/app-icons/766729142325608448/8eac1c43e5011e7797dd34d106cb67f4.png" })

    return { embeds: [weatherEmbed] };
};

// Exports function
module.exports = getForecastWeather;
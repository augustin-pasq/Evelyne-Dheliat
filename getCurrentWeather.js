// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var accents = require("remove-accents");
const { apiKey } = require('./config.json');

// Function
async function getCurrentWeather(search) {
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
    apiWeatherURL = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&lang=fr&key=${apiKey}`;
    const weatherResponse = await fetch(apiWeatherURL);
    const weatherData = await weatherResponse.json();

    // Values except AQI, sunset and sunrise time
    var temp = Math.round(weatherData.data[0].temp);
    var app_temp = Math.round(weatherData.data[0].app_temp);
    var wind_spd = weatherData.data[0].wind_spd;
    wind_spd = !isNaN(wind_spd) ? (weatherData.data[0].wind_spd * 3.6).toFixed(1) : 0;
    var clouds = Math.round(weatherData.data[0].clouds);
    var rh = Math.round(weatherData.data[0].rh);
    var precip = weatherData.data[0].precip;
    precip = !isNaN(wind_spd) ? (weatherData.data[0].precip * 3.6).toFixed(1) : 0;
    var snow = weatherData.data[0].snow;
    snow = !isNaN(snow) ? (weatherData.data[0].snow * 3.6).toFixed(1) : 0;

    // Air Quality Index
    var aqi = weatherData.data[0].aqi;
    if (0 >= aqi <= 50) {aqi = `Bien (${weatherData.data[0].aqi})`;}
    else if (51 >= aqi <= 100) {aqi = `Modéré (${weatherData.data[0].aqi})`;}
    else if (101 >= aqi <= 150) {aqi = `Malsain pour les groupes sensibles (${weatherData.data[0].aqi})`;}
    else if (151 >= aqi <= 200) {aqi = `Mauvais pour la santé (${weatherData.data[0].aqi})`;}
    else if (201 >= aqi <= 300) {aqi = `Très malsain (${weatherData.data[0].aqi})`;}
    else if (301 >= aqi <= 500) {aqi = `Dangereux (${weatherData.data[0].aqi})`;}

    // Sunset time
    var [sunsetHour, sunsetMinutes] = weatherData.data[0].sunset.split(":");
    var sunset = new Date();
    sunset.setUTCHours(sunsetHour);
    sunset.setUTCMinutes(sunsetMinutes);
    sunset = sunset.toLocaleTimeString("fr-FR").split(":");

    // Sunrise time
    var [sunriseHour, sunriseMinutes] = weatherData.data[0].sunrise.split(":");
    var sunrise = new Date();
    sunrise.setUTCHours(sunriseHour);
    sunrise.setUTCMinutes(sunriseMinutes);
    sunrise = sunrise.toLocaleTimeString("fr-FR").split(":");

    // Answer
    const weatherEmbed = new MessageEmbed()
        .setColor("#FFD800")
        .setTitle(`La météo à ${cityNameDisplay[0]}, ${weatherData.data[0].country_code} :`)
        .setThumbnail(`https://www.weatherbit.io/static/img/icons/${weatherData.data[0].weather.icon}.png`)
        .addFields(
            { name: "Météo", value: weatherData.data[0].weather.description, inline: true },
            { name: "Température", value: `${temp}°C`, inline: true },
            { name: "Ressenti", value: `${app_temp}°C`, inline: true },
            { name: "Vitesse du vent", value: `${wind_spd} km/h`, inline: true },
            { name: "Direction du vent", value: weatherData.data[0].wind_cdir_full, inline: true },
            { name: "Couverture nuageuse", value: `${clouds} %`, inline: true },
            { name: "Taux d'humidité", value: `${rh} %`, inline: true },
            { name: "Précipitations", value: `${precip} mm/h`, inline: true },
            { name: "Chutes de neige", value: `${snow} mm/h`, inline: true },
            { name: "Lever du soleil", value: sunrise[0] + ":" + sunrise[1], inline: true },
            { name: "Coucher du soleil", value: sunset[0] + ":" + sunset[1], inline: true },
            { name: "Qualité de l'air", value: aqi, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Météo à ${weatherData.data[0].city_name}`, iconURL: "https://cdn.discordapp.com/app-icons/766729142325608448/8eac1c43e5011e7797dd34d106cb67f4.png" })

    return { embeds: [weatherEmbed] };
};

// Exports function
module.exports = getCurrentWeather;
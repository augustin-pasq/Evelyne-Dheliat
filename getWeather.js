// Dependencies
const { MessageEmbed } = require('discord.js')
const fetch = require("node-fetch")
const accents = require("remove-accents")
const apiKey = require('./config.json').apiKey

// Function
async function getWeather(search, mode, days) {
    let apiCityURL = `https://nominatim.openstreetmap.org/search?q=${accents.remove(search)}&format=json&limit=1`

    // Fetch city inputted to get its coordinates
    const cityData = await (await fetch(apiCityURL)).json()

    // Answer if fail
    const FAIL = new MessageEmbed()
        .setColor("#FFD800")
        .setTitle("Cette ville n'existe pas")
        .setTimestamp()
        .setFooter({
            text: `Météo à ${search}`,
            iconURL: "https://cdn.discordapp.com/app-icons/766729142325608448/8eac1c43e5011e7797dd34d106cb67f4.png"
        })

    // Sends failing message if Nominatim response is empty
    if (!cityData[0]) {
        return {embeds: [FAIL]}
    } else {
        var latitude = cityData[0].lat
        var longitude = cityData[0].lon
        var cityName = cityData[0].display_name
        var cityNameDisplay = cityName.split(",")
    }

    let weatherObject = {}
    const weatherEmbed = new MessageEmbed()
        .setColor("#FFD800")
        .setTimestamp()
        .setFooter({ text: `Météo à ${cityNameDisplay[0]}`, iconURL: "https://cdn.discordapp.com/app-icons/766729142325608448/8eac1c43e5011e7797dd34d106cb67f4.png" })

    // Current weather
    if (mode === "current") {
        let apiWeatherURL = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&lang=fr&key=${apiKey}`
        const weatherData = await (await fetch(apiWeatherURL)).json()

        weatherObject.countryCode       = weatherData.data[0].country_code
        weatherObject.thumbnail         = weatherData.data[0].weather.icon
        weatherObject.weather           = weatherData.data[0].weather.description
        weatherObject.temp              = Math.round(weatherData.data[0].temp)
        weatherObject.feeling           = Math.round(weatherData.data[0].app_temp)
        weatherObject.windSpeed         = !isNaN(weatherData.data[0].wind_spd) ? (weatherData.data[0].wind_spd * 3.6).toFixed(1) : 0
        weatherObject.windDirection     = weatherData.data[0].wind_cdir_full
        weatherObject.clouds            = Math.round(weatherData.data[0].clouds)
        weatherObject.humidity          = Math.round(weatherData.data[0].rh)
        weatherObject.precipitations    = !isNaN(weatherData.data[0].precip) ? (weatherData.data[0].precip * 3.6).toFixed(1) : 0
        weatherObject.snow              = !isNaN(weatherData.data[0].snow) ? (weatherData.data[0].snow * 3.6).toFixed(1) : 0

        // Air Quality Index
        if (0 >= weatherData.data[0].aqi <= 50) {weatherObject.airQuality = `Bien (${weatherData.data[0].aqi})`}
        else if (51 >= weatherData.data[0].aqi <= 100) {weatherObject.airQuality = `Modéré (${weatherData.data[0].aqi})`}
        else if (101 >= weatherData.data[0].aqi <= 150) {weatherObject.airQuality = `Malsain pour les groupes sensibles (${weatherData.data[0].aqi})`}
        else if (151 >= weatherData.data[0].aqi <= 200) {weatherObject.airQuality = `Mauvais pour la santé (${weatherData.data[0].aqi})`}
        else if (201 >= weatherData.data[0].aqi <= 300) {weatherObject.airQuality = `Très malsain (${weatherData.data[0].aqi})`}
        else if (301 >= weatherData.data[0].aqi <= 500) {weatherObject.airQuality = `Dangereux (${weatherData.data[0].aqi})`}

        // Sunset time
        let [sunsetHour, sunsetMinutes] = weatherData.data[0].sunset.split(":")
        let sunset = new Date()
        sunset.setUTCHours(parseInt(sunsetHour))
        sunset.setUTCMinutes(parseInt(sunsetMinutes))
        sunset.toLocaleTimeString("fr-FR").split(":")
        weatherObject.sunset = sunset[0] + ":" + sunset[1]

        // Sunrise time
        let [sunriseHour, sunriseMinutes] = weatherData.data[0].sunrise.split(":")
        let sunrise = new Date()
        sunrise.setUTCHours(parseInt(sunriseHour))
        sunrise.setUTCMinutes(parseInt(sunriseMinutes))
        sunrise.toLocaleTimeString("fr-FR").split(":")
        weatherObject.sunrise = sunrise[0] + ":" + sunrise[1]

        weatherEmbed
            .addField("Qualité de l'air", weatherObject.airQuality, true)
    }

    // Forecast weather
    else if (mode === "forecast") {
        let apiWeatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&lang=fr&key=${apiKey}`
        const weatherData = await (await fetch(apiWeatherURL)).json()

        weatherObject.countryCode       = weatherData['country_code']
        weatherObject.thumbnail         = weatherData['data'][days]['weather']['icon']
        weatherObject.weather           = weatherData['data'][days]['weather']['description']
        weatherObject.temp              = Math.round(weatherData['data'][days]['temp'])
        weatherObject.feeling           = Math.round((weatherData['data'][days]['app_max_temp'] + weatherData['data'][days]['app_max_temp']) / 2)
        weatherObject.windSpeed         = !isNaN(weatherData['data'][days]['wind_spd']) ? (weatherData['data'][days]['wind_spd'] * 3.6).toFixed(1) : 0
        weatherObject.windDirection     = weatherData['data'][days]['wind_cdir_full']
        weatherObject.clouds            = Math.round(weatherData['data'][days]['clouds'])
        weatherObject.humidity          = Math.round(weatherData['data'][days]['rh'])
        weatherObject.precipitations    = !isNaN(weatherData['data'][days]['precip']) ? (weatherData['data'][days]['precip'] * 3.6).toFixed(1) : 0
        weatherObject.snow              = !isNaN(weatherData['data'][days]['snow']) ? (weatherData['data'][days]['snow']).toFixed(1) : 0
        weatherObject.sunset            = new Date(weatherData['data'][days]['sunset_ts'] * 1000).toLocaleTimeString("fr-FR", {timeZone: "Europe/Paris", timeStyle: "short"})
        weatherObject.sunrise           = new Date(weatherData['data'][days]['sunrise_ts'] * 1000).toLocaleTimeString("fr-FR", {timeZone: "Europe/Paris", timeStyle: "short"})

        weatherEmbed
            .setDescription(`**Prévisions pour le ${(new Date(weatherData['data'][days]['valid_date'])).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}**`)
            .addField("Probabilité de précipitations", `${weatherData['data'][days]['pop']} %`, true)
    }

    weatherEmbed
        .setTitle(`La météo à ${cityNameDisplay[0]}, ${weatherObject.countryCode} :`)
        .setThumbnail(`https://www.weatherbit.io/static/img/icons/${weatherObject.thumbnail}.png`)
        .addField("Météo", weatherObject.weather, true)
        .addField("Température", `${weatherObject.temp}°C`, true)
        .addField("Ressenti", `${weatherObject.feeling}°C`, true)
        .addField("Vitesse du vent", `${weatherObject.windSpeed} km/h`, true)
        .addField("Direction du vent", weatherObject.windDirection, true)
        .addField("Couverture nuageuse", `${weatherObject.clouds} %`, true)
        .addField("Taux d'humidité", `${weatherObject.humidity} %`, true)
        .addField("Précipitations", `${weatherObject.precipitations} mm/h`, true)
        .addField("Chutes de neige", `${weatherObject.snow} mm/h`, true)
        .addField("Lever du soleil", weatherObject.sunrise, true)
        .addField("Coucher du soleil", weatherObject.sunset, true)

    return { embeds: [weatherEmbed] }
}

// Exports function
module.exports = getWeather
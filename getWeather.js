// Dependencies
const fetch = require("node-fetch");
var accents = require("remove-accents");

// Constants
const API_BASE_CITY = "https://nominatim.openstreetmap.org/search/";
const API_TAIL_CITY = "?format=json&limit=1";
const API_BASE_WEATHER = "https://api.weatherbit.io/v2.0/current?";
const API_TAIL_WEATHER = "&lang=fr&key=0a91045a07174a34bcf3ee5fe6587a5f";

// Main function
export async function getWeather(search) {
  search = accents.remove(search);
  apiCityURL = `${API_BASE_CITY}${search}${API_TAIL_CITY}`;

  // Fetch city inputted to get its coordinates
  const CityResponse = await fetch(apiCityURL);
  const CityData = await CityResponse.json();

  const FAIL = new MessageEmbed()
    .setColor("#FFD800")
    .setTitle(
      "Cette ville n'existe pas"
    )
    .setTimestamp()
  //.setFooter(`Météo à ${WeatherData.data[0].city_name}`);

  if (!CityData[0]) {
    return { embeds: [FAIL] };
  } else {
    var latitude = CityData[0].lat;
    var longitude = CityData[0].lon;
    var cityName = CityData[0].display_name;
    var cityNameDisplay = cityName.split(",");
  }

  // Weather API Call
  apiWeatherURL = `${API_BASE_WEATHER}lat=${latitude}&lon=${longitude}${API_TAIL_WEATHER}`;
  const WeatherResponse = await fetch(apiWeatherURL);
  const WeatherData = await WeatherResponse.json();
  console.log(apiWeatherURL);

  // Values rounding
  var temp = Math.round(WeatherData.data[0].temp);
  var app_temp = Math.round(WeatherData.data[0].app_temp);
  var wind_spd = WeatherData.data[0].wind_spd * 3.6;
  if (!isNaN(wind_spd)) {
    wind_spd = (WeatherData.data[0].wind_spd * 3.6).toFixed(1);
  } else {
    wind_spd = 0;
  }
  var clouds = Math.round(WeatherData.data[0].clouds);
  var rh = Math.round(WeatherData.data[0].rh);
  var precip = WeatherData.data[0].precip * 3.6;
  if (!isNaN(precip)) {
    precip = (WeatherData.data[0].precip * 3.6).toFixed(1);
  } else {
    precip = 0;
  }
  var snow = WeatherData.data[0].snow * 3.6;
  if (!isNaN(snow)) {
    snow = (WeatherData.data[0].snow * 3.6).toFixed(1);
  } else {
    snow = 0;
  }

  // Quality air data explanation
  if (WeatherData.data[0].aqi >= 0 && WeatherData.data[0].aqi <= 50) {
    var aqi = `Bien (${WeatherData.data[0].aqi})`;
  } else if (WeatherData.data[0].aqi >= 51 && WeatherData.data[0].aqi <= 100) {
    var aqi = `Modéré (${WeatherData.data[0].aqi})`;
  } else if (WeatherData.data[0].aqi >= 101 && WeatherData.data[0].aqi <= 150) {
    var aqi = `Malsain pour les groupes sensibles (${WeatherData.data[0].aqi})`;
  } else if (WeatherData.data[0].aqi >= 151 && WeatherData.data[0].aqi <= 200) {
    var aqi = `Mauvais pour la santé (${WeatherData.data[0].aqi})`;
  } else if (WeatherData.data[0].aqi >= 201 && WeatherData.data[0].aqi <= 300) {
    var aqi = `Très malsain (${WeatherData.data[0].aqi})`;
  } else if (WeatherData.data[0].aqi >= 301 && WeatherData.data[0].aqi <= 500) {
    var aqi = `Dangereux (${WeatherData.data[0].aqi})`;
  }

  // Sunset time
  var [sunsetHour, sunsetMinutes] = WeatherData.data[0].sunset.split(":");
  var sunset = new Date();
  sunset.setUTCHours(sunsetHour);
  sunset.setUTCMinutes(sunsetMinutes);
  sunset = sunset.toLocaleTimeString("fr-FR").split(":");

  // Sunrise time
  var [sunriseHour, sunriseMinutes] = WeatherData.data[0].sunrise.split(":");
  var sunrise = new Date();
  sunrise.setUTCHours(sunriseHour);
  sunrise.setUTCMinutes(sunriseMinutes);
  sunrise = sunrise.toLocaleTimeString("fr-FR").split(":");

  // Bot's answer preset
  const weatherEmbed = new MessageEmbed()
    .setColor("#FFD800")
    .setTitle(
      `La météo à ${cityNameDisplay[0]}, ${WeatherData.data[0].country_code} :`
    )
    .setThumbnail(
      `https://www.weatherbit.io/static/img/icons/${WeatherData.data[0].weather.icon}.png`
    )
    .addFields(
      {
        name: "Météo",
        value: WeatherData.data[0].weather.description,
        inline: true,
      },
      { name: "Température", value: `${temp}°C`, inline: true },
      { name: "Ressenti", value: `${app_temp}°C`, inline: true },
      { name: "Vitesse du vent", value: `${wind_spd} km/h`, inline: true },
      {
        name: "Direction du vent",
        value: WeatherData.data[0].wind_cdir_full,
        inline: true,
      },
      { name: "Couverture nuageuse", value: `${clouds} %`, inline: true },
      { name: "Taux d'humidité", value: `${rh} %`, inline: true },
      { name: "Précipitations", value: `${precip} mm/h`, inline: true },
      { name: "Chutes de neige", value: `${snow} mm/h`, inline: true },
      {
        name: "Lever du soleil",
        value: sunrise[0] + ":" + sunrise[1],
        inline: true,
      },
      {
        name: "Coucher du soleil",
        value: sunset[0] + ":" + sunset[1],
        inline: true,
      },
      { name: "Qualité de l'air", value: aqi, inline: true }
    )
    .setTimestamp()
  //.setFooter(`Météo à ${WeatherData.data[0].city_name}`);

  return { embeds: [weatherEmbed] };
}
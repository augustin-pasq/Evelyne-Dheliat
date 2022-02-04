// Import dependencies
const Discord = require("discord.js");
const fetch = require("node-fetch");

// Initialize Discord bot
const client = new Discord.Client();

// Define constants
const API_BASE = "https://api.weatherbit.io/v2.0/current?"
const API_TAIL = "&country=FR&lang=fr&key=0a91045a07174a34bcf3ee5fe6587a5f"
const DISCORD_TOKEN = require("./token.js");

// Bot launching
client.on("ready", () => {
  client.user.setActivity("la météo", { type: "WATCHING" })
  console.log(`Logged in as Évelyne Dhéliat!`);
});

// Current weather
client.on("message", async message => {
  if (message.content.startsWith("!weather")) { // Prefix
    var localisation = encodeURIComponent((message.content.substr(9)).trim().toString().toLowerCase()); // The bot takes the localisation
  
    // Weather by postal code
    if (!isNaN(localisation)) {
      var apiURL = `${API_BASE}postal_code=${localisation}${API_TAIL}`}

    // Weather by city name
    else {

      // Weather for all cities except Toulon
      if (localisation != "toulon") {
        var apiURL = `${API_BASE}city=${localisation}${API_TAIL}`}

      // Weather for Toulon
      else {
        var apiURL = `${API_BASE}city=toulon,93${API_TAIL}`}
    };

    // API call
    let {data} = await fetch(apiURL).then(response => response.json());
    const [answer] = data;
  
    // Values rounding
    var temp_arr = Math.round(answer.temp);
    var app_temp_arr = Math.round(answer.app_temp);
    var wind_spd_arr = (answer.wind_spd * 3.6).toFixed(1);
    var clouds_arr = Math.round(answer.clouds);
    var rh_arr = Math.round(answer.rh);
    var precip_arr = (answer.precip).toFixed(1)
    var snow_arr = (answer.snow).toFixed(1)

    // Quality air data explanation
    if (answer.aqi >= 0 && answer.aqi <=50) {
      var answer_aqi = `Bien (${answer.aqi})`};
    if (answer.aqi >= 51 && answer.aqi <=100) {
      var answer_aqi = `Modéré (${answer.aqi})`};
    if (answer.aqi >= 101 && answer.aqi <=150) {
      var answer_aqi = `Malsain pour les groupes sensibles (${answer.aqi})`};
    if (answer.aqi >= 151 && answer.aqi <=200) {
      var answer_aqi = `Mauvais pour la santé (${answer.aqi})`};
    if (answer.aqi >= 201 && answer.aqi <=300) {
      var answer_aqi = `Très malsain (${answer.aqi})`};
    if (answer.aqi >= 301 && answer.aqi <=500) {
      var answer_aqi = `Dangereux (${answer.aqi})`};
  
    // Bot's answer preset
    const meteoEmbed = new Discord.MessageEmbed()
      .setColor("#FFD800")
      .setTitle(`La météo à ${answer.city_name}, ${answer.country_code} :`)
      .setThumbnail(`https://www.weatherbit.io/static/img/icons/${answer.weather.icon}.png`)
      .addFields(
        {name: "Météo", value: answer.weather.description, inline: true},
        {name: "Température", value: `${temp_arr}°C`, inline: true},
        {name: "Ressenti", value: `${app_temp_arr}°C`, inline: true},
        {name: "Vitesse du vent", value: `${wind_spd_arr} km/h`, inline: true},
        {name: "Direction du vent", value: answer.wind_cdir_full, inline: true},
        {name: "Couverture nuageuse", value: `${clouds_arr} %`, inline: true},
        {name: "Taux d'humidité", value: `${rh_arr} %`, inline: true},
        {name: "Précipitations", value: `${precip_arr} mm/h`, inline: true},
        {name: "Chutes de neige", value: `${snow_arr} mm/h`, inline: true},
        {name: "Lever du soleil", value: answer.sunrise, inline: true},
        {name: "Coucher du soleil", value: answer.sunset, inline: true},
        {name: "Qualité de l'air", value: answer_aqi, inline: true})
      .setTimestamp()
      .setFooter(`Météo à ${answer.city_name}`)
  
    message.channel.send(meteoEmbed)}
});

// Bot login
client.login(DISCORD_TOKEN);
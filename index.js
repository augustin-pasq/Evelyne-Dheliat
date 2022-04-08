// Import dependencies
const { Client, Intents, MessageEmbed } = require('discord.js');
var cron = require("node-cron");
const { token } = require('./config.json');
// Dependencies
const fetch = require("node-fetch");
var accents = require("remove-accents");

// Constants
const API_BASE_CITY = "https://nominatim.openstreetmap.org/search/";
const API_TAIL_CITY = "?format=json&limit=1";
const API_BASE_WEATHER = "https://api.weatherbit.io/v2.0/current?";
const API_TAIL_WEATHER = "&lang=fr&key=0a91045a07174a34bcf3ee5fe6587a5f";

// Initialize Discord bot
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Define global variables
var dailyWeatherState = true;
var dailyWeatherStatePrint = dailyWeatherState == true ? "activé" : "désactivé";
var dailyWeatherPlace = "Vannes";
var dailyWeatherChannel = "927953774889300068";

// Bot launching
client.once('ready', () => {
  client.user.setActivity("la météo", { type: "WATCHING" });
  console.log("Logged in as Évelyne Dhéliat!");
});

// Get Weather
async function getWeather(search) {
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

// Daily message
client.on("ready", () => {
  cron.schedule(`0 45 6 * * *`, () => {
    if (dailyWeatherState == true) {
      const weather = Promise.resolve(getWeather(dailyWeatherPlace));
      weather.then((weatherEmbed) => {
        const today = new Date();
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        client.channels.cache
          .get(dailyWeatherChannel)
          .send(
            `Nous sommes le **${today.toLocaleDateString(
              "fr-FR",
              options
            )}**, voici le bulletin météo du jour`
          );
        client.channels.cache.get(dailyWeatherChannel).send(weatherEmbed);
      });
    }
  });
});

// Bot's commands
client.on("message", async (message) => {
  if (message.content.startsWith("!weather")) {
    var parameters = message.content.split(" ");

    // Settings
    if (parameters[1] == "-s") {
      if (message.member.permissionsIn(message.channel).has("ADMINISTRATOR")) {
        // Settings state
        if (!parameters[2]) {
          const settingsEmbed = new Discord.MessageEmbed()
            .setColor("#FFD800")
            .setTitle("Configuration d'Évelyne Dhéliat")
            .setThumbnail(
              "https://cdn.discordapp.com/avatars/766729142325608448/33bbb8fb64ccdcf1aede33eb45161045.webp"
            )
            .addFields(
              {
                name: "Bulletin météo quotidien",
                value: dailyWeatherStatePrint,
                inline: false,
              },
              {
                name: "Lieu du bulletin météo",
                value: dailyWeatherPlace,
                inline: false,
              },
              {
                name: "Salon du bulletin météo",
                value: `<#${dailyWeatherChannel}>`,
                inline: false,
              }
            )
            .setTimestamp()
            .setFooter("Configuration d'Évelyne Dhéliat");

          message.reply(settingsEmbed);
        }

        // Daily weather state
        else if (parameters[2] == "daily-weather") {
          if (!parameters[3]) {
            message.reply(
              `le bulletin météo quotidien est actuellement ${dailyWeatherStatePrint}`
            );
          } else if (parameters[3] == "on") {
            dailyWeatherState = true;
            message.reply("le bulletin météo quotidien est maintenant activé");
          } else if (parameters[3] == "off") {
            dailyWeatherState = false;
            message.reply(
              "le bulletin météo quotidien est maintenant désactivé"
            );
          } else {
            message.reply(
              "le paramètre est invalide pour la commande entrée, envoie ``!weather -s help`` pour afficher les réglages disponibles"
            );
          }
        }

        // Daily weather place
        else if (parameters[2] == "daily-weather-place") {
          if (!parameters[3]) {
            message.reply(
              `le bulletin météo est actuellement celui de ${dailyWeatherPlace}`
            );
          } else {
            dailyWeatherPlace = parameters[3];
            message.reply(
              `le bulletin météo quotidien sera désormais celui de ${dailyWeatherPlace}`
            );
          }
        }

        // Daily weather channel
        else if (parameters[2] == "daily-weather-channel") {
          if (parameters[3] == "") {
            message.reply(
              `le bulletin météo est actuellement celui de <#${dailyWeatherChannel}>`
            );
          } else {
            dailyWeatherChannel = parameters[3];
            message.reply(
              `le bulletin météo quotidien sera désormais celui de <#${dailyWeatherChannel}>`
            );
          }
        }

        // Help
        else if (parameters[2] == "help") {
          const settingsEmbed = new Discord.MessageEmbed()
            .setColor("#FFD800")
            .setTitle("Liste des réglages d'Évelyne Dhéliat")
            .setDescription(
              "Si aucun paramètre dans la commande n'est entré, l'état du réglage sera renvoyé"
            )
            .setThumbnail(
              "https://cdn.discordapp.com/avatars/766729142325608448/33bbb8fb64ccdcf1aede33eb45161045.webp"
            )
            .addFields(
              {
                name: "Activer le bulletin météo quotidien",
                value: "``!weather -s daily-weather on/off``",
                inline: false,
              },
              {
                name: "Choisir la ville du bulletin météo",
                value: "``!weather -s daily-weather-place Ville``",
                inline: false,
              },
              {
                name: "Choisir le channel du bulletin météo",
                value: "``!weather -s daily-weather-channel #Channel``",
                inline: false,
              }
            )
            .setTimestamp()
            .setFooter("Liste des régalges d'Évelyne Dhéliat");

          message.reply(settingsEmbed);
        }

        // Other cases
        else {
          message.reply(
            "ce réglage n'existe pas, envoie ``!weather -s help`` pour afficher les réglages disponibles"
          );
        }
      } else {
        message.reply(
          "les réglages sont accessibles uniquement aux administrateurs"
        );
      }
    }

    // Help
    else if (parameters[1] == "-h") {
      const settingsEmbed = new Discord.MessageEmbed()
        .setColor("#FFD800")
        .setTitle("Voici Évelyne Dhéliat")
        .setDescription("Guide pour utiliser le bot")
        .setThumbnail(
          "https://cdn.discordapp.com/avatars/766729142325608448/33bbb8fb64ccdcf1aede33eb45161045.webp"
        )
        .addFields(
          {
            name: "Météo actuelle",
            value: "``!weather -c Ville``",
            inline: false,
          },
          {
            name: "Météo prévisionnelle",
            value: "``!weather -f Ville``",
            inline: false,
          },
          { name: "Réglages", value: "``!weather -s Réglage``", inline: false },
          { name: "Aide", value: "``!weather -h``", inline: false }
        )
        .setTimestamp()
        .setFooter("Évelyne Dhéliat");

      message.reply(settingsEmbed);
    }

    // Other cases
    else {
      message.reply(
        "ce paramètre n'existe pas, envoie ``!weather -h`` pour afficher les paramètres disponibles"
      );
    }
  }
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
  const givenPlace = interaction.options.getString('place');

	if (commandName === 'current') {
    const weather = Promise.resolve(
      getWeather(givenPlace)
    );
    weather.then(async({embeds: [weatherEmbed]}) => {
      await interaction.reply({embeds: [weatherEmbed]});
    });
	} else if (commandName === 'settings') {
		await interaction.reply('Server info.');
	} else if (commandName === 'help') {
    const settingsEmbed = new MessageEmbed()
    .setColor("#FFD800")
    .setTitle("Voici Évelyne Dhéliat")
    .setDescription("Guide pour utiliser le bot")
    .setThumbnail(
      "https://cdn.discordapp.com/avatars/766729142325608448/33bbb8fb64ccdcf1aede33eb45161045.webp"
    )
    .addFields(
      {
        name: "Météo actuelle",
        value: "``/current Ville``",
        inline: false,
      },
      {
        name: "Météo prévisionnelle",
        value: "``/forecast Ville``",
        inline: false,
      },
      { name: "Réglages", value: "``/settings Réglage``", inline: false },
      { name: "Aide", value: "``/help``", inline: false }
    )
    .setTimestamp()
    await interaction.reply({embeds: [settingsEmbed]})
  }
});

client.login(token);

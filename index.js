// Import dependencies
const { Client, Intents } = require('discord.js');
var cron = require("node-cron");
const getCurrentWeather = require('./getCurrentWeather.js');
const token = process.env.DISCORD_TOKEN || require('./config.json').token;

// Initialize Discord bot
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Bot launching
client.once('ready', () => {
    client.user.setActivity("la météo", { type: "WATCHING" });
    console.log("Logged in as Évelyne Dhéliat!");
});

// Daily message
client.on("ready", () => {
    cron.schedule(`0 45 6 * * *`, () => {
            const weather = Promise.resolve(getCurrenttWeather("Vannes"));
            const today = new Date();
            const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
            const dailyMessage = `Nous sommes le **${today.toLocaleDateString("fr-FR", options)}**, voici le bulletin météo du jour`

            weather.then(async ({ embeds: [weatherEmbed] }) => {
                await client.channels.cache.get("927953774889300068").send({
                    content: dailyMessage,
                    embeds: [weatherEmbed]
                  });
            });
    });
});

// Bot's commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const givenPlace = interaction.options.getString('place');

    if (commandName === 'current') {
        const weather = Promise.resolve(getCurrentWeather(givenPlace));
        weather.then(async ({ embeds: [weatherEmbed] }) => {
            await interaction.reply({ embeds: [weatherEmbed] });
        });
    }
});

client.login(token);
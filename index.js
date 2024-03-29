// Import dependencies
const { Client, Intents } = require('discord.js')
const cron = require("node-cron")
const getWeather = require('./getWeather.js')
const token = require('./config.json').token
const { channel } = require("./config.json")

// Initialize Discord bot
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

// Bot launching
client.once('ready', () => {
    client.user.setActivity("la météo", { type: "WATCHING" })
    console.log("Logged in as Évelyne Dhéliat!")
})

// Daily message
client.on("ready", () => {
    cron.schedule(`0 45 6 * * *`, () => {
        const today = new Date()
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        const dailyMessage = `Nous sommes le **${today.toLocaleDateString("fr-FR", options)}**, voici le bulletin météo du jour`

        const weather = Promise.resolve(getWeather("Vannes", "forecast", 0))
        weather.then(({ embeds: [weatherEmbed] }) => {
            client.channels.cache.get(channel).send({
                content: dailyMessage,
                embeds: [weatherEmbed]
            })
        })
    })
})

// Bot commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    const { commandName } = interaction
    const givenPlace = interaction.options.getString('place')
    const givenForecast = interaction.options.getInteger('forecast')

    if (commandName === 'current') {
        const weather = Promise.resolve(getWeather(givenPlace, "current"))
        weather.then(async ({ embeds: [weatherEmbed] }) => {
            await interaction.reply({ embeds: [weatherEmbed] })
        })
    }
    
    if (commandName === 'forecast') {
        const weather = Promise.resolve(getWeather(givenPlace, "forecast", givenForecast))
        weather.then(async ({ embeds: [weatherEmbed] }) => {
            await interaction.reply({ embeds: [weatherEmbed] })
        })
    }
})

client.login(token)

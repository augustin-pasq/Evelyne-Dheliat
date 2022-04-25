const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	{
		name: "current",
		description: "Current weather for the given place",
		options: [
			{
				name: "place",
				description: "The place you want to know the weather for",
				type: 3, // String
				required: true
			}
		]
	},
	{
		name: "forecast",
		description: "Forecast weather for the given place",
		options: [
			{
				name: "place",
				description: "The place you want to know the weather for",
				type: 3, // String
				required: true
			},
			{
				name: "forecast",
				description: "The number of days of the forecast",
				type: 4, // Integer
				min_value: 1,
				max_value: 15,
				required: true
			}
		]
	}
]

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
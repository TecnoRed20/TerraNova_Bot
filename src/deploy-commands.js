require('dotenv').config();
const { REST, Routes } = require('discord.js');
const token = process.env.TOKEN_BOT;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const fs = require('node:fs');
const path = require('node:path');

const commandsPublic = [];
const commandsPrivateTN = [];
const commandsPrivateSC = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			if(folder === "-SlimeCraft-"){
				commandsPrivateSC.push(command.data.toJSON());
			}
			if(folder === "-TerraNova-" || folder === "-SlimeCraft-"){
				commandsPrivateTN.push(command.data.toJSON());
			}
			else {
				commandsPublic.push(command.data.toJSON());
			}
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commandsPublic.length} application (/) public commands.`);
		// The put method is used to fully refresh all commands with the current set
		const dataPublic = await rest.put(
      Routes.applicationCommands(clientId),            // Cargar comandos publicos
			{ body: commandsPublic },
		);
		console.log(`Successfully reloaded ${dataPublic.length} application (/) public commands.`);

		// Comandos para TerraNova
		console.log(`Started refreshing ${commandsPrivateTN.length} application (/) private commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const dataPrivateTN = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId), // Cargar comandos privados
			{ body: commandsPrivateTN },
		);
		console.log(`Successfully reloaded ${dataPrivateTN.length} application (/) private commands.`);

		// Comandos para SlimeCraft
		console.log(`Started refreshing ${commandsPrivateSC.length} application (/) private commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const dataPrivateSC = await rest.put(
			Routes.applicationGuildCommands(clientId, "778926791339278357"), // Cargar comandos privados
			{ body: commandsPrivateSC },
		);
		console.log(`Successfully reloaded ${dataPrivateSC.length} application (/) private commands.`);

	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
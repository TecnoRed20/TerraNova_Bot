import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';
import eLog from './utils/eLog';

const token = process.env.TOKEN_BOT;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commandsPublic = [];
const commandsPrivateTN = [];
const commandsPrivatePC = [];
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
			// Inserto todo en TerraNova
			commandsPrivateTN.push(command.data.toJSON());

			if (folder === "-SlimeCraft-") {
				commandsPrivateSC.push(command.data.toJSON());
			}
			else if (folder === "-PandaCommunity-") {
				commandsPrivatePC.push(command.data.toJSON());
			}
			else if (!folder.startsWith("-")) {
				commandsPublic.push(command.data.toJSON());
				// Si es un comando publico lo borro de TerraNova
				commandsPrivateTN.pop()
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

		// Delete al Slash Command
		if (false) {
			// TerraNova
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
			console.log('Successfully deleted all guild commands (TerraNova).')

			// PandaCommunity
			await rest.put(Routes.applicationGuildCommands(clientId, "877590914674094121"), { body: [] })
			console.log('Successfully deleted all guild commands (PandaCommunity).')

			// SlimeCraft
			await rest.put(Routes.applicationGuildCommands(clientId, "778926791339278357"), { body: [] })
			console.log('Successfully deleted all guild commands (SlimeCraft).')

			// Publicos
			await rest.put(Routes.applicationCommands(clientId), { body: [] })
			console.log('Successfully deleted all public commands.')
		}
		else {
			console.log(`Started refreshing ${commandsPublic.length} application (/) public commands.`);
			const dataPublic = await rest.put(
				Routes.applicationCommands(clientId),            // Cargar comandos publicos
				{ body: commandsPublic },
			);
			console.log(`Successfully reloaded ${dataPublic.length} application (/) public commands.`);

			// Comandos para TerraNova
			console.log(`Started refreshing ${commandsPrivateTN.length} application (/) private commands (TerraNova).`);
			const dataPrivateTN = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId), // Cargar comandos privados
				{ body: commandsPrivateTN },
			);
			console.log(`Successfully reloaded ${dataPrivateTN.length} application (/) private commands (TerraNova).`);

			// Comandos para SlimeCraft
			console.log(`Started refreshing ${commandsPrivateSC.length} application (/) private commands (SlimeCraft).`);
			const dataPrivateSC = await rest.put(
				Routes.applicationGuildCommands(clientId, "778926791339278357"), // Cargar comandos privados
				{ body: commandsPrivateSC },
			);
			console.log(`Successfully reloaded ${dataPrivateSC.length} application (/) private commands (SlimeCraft).`);
		}

	} catch (error) {
		console.error(error);
	}
})();
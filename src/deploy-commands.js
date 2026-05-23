import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';

const token = process.env.TOKEN_BOT;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const GUILDS = {
	TerraNova: guildId,
	PandaCommunity: '877590914674094121',
	SlimeCraft: '778926791339278357',
	MomentoRelax: '612740202061889759',
};

// Carpeta privada -> guild donde deben cargarse sus comandos.
const PRIVATE_FOLDER_TO_GUILD = {
	'-PandaCommunity-': GUILDS.PandaCommunity,
	'-SlimeCraft-': GUILDS.SlimeCraft,
	'-MomentoRelax-': GUILDS.MomentoRelax,
};

const commandsPublic = [];
const privateCommandsByGuild = {
	[GUILDS.TerraNova]: [],
	[GUILDS.PandaCommunity]: [],
	[GUILDS.SlimeCraft]: [],
	[GUILDS.MomentoRelax]: [],
};

// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from each commands folder.
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	const isPrivateFolder = folder.startsWith('-');
	const guildForFolder = PRIVATE_FOLDER_TO_GUILD[folder];

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment.
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			const commandData = command.data.toJSON();

			if (!isPrivateFolder) {
				commandsPublic.push(commandData);
				continue;
			}

			// Todos los comandos privados viven tambien en TerraNova.
			privateCommandsByGuild[GUILDS.TerraNova].push(commandData);

			// Y, si aplica, tambien se cargan en su guild dedicada.
			if (guildForFolder) {
				privateCommandsByGuild[guildForFolder].push(commandData);
			}
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

const deleteGuildCommands = async (guildIdToDelete, guildName) => {
	await rest.put(Routes.applicationGuildCommands(clientId, guildIdToDelete), { body: [] });
	console.log(`Successfully deleted all guild commands (${guildName}).`);
};

const deployGuildCommands = async (guildIdToDeploy, guildName, commands) => {
	console.log(`Started refreshing ${commands.length} application (/) private commands (${guildName}).`);
	const data = await rest.put(
		Routes.applicationGuildCommands(clientId, guildIdToDeploy),
		{ body: commands },
	);
	console.log(`Successfully reloaded ${data.length} application (/) private commands (${guildName}).`);
};

// and deploy your commands!
(async () => {
	try {

		// Delete al Slash Command
		if (false) {
			await deleteGuildCommands(GUILDS.TerraNova, 'TerraNova');
			await deleteGuildCommands(GUILDS.PandaCommunity, 'PandaCommunity');
			await deleteGuildCommands(GUILDS.SlimeCraft, 'SlimeCraft');
			await deleteGuildCommands(GUILDS.MomentoRelax, 'MomentoRelax');

			// Publicos
			await rest.put(Routes.applicationCommands(clientId), { body: [] });
			console.log('Successfully deleted all public commands.')
		}
		else {
			console.log(`Started refreshing ${commandsPublic.length} application (/) public commands.`);
			const dataPublic = await rest.put(
				Routes.applicationCommands(clientId),            // Cargar comandos publicos
				{ body: commandsPublic },
			);
			console.log(`Successfully reloaded ${dataPublic.length} application (/) public commands.`);

			await deployGuildCommands(
				GUILDS.TerraNova,
				'TerraNova',
				privateCommandsByGuild[GUILDS.TerraNova],
			);

			await deployGuildCommands(
				GUILDS.SlimeCraft,
				'SlimeCraft',
				privateCommandsByGuild[GUILDS.SlimeCraft],
			);

			await deployGuildCommands(
				GUILDS.MomentoRelax,
				'MomentoRelax',
				privateCommandsByGuild[GUILDS.MomentoRelax],
			);
		}

	} catch (error) {
		console.error(error);
	}
})();
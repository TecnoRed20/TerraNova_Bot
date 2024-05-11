require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

// Conexion a Base de Datos
require('./database.js')

// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");

// Create a new client instance with all permisions
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const client = new Client({ intents: [131071], partials: [Partials.Message, Partials.Channel, Partials.Reaction], });

/* #region Cargar Comandos */
// Coleccion de comandos
client.commands = new Collection();

// Ruta de comandos
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Itera cada carpeta dentro de commands.
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  // Itera cada fichero dentro de la carpeta.
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Establezca un nuevo elemento en la colección con la clave como nombre de comando y el valor como módulo exportado
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}
/* #endregion */

/* #region Cargar Eventos */
// Ruta de los eventos
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

// Por cada fichero cargamos los eventos
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
/* #endregion */

// Conectar el bot a discord
const token = process.env.TOKEN_BOT;
client.login(token);
import { Events, ActivityType } from "discord.js";
import eLog from "../utils/eLog";
import startTracking from '../utils/mailPackageTracker'
import MailPackageTracker from "../models/mailPackageTracker";

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    setInterval(async () => {
      const options = [
        {
          type: ActivityType.Custom,
          text: `Trabajando para ${client.guilds?.cache?.size} ${client.guilds?.cache?.size == 1 ? 'servidor' : 'servidores'}`,
          status: "online",
        },
        {
          type: ActivityType.Custom,
          text: "Esperando ordenes",
          status: "idle",
        },
        {
          type: ActivityType.Custom,
          text: 'Jugando a "..."',
          status: "dnd",
        },
      ];

      const option = Math.floor(Math.random() * options.length);

      client.user.setPresence({
        activities: [{
          name: options[option].text,
          type: options[option].type,
        }],
        status: options[option].status,
      });
    }, 60 * 1000);
    eLog(`Estoy listo! Conectado como ${client.user.tag}`);

    // Cargar Roles Temporales desde BBDD

    // Cargar MPT (Mail Package Tracker)
    eLog("[MPT] Cargando...")
    const mptsSaved = await MailPackageTracker.find({ expiredAt: null });
    mptsSaved.forEach(mptSaved => {
      startTracking(client, mptSaved.packageId)
      eLog(`[MPT] Paquete ${mptSaved.packageId} cargado.`)
    })
    eLog("[MPT] Finalizado")
  },
};

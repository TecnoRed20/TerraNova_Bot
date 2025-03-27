import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import MailPackageTracker from '../../models/mailPackageTracker'
import startTracking from '../../utils/mailPackageTracker';
import eLog from '../../utils/eLog';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mpt')
		.setDescription('Seguimiento de paquetes de correo')
    .addSubcommand(start =>
      start.setName('start')
      .setDescription('Inicia el seguimiento de un paquete')
      .addStringOption(opcion =>
        opcion.setName('company')
        .setDescription('Compañia de reparto')
        .setRequired(true)
        .addChoices(
          { name: 'Correos', value: 'correos' },
          { name: 'EcoScooting', value: 'ecoscooting' },
          { name: 'CTT Express', value: 'cttexpress' },
        )
      )
      .addStringOption(opcion =>
        opcion.setName('package')
        .setDescription('Codigo del Paquete')
        .setRequired(true)
      )
    )
    .addSubcommand(stop =>
      stop.setName('stop')
      .setDescription('Detiene el seguimiento de un paquete')
      .addStringOption(opcion =>
        opcion.setName('package')
        .setDescription('Codigo del Paquete')
        .setRequired(true)
      )
    ),
  
  /**
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction) {
    const { options, user, client } = interaction;
    const userId = user.id;
    const subCommand = options.getSubcommand();
    const packageId = options.getString('package');
    const companyId = options.getString('company')

    if (subCommand === "start") {
      if(await MailPackageTracker.findOne({
        companyId,
        packageId,
        expiredAt: null
      }) !== null) {
        return await interaction.reply({
          content: `Este paquete se esta controlando actualmente.`,
          ephemeral: true,
        });
      }

      await new MailPackageTracker({
        companyId,
        packageId,
        userId
      }).save();

      startTracking(client, packageId, companyId)
      return await interaction.reply({
        content: `Se ha añadido el paquete: ${packageId} al seguimiento.`,
        ephemeral: true,
      });
    }
    else if(subCommand === "stop") {
      const mptInstance = await MailPackageTracker.findOneAndUpdate({packageId, userId, intervalId: { $ne: null }}, {expiredAt: new Date(), intervalId: null});
      if(!mptInstance) {
        return await interaction.reply({
          content: `No tienes registrado este paquete.`,
          ephemeral: true,
        });
      }
      
      const intervalId = Number(mptInstance.intervalId);
      clearInterval(intervalId)
      return await interaction.reply({
        content: `Se ha detenido el seguimiento del paquete: ${mptInstance.packageId}.`,
        ephemeral: true,
      });
    }
	},
};
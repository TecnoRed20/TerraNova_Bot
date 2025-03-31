import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
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
    )
    .addSubcommand(list =>
      list.setName('list')
      .setDescription('Lista los repartos activos del usuario')
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
    else if(subCommand === "list") {
      // TODO: Implementar una estrctura para retornar la lista de paquetes en seguimiento 

      const filters = {
        userId,
        intervalId: { $ne: null } // Para obtener solo las activas
      }

      const allPackageActive = await MailPackageTracker.find(filters);
      const processDataPackage = allPackageActive.map(packageActive => {
        const companyId = packageActive.companyId;
        const packageId = packageActive.packageId;

        switch (companyId) {
          case "correos":
            return {
              company: "Correos",
              message: `Paquete: [${packageId}](https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number=${packageId})`
            }
      
          case "ecoscooting":
            return {
              company: "EcoScooting",
              message: `Paquete: [${packageId}](https://www.ecoscooting.com/tracking/${packageId})`
            }
      
          case "cttexpress":
            return {
              company: "CTT Express",
              message: `Paquete: [${packageId}](https://www.cttexpress.com/localizador-de-envios/?sc=${packageId})`
            }
      
          default:
            return {
              company: "Error",
              message: "Ha ocurrido un error inesperado."
            }
        }
      })
      const filterPackage = processDataPackage.filter(x => x.company !== "Error");

      const groupedPackage = Object.values(filterPackage.reduce((acc, { company, message }) => {
        acc[company] = acc[company] || { company, message: new Set() };
        acc[company].message.add(message);
        return acc;
      }, {})).map(({ company, message }) => ({ company, message: [...message] }));

      const embed = new EmbedBuilder()
        .setTitle("Paquetes en seguimiento")
        .setColor("#0099ff");

      groupedPackage.forEach(({ company, message }) => {
        embed.addFields({
            name: `📢 ${company}`,
            value: message.map(msg => `- ${msg}`).join("\n"),
            inline: false
        });
      });

      if(client) {
        const user = await client.users.fetch(userId);
        const mdChannel = await user.createDM(true);
        mdChannel.send({ embeds: [embed] })
      }

      return await interaction.reply({
        content: `Revisa el DM`,
        ephemeral: true,
      });
    }
	},
};
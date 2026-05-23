import { SlashCommandBuilder, CommandInteraction, ChannelType, MessageFlags } from 'discord.js';
import eLog from '../../utils/eLog';

const AFK_CHANNEL_ID = '886679500551782412';
const BUILDING_CATEGORY_ID = '612740202796154912';

// Canales con posición fija al final (antes de AFK)
const FIXED_POSITION_CHANNELS = [
  { id: '811331463164592188', name: 'Otros' },      // Primero
  { id: '1438258420942897365', name: 'Estudio' },   // Después de Otros
  { id: '811326615425908807', name: 'Cine' },       // Después de Estudio
  { id: '1505343213484113970', name: 'Música' },    // Antes de AFK
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bfm')
    .setDescription('BuildingFloorManager - Ajusta el nombre de los pisos en los canales de voz'),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const guild = interaction.guild;
      const buildingVoiceChannels = guild.channels.cache.filter(
        channel => channel.type === ChannelType.GuildVoice && channel.parentId === BUILDING_CATEGORY_ID
      );
      
      const afkChannel = buildingVoiceChannels.get(AFK_CHANNEL_ID);
      const fixedChannelIds = FIXED_POSITION_CHANNELS.map(fc => fc.id);
      const allExcludedIds = [AFK_CHANNEL_ID, ...fixedChannelIds];
      
      const regularChannels = buildingVoiceChannels.filter(channel => !allExcludedIds.includes(channel.id));
      const fixedChannels = FIXED_POSITION_CHANNELS.map(fc => buildingVoiceChannels.get(fc.id)).filter(c => c);

      if (!afkChannel) {
        await interaction.editReply('❌ No se encontró el canal AFK.');
        return;
      }

      const getAlphabeticName = (name) => {
        return name.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/gi, '').toLowerCase();
      };

      const getNumbers = (name) => {
        const match = name.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };

      const channelsArray = Array.from(regularChannels.values());
      const sortedChannels = channelsArray.sort((a, b) => {
        const nameA = getAlphabeticName(a.name);
        const nameB = getAlphabeticName(b.name);
        
        // Primero comparar alfabéticamente Z-A
        const alphaCompare = nameB.localeCompare(nameA, 'es');
        
        // Si son iguales alfabéticamente, ordenar por número 0-9
        if (alphaCompare === 0) {
          return getNumbers(a.name) - getNumbers(b.name);
        }
        
        return alphaCompare;
      });

      // Total de canales que reciben numeración (alfabéticos + fijos)
      const totalChannels = sortedChannels.length + fixedChannels.length;
      let currentPosition = 0;
      let skipped = 0;
      let updated = 0;

      // Primero los canales alfabéticos
      for (let i = 0; i < sortedChannels.length; i++) {
        const channel = sortedChannels[i];
        const floorNumber = totalChannels - currentPosition;
        const nameWithoutParenthesis = channel.name.replace(/\([^)]*\)/, '').trim();
        const newName = `${nameWithoutParenthesis} (P${floorNumber})`;

        // Verificar si ya está en la posición correcta con el nombre correcto
        const isNameCorrect = channel.name === newName;
        const isPositionCorrect = channel.position === currentPosition;

        if (isNameCorrect && isPositionCorrect) {
          skipped++;
          currentPosition++;
          continue;
        }

        if (!isNameCorrect) {
          await channel.setName(newName);
        }
        if (!isPositionCorrect) {
          await channel.setPosition(currentPosition);
        }
        
        updated++;
        currentPosition++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Luego los canales fijos en orden
      for (let i = 0; i < fixedChannels.length; i++) {
        const channel = fixedChannels[i];
        const floorNumber = totalChannels - currentPosition;
        const nameWithoutParenthesis = channel.name.replace(/\([^)]*\)/, '').trim();
        const newName = `${nameWithoutParenthesis} (P${floorNumber})`;

        // Verificar si ya está en la posición correcta con el nombre correcto
        const isNameCorrect = channel.name === newName;
        const isPositionCorrect = channel.position === currentPosition;

        if (isNameCorrect && isPositionCorrect) {
          skipped++;
          currentPosition++;
          continue;
        }

        if (!isNameCorrect) {
          await channel.setName(newName);
        }
        if (!isPositionCorrect) {
          await channel.setPosition(currentPosition);
        }
        
        updated++;
        currentPosition++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Finalmente AFK al final
      if (afkChannel.position !== currentPosition) {
        await afkChannel.setPosition(currentPosition);
      }

      eLog(`[BFM] ${totalChannels} canales reorganizados en ${guild.name} (${updated} actualizados, ${skipped} omitidos)`);
      await interaction.editReply(`✅ ${totalChannels} canales reorganizados alfabéticamente.\n📊 Actualizados: ${updated} | Omitidos: ${skipped}`);

    } catch (error) {
      eLog(`[BFM] Error: ${error.message}`);
      await interaction.editReply(`❌ Error al reorganizar los canales: ${error.message}`);
    }
  },
};
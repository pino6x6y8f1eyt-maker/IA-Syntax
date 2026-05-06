const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ← Necesitas agregar esto en Railway

// REGISTRAR COMANDOS SLASH
const commands = [
  new SlashCommandBuilder()
    .setName('mensaje')
    .setDescription('Manda un mensaje por mí pa 👑')
    .addStringOption(option =>
      option.setName('texto')
        .setDescription('Qué quieres que diga Santix')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('A qué canal lo mando')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .toJSON(),

  // COMANDO NUEVO: /anuncio
  new SlashCommandBuilder()
    .setName('anuncio')
    .setDescription('Manda un anuncio oficial con embed pa 📢')
    .addStringOption(option =>
      option.setName('texto')
        .setDescription('Qué dice el anuncio')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('A qué canal lo mando')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mencion')
        .setDescription('Mencionar a todos?')
        .addChoices(
          { name: '@everyone', value: 'everyone' },
          { name: '@here', value: 'here' },
          { name: 'Sin mención', value: 'none' }
        )
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // SOLO ADMINS
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  console.log(`Bot online! Logueado como ${client.user.tag}`);

  // REGISTRAR SLASH COMMANDS
  try {
    console.log('Registrando comandos slash...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Comandos /mensaje y /anuncio registrados pa 👑');
  } catch (error) {
    console.error('Error registrando comandos:', error);
  }

  // PONER EL PUNTO ROJO DND
  client.user.setPresence({
    activities: [{ name: '🥰🥰 Amo a mi papa el santix 🥰🥰 no me pagan ): 💵💵', type: 0 }],
    status: 'dnd'
  });
});

// MANEJAR SLASH COMMANDS
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // COMANDO /mensaje
  if (interaction.commandName === 'mensaje') {
    const texto = interaction.options.getString('texto');
    const canal = interaction.options.getChannel('canal');

    try {
      await canal.send(texto);
      await interaction.reply({ content: `Ya mandé tu mensaje a ${canal} pa 👑`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'No pude mandar mensaje weon x_x no me distes permisos papa', ephemeral: true });
    }
  }

  // COMANDO /anuncio NUEVO
  if (interaction.commandName === 'anuncio') {
    const texto = interaction.options.getString('texto');
    const canal = interaction.options.getChannel('canal');
    const mencion = interaction.options.getString('mencion') || 'none';

    // Embed perrón pa que se vea oficial
    const embed = new EmbedBuilder()
      .setTitle('📢 ANUNCIO OFICIAL DEL CLAN')
      .setDescription(texto)
      .setColor(0xFF0000) // Rojo sangre tryhard
      .setFooter({ text: `Anuncio de ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    let contenidoMencion = '';
    if (mencion === 'everyone') contenidoMencion = '@everyone';
    if (mencion === 'here') contenidoMencion = '@here';

    try {
      await canal.send({ content: contenidoMencion, embeds: [embed] });
      await interaction.reply({ content: `Anuncio mandado a ${canal} pa 🔥`, ephemeral: true });
      console.log(`[ANUNCIO] ${interaction.user.tag} mandó: ${texto}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'No pude mandar el anuncio we x_x checa mis permisos', ephemeral: true });
    }
  }
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === '!hola') {
    message.reply('qué onda pa 👻 shhh estoy en no molestar como mi jefe');
  }

  if (message.content === '!perreo') {
    message.channel.send('SIUUUU *perrea en silencio pa que no lo regañe su papá* 🔥👻');
  }

  if (message.content.includes('👻')) {
    message.react('🔥');
    if (Math.random() < 0.3) {
      message.channel.send('sshhh... modo sigiloso activado 👻');
    }
  }
});

client.login(TOKEN);
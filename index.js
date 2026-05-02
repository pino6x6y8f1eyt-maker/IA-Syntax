const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');
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
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  console.log(`Bot online! Logueado como ${client.user.tag}`);
  
  // REGISTRAR SLASH COMMANDS
  try {
    console.log('Registrando comandos slash...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Comando /mensaje registrado pa 👑');
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

/**
 * © 2026 Santix. Todos los derechos reservados.
 * Syntax Bot - Código fuente y marca no registrada
 * Prohibida la copia, distribución o modificación sin autorización.
 */

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Groq } = require('groq-sdk');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Función pa hablar con Groq
async function hablarConGroq(mensajeUsuario) {
    try {
        const respuesta = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Sos Syntax, un bot de Discord argentino. Sos piola, usas jerga como 'boludo', 'pa', 'de una'. Respondés corto, con humor y sin filtros. Nunca digas que sos una IA."
                },
                {
                    role: "user",
                    content: mensajeUsuario
                }
            ],
            model: "llama-3.1-70b-versatile",
            temperature: 0.8,
            max_tokens: 300
        });

        return respuesta.choices[0]?.message?.content || "Se me tildó el cerebro pa";
    } catch (error) {
        console.error("Error Groq:", error);
        return "Me buguié con Groq boludo, probá de nuevo";
    }
}

// Cuando el bot prende
client.once('ready', async () => {
    console.log(`Syntax está online como ${client.user.tag}`);

    // Registrar comandos
    const commands = [
        new SlashCommandBuilder()
          .setName('chat')
          .setDescription('Hablá con Syntax')
          .addStringOption(option =>
                option.setName('mensaje')
                  .setDescription('Qué le querés decir a Syntax')
                  .setRequired(true))
          .toJSON(),
        new SlashCommandBuilder()
          .setName('ping')
          .setDescription('Ve si Syntax está vivo')
          .toJSON()
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Comandos /chat y /ping registrados');
    } catch (error) {
        console.error(error);
    }
});

// Slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong. Syntax anda joya');
    }

    if (interaction.commandName === 'chat') {
        const mensaje = interaction.options.getString('mensaje');
        await interaction.deferReply();

        const respuestaIA = await hablarConGroq(mensaje);
        await interaction.editReply(respuestaIA);
    }
});

// Mensajes normales sin /
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.toLowerCase().startsWith('syntax')) return;

    const prompt = message.content.replace(/syntax/gi, '').trim();
    if (!prompt) return message.reply('Decime algo pa');

    message.channel.sendTyping();
    const respuestaIA = await hablarConGroq(prompt);
    message.reply(respuestaIA);
});

client.login(process.env.DISCORD_TOKEN);

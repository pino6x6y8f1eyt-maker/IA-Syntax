/**
 * © 2026 Santix. Todos los derechos reservados.
 * Syntax Bot - Código fuente y marca no registrada
 */

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActivityType } = require('discord.js');
const { Groq } = require('groq-sdk');

const client = new Client({
    intents: [GatewayIntentBits.Guilds] // Sin MessageContent, sin bardo
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

client.once('ready', async () => {
    console.log(`Syntax está online como ${client.user.tag}`);

    // Se pone DND apenas prende
    client.user.setPresence({
        activities: [{ name: 'Haciéndose el importante', type: ActivityType.Custom }],
        status: 'dnd'
    });

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
         .setName('papa')
         .setDescription('Syntax imita a tu viejo')
         .addStringOption(option =>
                option.setName('frase')
                 .setDescription('Qué querés que diga como tu viejo')
                 .setRequired(false))
         .toJSON(),
        new SlashCommandBuilder()
         .setName('dnd')
         .setDescription('Cambiá el estado DND de Syntax')
         .addStringOption(option =>
                option.setName('estado')
                 .setDescription('Qué está haciendo Syntax')
                 .setRequired(false))
         .toJSON(),
        new SlashCommandBuilder()
         .setName('online')
         .setDescription('Pone a Syntax verde otra vez')
         .toJSON()
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Comandos /chat, /papa, /dnd y /online registrados');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Comando /chat con Groq
    if (interaction.commandName === 'chat') {
        const mensaje = interaction.options.getString('mensaje');
        await interaction.deferReply();

        try {
            const respuesta = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Sos Syntax, un bot argentino. Respondés corto, piola y con humor." },
                    { role: "user", content: mensaje }
                ],
                model: "llama-3.1-70b-versatile",
                max_tokens: 300
            });

            const texto = respuesta.choices[0]?.message?.content || "Se me bugueó pa";
            await interaction.editReply(texto);

        } catch (error) {
            console.error(error);
            await interaction.editReply("Groq se cayó boludo, probá más tarde");
        }
    }

    // Comando /papa
    if (interaction.commandName === 'papa') {
        const frase = interaction.options.getString('frase');
        const frasesDePapa = [
            "Apagá esa luz que no vivimos en el Sheraton, pibe",
            "En mis tiempos esto se arreglaba con una patada en el orto",
            "¿Vos te creés que la plata crece en los árboles? Andá a laburar",
            "A ver si agarrás la escoba un poco che",
            "Ya son las 10, a la cama",
            "Cuando yo tenía tu edad ya mantenía una familia"
        ];
        
        let respuesta = "";
        if (frase) {
            respuesta = `*Se saca el cinto* ${frase}... te lo digo yo que soy tu padre.`;
        } else {
            respuesta = frasesDePapa[Math.floor(Math.random() * frasesDePapa.length)];
        }
        
        await interaction.reply(respuesta);
    }

    // Comando /dnd
    if (interaction.commandName === 'dnd') {
        const estado = interaction.options.getString('estado') || 'No molestar, estoy con tu vieja';
        
        client.user.setPresence({
            activities: [{ name: estado, type: ActivityType.Custom }],
            status: 'dnd'
        });
        
        await interaction.reply(`Listo pa, ahora estoy en DND: ${estado} 🔴`);
    }

    // Comando /online
    if (interaction.commandName === 'online') {
        client.user.setPresence({
            activities: [{ name: 'Disponible pa joder', type: ActivityType.Custom }],
            status: 'online'
        });
        
        await interaction.reply('Ya estoy verde de nuevo pa 🟢');
    }
});

client.login(process.env.DISCORD_TOKEN);

/**
 * © 2026 Santix. Todos los derechos reservados.
 * Syntax Bot - Código fuente y marca no registrada
 */

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { Groq } = require('groq-sdk');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

client.once('ready', () => {
    console.log(`Syntax está online como ${client.user.tag}`);

    // Se pone DND apenas prende y ya
    client.user.setPresence({
        activities: [{ name: 'No jodan', type: ActivityType.Custom }],
        status: 'dnd'
    });
    console.log('Syntax en DND 🔴');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.trim()) return;
    if (message.content.startsWith('/')) return;

    message.channel.sendTyping();

    try {
        const respuesta = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Sos Syntax, un bot argentino. Respondés corto, piola y con humor." },
                { role: "user", content: message.content }
            ],
            model: "llama3-8b-8192",
            max_tokens: 200,
            timeout: 8000
        });

        const texto = respuesta.choices[0]?.message?.content || "Se me bugueó pa";
        message.reply(texto);

    } catch (error) {
        console.error("Error Groq:", error.message);
        message.reply("Groq se murió boludo 💀");
    }
});

client.login(process.env.DISCORD_TOKEN);

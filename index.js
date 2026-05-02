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

// Saca el ID del canal de las variables de Railway
const CANAL_PERMITIDO = process.env.CHANNEL_ID;

async function mandarLog(mensaje) {
    if (!CANAL_PERMITIDO) return;
    try {
        const canal = await client.channels.fetch(CANAL_PERMITIDO);
        if (canal && canal.isTextBased()) {
            await canal.send(`💀 **Log Syntax:** ${mensaje}`);
        }
    } catch (e) {
        console.error("No pude mandar log:", e.message);
    }
}

client.once('ready', () => {
    console.log(`✅ Syntax online como ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'Solo hablo acá', type: ActivityType.Custom }],
        status: 'dnd'
    });

    if (!CANAL_PERMITIDO) {
        console.error("❌ Falta CHANNEL_ID en las variables de Railway");
    } else {
        mandarLog("Prendí en DND pa 🔴");
    }
});

client.on('messageCreate', async message => {
    // 1. Ignora bots
    if (message.author.bot) return;

    // 2. SOLO RESPONDE EN EL CANAL PERMITIDO
    if (!CANAL_PERMITIDO || message.channel.id!== CANAL_PERMITIDO) return;

    // 3. Ignora mensajes vacíos o comandos
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

        const texto = respuesta.choices[0]?.message?.content;
        if (!texto) throw new Error("Groq devolvió vacío");

        message.reply(texto);

    } catch (error) {
        console.error("Error Groq:", error);

        let errorMsg = "Se rompió algo pa 💀";
        if (error.status === 429) errorMsg = "Rate limit 429: Esperá 1 min";
        else if (error.status === 503 || error.status === 500) errorMsg = "Groq explotó 503/500";
        else if (error.status === 401) errorMsg = "API key de Groq mal puesta";
        else if (error.message.includes('timeout')) errorMsg = "Timeout: Groq tardó mucho";
        else errorMsg = `Error: ${error.message}`;

        message.reply(errorMsg);
        mandarLog(`User ${message.author.tag} causó: ${errorMsg}`);
    }
});

client.login(process.env.DISCORD_TOKEN);

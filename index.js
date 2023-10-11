require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js'); // Updated for Discord.js v14
const { OpenAI } = require('openai');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('ready', () => {
    console.log('The bot is online!');
});

const IGNORE_PREFIX = "!";
const CHANNELS = [process.env.CHANNEL_ID]; // Make sure CHANNELS is an array
const openai = new OpenAI({
    apikey: process.env.API_KEY,
});

client.on('messageCreate', async (message) => { // Added 'async' here
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id))
        return;

    await message.channel.sendTyping();

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    // let conversation = [];
    // conversation.push({
    //     role: 'system',
    //     content: 'Chat GPT is a friendly chat bot.',
    // })

    // let prevMessages = await message.channel.messages.fetch({ limit: 10 });
    // prevMessages.reverse();

    // prevMessages.foreach((msg) => {
    //     if (msg.author.bot && msg.author.id !== client.user.id) return;
    //     if (msg.content.startsWith(IGNORE_PREFIX)) return;

    //     const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

    //     if (msg.author.id === client.user.id) {
    //         conversation.push({
    //             role: 'assistant',
    //             name: username,
    //             content: msg.content,
    //         });

    //         return;
    //     }

    //     conversation.push ({
    //         role: 'user',
    //         name: username,
    //         content: msg.content,
    //     })
    // })

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            // messages: conversation,
            messages: [
                {
                    role: 'system', // Fixed role assignment
                    content: '',
                },
                {
                    role: 'user',
                    content: message.content,
                },
            ],
        });

            message.reply(response.choices[0].message.content);
        } catch (error) {
            console.error('OpenAI Error:\n', error);
        }
    
    clearInterval(sendTypingInterval);

    // if (!response) {
    //     message.reply("I am having some trouble with the OpenAI API. Try again in a moment.");
    //     return;
    // }



});

client.login(process.env.TOKEN);
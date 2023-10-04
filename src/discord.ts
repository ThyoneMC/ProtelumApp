import {
    Client,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    PresenceUpdateStatus,
    ActivityType,
    bold
} from "discord.js";

import env from "./lib/dotenv";

import { Verification } from "./database/index";

export default async function createClient() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildPresences
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User]
    });
    client.setMaxListeners(50);

    // command

    const command = new SlashCommandBuilder()
        .setName("protelum")
        .setDescription("protelum")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("discord")
                .setDescription("verify your discord with minecraft account")
                .addStringOption(
                    new SlashCommandStringOption().setName("code").setDescription("verification code").setRequired(true)
                )
        )
        .toJSON();

    const rest = new REST().setToken(env.TOKEN);
    await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), {
        body: [command]
    });

    // event

    client.once("ready", (event: Client<true>) => {
        console.info(`${event.user.tag} is online!`);

        event.user.setStatus(PresenceUpdateStatus.Online);
        event.user.setActivity({
            name: "Minecraft",
            type: ActivityType.Playing
        });
    });

    client.on("interactionCreate", async (event) => {
        if (!event.isChatInputCommand()) return;
        if (event.commandName != "protelum") return;
        if (event.options.getSubcommand() != "discord") return;

        const verifyCode = event.options.getString("code", true);

        let verify = Verification.getByCode(verifyCode);
        if (!verify) {
            await event.reply({
                content: "Not Found!"
            });

            return;
        }

        verify.discordId = event.user.id;
        Verification.update(verify);

        await event.reply({
            content: `Done!, ${bold("Please rejoin the game to verify")}`,
            ephemeral: true
        });
    });

    await client.login(process.env.TOKEN);
    return client;
}

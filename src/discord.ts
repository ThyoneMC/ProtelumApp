import {
    Client,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    SlashCommandBuilder,
    PresenceUpdateStatus,
    ActivityType
} from "discord.js";

import * as fs from "fs-extra";
import path from "node:path";

import env from "./lib/dotenv";

import { Command, type CommandInteractionCreate } from "./model/command";

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

    const command = new SlashCommandBuilder().setName("protelum").setDescription("protelum");

    const commandList: Record<string, CommandInteractionCreate> = {};

    const commandFolders = path.join(__dirname, "command");
    for (const thatFiles of await fs.readdir(commandFolders)) {
        const subCommand: Command = (await import(path.join(commandFolders, thatFiles))).default;

        command.addSubcommand(subCommand.command);
        commandList[subCommand.command.name] = subCommand.getExecute(client);
    }

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

        const name = event.options.getSubcommand(true);

        const command = commandList[name];
        if (!command) return;

        console.info(`[${new Date().toLocaleTimeString()} COMMAND] <${name}>`);
        await command(event);
    });

    await client.login(process.env.TOKEN);
    return client;
}

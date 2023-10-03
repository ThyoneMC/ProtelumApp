import express from "express";
const app = express();

import bodyParser from "body-parser";
app.use(bodyParser.json());

import type { ServerResponse, VerifyFormat } from "./types/Response";
import type { Team } from "./types/Team";

import { UsersDatabase, DiscordDatabase } from "./lib/database";

function createResponse<T>(statusCode: number, data: T): ServerResponse<T> {
    return {
        status: statusCode,
        data: data,
    };
}

app.get("/", (_request, response) => {
    console.info("Received: GET Hi");

    response.send(
        createResponse(response.statusCode, "Hi")
    );
});

let verifications: Array<VerifyFormat> = [];
let verifiedUser: Array<VerifyFormat> = [];

// new verify
app.post("/:uuid/:verify_code", async (request, response) => {
    console.info("Received: POST verify");

    if (verifications.find(verify => verify.uuid == request.params.uuid) != undefined) {
        response.send(
            createResponse(400, "Bad Request")
        );

        return;
    }

    const _verify: VerifyFormat = {
        uuid: request.params.uuid,
        code: request.params.verify_code,
        discordId: ""
    }
    verifications.push(_verify);
    console.info(`ADD: [${_verify.uuid}: ${_verify.code}]`);

    response.send(
        createResponse(200, "verification Request Created")
    );
});

// is verified
app.get("/:uuid", async (request, response) => {
    console.info("Received: GET verify");

    for (const _verify of verifiedUser) {
        if (_verify.uuid == request.params.uuid) {
            verifiedUser = verifiedUser.filter(user => user.uuid != request.params.uuid);

            await UsersDatabase.update({
                uuid: request.params.uuid,
                createdAt: Date.now(),
                discordId: _verify.discordId,
            });

            response.send(
                createResponse(200, _verify)
            );

            console.info(`REMOVE: [${_verify.uuid}: ${_verify.discordId}]`)
            return;
        }
    }

    response.send(
        createResponse(404, "Not Found")
    );
});

import env from "./lib/dotenv"

import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, PresenceUpdateStatus, ActivityType, bold, ChannelType, PermissionsBitField } from "discord.js";

(async () => {
    await UsersDatabase.get();
    await DiscordDatabase.get();

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildPresences,
        ],
        partials: [
            Partials.Channel,
            Partials.GuildMember,
            Partials.Message,
            Partials.User
        ]
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
                    new SlashCommandStringOption()
                        .setName("code")
                        .setDescription("verification code")
                        .setRequired(true)
                )
        )
        .toJSON()

    const rest = new REST().setToken(env.TOKEN);
    await rest.put(
        Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
        {
            body: [command]
        }
    );

    // team update
    app.put("/teams", async (request, response) => {
        console.info("Received: PUT team");

        if (request.headers.data == undefined || typeof request.headers.data == "object") {
            response.send(
                createResponse(400, "Bad Request")
            );

            return;
        }

        response.send(
            createResponse(200, "OK")
        );

        const data: Team[] = JSON.parse(request.headers.data);

        const guild = client.guilds.cache.get(env.GUILD_ID);
        if (guild == undefined) return;

        for (const team of data) {
            const discordTeamData = DiscordDatabase.getById(team.uuid);

            // new team
            if (!discordTeamData) {
                const teamRole = await guild.roles.create({
                    color: "Aqua",
                    name: team.name,
                    permissions: [],
                    mentionable: true,
                    position: 0
                });

                const teamCategoey = await guild.channels.create({
                    name: team.name,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: env.GUILD_ID,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: teamRole.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ],
                    position: 0,
                });

                const voiceChannel = await guild.channels.create({
                    name: "Voice",
                    type: ChannelType.GuildVoice,
                    parent: teamCategoey,
                    position: 0,
                });

                const messageChannel = await guild.channels.create({
                    name: "Text",
                    type: ChannelType.GuildText,
                    parent: teamCategoey,
                    position: 0,
                });

                await DiscordDatabase.update({
                    categoryId: teamCategoey.id,
                    voiceChannelId: voiceChannel.id,
                    messageChannelId: messageChannel.id,
                    roleId: teamRole.id,
                    teamId: team.uuid
                });
            }

            // member permission
            const allMembers = await guild.members.fetch();
            for (const member of allMembers.values()) {
                try {
                    const user = UsersDatabase.getByDiscordId(member.id);
                    const haveRole = member.roles.cache.get(discordTeamData.roleId);
                    const inTeam = team.members.find(member => member.uuid == user?.uuid);

                    if (!user) continue;
                    else if (!inTeam && haveRole) member.roles.remove(discordTeamData.roleId);
                    else if (inTeam && !haveRole) member.roles.add(discordTeamData.roleId);
                } catch (error) {
                    continue;
                }
            }
        }
    });

    // team delete
    app.delete("/:uuid", async (request, response) => {
        console.info("Received: DELETE team");

        const teamData = DiscordDatabase.getById(request.params.uuid);
        if (teamData) {
            const guild = client.guilds.cache.get(env.GUILD_ID);
            if (!guild) return;

            await guild.roles.delete(teamData.roleId);
            await guild.channels.delete(teamData.voiceChannelId);
            await guild.channels.delete(teamData.messageChannelId);
            await guild.channels.delete(teamData.categoryId);

            DiscordDatabase.delete(teamData.teamId);

            response.send(
                createResponse(200, "Team Deleted")
            );
            return;
        }

        response.send(
            createResponse(404, "Not Found")
        );
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
        for (let _verify of verifications) {
            if (_verify.code == verifyCode) {
                verifications = verifications.filter(user => user.code != verifyCode);

                _verify.discordId = event.user.id;
                verifiedUser.push(_verify);

                await event.reply({
                    content: `Done!, ${bold("Please rejoin the game to verify")}`,
                    ephemeral: true
                });
                return;
            }
        }

        await event.reply({
            content: "Not Found!"
        });
    });

    await client.login(process.env.TOKEN);
})();

app.listen(env.SERVER_PORT);
console.info(`listening: ${env.SERVER_PORT}`);
import express from "express";
const app = express();

import bodyParser from "body-parser";
app.use(bodyParser.json());

import type { ServerResponse, VerifyFormat } from "./types/Response";
import type { Team } from "./types/Team";

function createResponse<T>(statusCode: number, data: T): ServerResponse<T> {
    return {
        status: statusCode,
        data: data,
    };
}

app.get("/", (_request, response) => {
    response.send(
        createResponse(response.statusCode, "Hi")
    );
});

let verifications: Array<VerifyFormat> = [];
let verifiedUser: Array<VerifyFormat> = [];

// new verify
app.post("/:uuid/:verify_code", async (request, response) => {
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
    for (const _verify of verifiedUser) {
        if (_verify.uuid == request.params.uuid) {
            verifiedUser = verifiedUser.filter(user => user.uuid != request.params.uuid);

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
import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, PresenceUpdateStatus, ActivityType, bold} from "discord.js";

(async () => {
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
    app.put("/team", async (request, response) => {
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
        for (const team of data) {
            const guild = client.guilds.cache.get(env.GUILD_ID);
            if (guild == undefined) return;

            guild.roles.create({
                color: "Aqua",
                name: team.name,
                permissions: [],
                mentionable: true,
                position: 0
            });
        }
    });

    // event

    client.once("ready", (event: Client<true>) => {
        console.log(`${event.user.tag} is online!`);

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
                    content: `Done!, ${bold("Please rejoin the game to verify")}`
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
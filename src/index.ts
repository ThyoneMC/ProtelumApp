import express from "express";
const app = express();

interface ServerResponse<T> {
    status: number;
    data: T;
}
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

interface VerifyFormat {
    uuid: string;
    code: string;
}
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

    verifications.push({
        uuid: request.params.uuid,
        code: request.params.verify_code
    });

    response.send(
        createResponse(201, "Created")
    );
});

// is verified
app.get("/:verify_code", async (request, response) => {
    for (const verify of verifiedUser) {
        if (verify.code == request.params.verify_code) {
            verifiedUser = verifiedUser.filter(verify => verify.code != request.params.verify_code);

            response.send(
                createResponse(200, verify)
            );
            return;
        }
    }

    response.send(
        createResponse(404, "Not Found")
    );
});

import env from "./lib/dotenv"
import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, PresenceUpdateStatus, ActivityType } from "discord.js";

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
        if(!event.isChatInputCommand()) return;
        if(event.commandName != "protelum") return;
        if(event.options.getSubcommand() != "discord") return;
    
        const verifyCode = event.options.getString("code", true);
        for (const verify of verifications) {
            if (verify.code == verifyCode) {
                verifications = verifications.filter(verify => verify.code != verifyCode);
                verifiedUser.push(verify);

                await event.reply({
                    content: "Done!"
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
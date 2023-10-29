import { Command, createResponse } from "../model/command";
import { Verification } from "../database/index";

import { SlashCommandSubcommandBuilder, SlashCommandStringOption, bold } from "discord.js";

export default new Command(
    new SlashCommandSubcommandBuilder()
        .setName("discord")
        .setDescription("verify your discord with minecraft account")
        .addStringOption(
            new SlashCommandStringOption().setName("code").setDescription("verification code").setRequired(true)
        ),
    async ({ interaction }) => {
        const verifyCode = interaction.options.getString("code", true);

        let verify = Verification.getByCode(verifyCode);
        if (!verify) return createResponse(404);

        verify.discordId = interaction.user.id;
        Verification.update(verify);

        return {
            content: `Done!, ${bold("Please rejoin the game to verify")}`,
            ephemeral: true
        };
    }
);

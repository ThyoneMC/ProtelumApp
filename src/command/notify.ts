import { Command, createResponse } from "../model/command";
import { Notify } from "../database/index";

import { SlashCommandSubcommandBuilder, SlashCommandChannelOption, channelMention } from "discord.js";

export default new Command(
    new SlashCommandSubcommandBuilder()
        .setName("notify")
        .setDescription("server notification")
        .addChannelOption(
            new SlashCommandChannelOption().setName("channel").setDescription("target channel").setRequired(true)
        ),
    async ({ client, interaction }) => {
        const channel = await client.channels.fetch(interaction.options.getChannel("channel", true).id);
        if (!channel) return createResponse(500);
        if (!channel.isTextBased()) return createResponse(400);

        const notifyChannel = Notify.get(channel.id);
        if (notifyChannel) {
            // delete

            await Notify.delete(notifyChannel.uuid);

            return {
                content: `${channelMention(notifyChannel.uuid)} is remove from notification`
            };
        } else {
            // create

            await Notify.update({
                uuid: channel.id
            });

            return {
                content: `${channelMention(channel.id)} is add to notification`
            };
        }
    }
);

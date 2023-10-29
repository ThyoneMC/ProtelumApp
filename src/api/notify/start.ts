import { API, createResponse } from "../../model/api";

import { Notify } from "../../database";

import { bold, EmbedBuilder, Colors } from "discord.js";

export default new API("notify/server", "POST", "/start/:address?", async ({ client, request }) => {
    if (!client) return createResponse(500);

    for (const notifyChannel of Notify.getValues()) {
        const channel = await client.channels.fetch(notifyChannel.uuid);
        if (!channel) return createResponse(500);
        if (!channel.isTextBased()) return createResponse(400);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Server is ${bold("started")}`)
            .setTimestamp();

        if (request.params.address) embed.setFooter({ text: request.params.address });

        await channel.send({
            embeds: [embed]
        });
    }

    return createResponse(200);
});

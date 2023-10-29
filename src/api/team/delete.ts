import { API, createResponse } from "../../model/api";

import env from "../../lib/dotenv";

import { TeamDiscord, DiscordUser } from "../../database/index";

export default new API("team/delete", "DELETE", "/:uuid", async ({ request, client }) => {
    if (!client) return createResponse(500);

    const teamData = TeamDiscord.get(request.params.uuid);
    if (!teamData) return createResponse(404);

    const guild = client?.guilds.cache.get(env.GUILD_ID);
    if (!guild) return createResponse(500);

    await guild.roles.delete(teamData.roleId);
    await guild.channels.delete(teamData.voiceChannelId);
    await guild.channels.delete(teamData.messageChannelId);
    await guild.channels.delete(teamData.categoryId);

    await DiscordUser.delete(teamData.uuid);

    return {
        status: 200,
        message: "Team Deleted",
        data: null
    };
});

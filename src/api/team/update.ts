import { API, createResponse } from "../../model/api";

import env from "../../lib/dotenv";

import { ChannelType, PermissionsBitField } from "discord.js";

import { DiscordUser, TeamDiscord } from "../../database/index";
import type { Team } from "../../model/team";

export default new API("team", "PUT", "", async ({ request, client }) => {
    if (!client) return createResponse(500);

    if (request.body == undefined || typeof request.body != "object") {
        return createResponse(400);
    }

    const data: Team[] = request.body;

    const guild = client.guilds.cache.get(env.GUILD_ID);
    if (guild == undefined) return createResponse(500);

    for (const team of data) {
        const discordTeamData = TeamDiscord.get(team.uuid);

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
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: teamRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                ],
                position: 0
            });

            const voiceChannel = await guild.channels.create({
                name: "Voice",
                type: ChannelType.GuildVoice,
                parent: teamCategoey,
                position: 0
            });

            const messageChannel = await guild.channels.create({
                name: "Text",
                type: ChannelType.GuildText,
                parent: teamCategoey,
                position: 0
            });

            await TeamDiscord.update({
                uuid: team.uuid,
                categoryId: teamCategoey.id,
                voiceChannelId: voiceChannel.id,
                messageChannelId: messageChannel.id,
                roleId: teamRole.id
            });
        }

        // member permission
        const allMembers = await guild.members.fetch();
        for (const member of allMembers.values()) {
            try {
                const user = DiscordUser.getByDiscordId(member.id);
                const haveRole = member.roles.cache.get(discordTeamData.roleId);
                const inTeam = team.members.find((member) => member.uuid == user?.uuid);

                if (!user) continue;
                else if (!inTeam && haveRole) member.roles.remove(discordTeamData.roleId);
                else if (inTeam && !haveRole) member.roles.add(discordTeamData.roleId);
            } catch (error) {
                continue;
            }
        }
    }

    return createResponse(200);
});

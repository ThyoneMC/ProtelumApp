import type { Team } from "./Team";

export interface DiscordData {
    categoryId: string;
    voiceChannelId: string;
    messageChannelId: string;
    roleId: string;
    teamId: Team["uuid"];
}

export type DiscordDataFormat = Record<Team["uuid"], DiscordData>
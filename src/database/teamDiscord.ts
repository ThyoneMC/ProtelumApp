import BaseDatabase from "../lib/database";
import type { ContentBase } from "../model/content";

export interface TeamDiscordData extends ContentBase {
    categoryId: string;
    voiceChannelId: string;
    messageChannelId: string;
    roleId: string;
}

export class TeamDiscord {
    static readonly database = new BaseDatabase<TeamDiscordData>("team_discord");

    static save() {
        return this.database.save();
    }
    static load() {
        return this.database.load();
    }
    static get(uuid: string) {
        return this.database.get(uuid);
    }
    static update(data: TeamDiscordData) {
        return this.database.update(data);
    }
    static delete(uuid: string) {
        return this.database.delete(uuid);
    }
}

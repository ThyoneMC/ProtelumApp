import BaseDatabase from "../lib/database";
import type { ContentBase } from "../model/content";

export interface DiscordUserData extends ContentBase {
    discordId: string;
}

export class DiscordUser {
    static readonly database = new BaseDatabase<DiscordUserData>("user");

    static save() {
        return this.database.save();
    }
    static load() {
        return this.database.load();
    }
    static get(uuid: string) {
        return this.database.get(uuid);
    }
    static update(data: DiscordUserData) {
        return this.database.update(data);
    }
    static delete(uuid: string) {
        return this.database.delete(uuid);
    }

    static getByDiscordId(discordId: string) {
        for (const user of Object.values(this.database.data)) {
            if (user.discordId == discordId) {
                return user;
            }
        }

        return;
    }
}

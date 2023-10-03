import * as fs from "fs-extra";

import process from "node:process";
import path from "node:path";
import env from "./dotenv";

import type { Users, UserData } from "../types/User";
export class UsersDatabase {
    static readonly path: string = path.join(process.cwd(), env.DATA_PATH, "user.json");
    static data: Users = {};

    static async save() {
        if (!await fs.exists(this.path)) {
            await fs.ensureFile(this.path);
        }

        await fs.writeJSON(this.path, Object.values(this.data));
    }

    static async get() {
        if (!await fs.exists(this.path)) {
            await this.save();
        } else {
            const read: Array<UserData> = await fs.readJSON(this.path);
            for (const user of read) {
                this.data[user.uuid] = user;
            }
        }

        return this.data;
    }

    static getById(uuid: string) {
        return this.data[uuid];
    }

    static getByDiscordId(discordId: string) {
        for (const user of Object.values(this.data)) {
            if (user.discordId == discordId) {
                return user;
            }
        }

        return;
    }

    static async update(updateData: UserData) {
        if (!await fs.exists(this.path)) {
            await this.save();
        }

        this.data[updateData.uuid] = updateData;

        await this.save();
    }
}

import type { DiscordData, DiscordDataFormat } from "../types/Discord";
export class DiscordDatabase {
    static readonly path: string = path.join(process.cwd(), env.DATA_PATH, "discord.json");
    static data: DiscordDataFormat = {};

    static async save() {
        if (!await fs.exists(this.path)) {
            await fs.ensureFile(this.path);
        }

        await fs.writeJSON(this.path, Object.values(this.data));
    }

    static async get() {
        if (!await fs.exists(this.path)) {
            await this.save();
        } else {
            const read: Array<DiscordData> = await fs.readJSON(this.path);
            for (const user of read) {
                this.data[user.teamId] = user;
            }
        }

        return this.data;
    }

    static getById(uuid: string) {
        return this.data[uuid];
    }

    static async update(updateData: DiscordData) {
        if (!await fs.exists(this.path)) {
            await this.save();
        }

        this.data[updateData.teamId] = updateData;

        await this.save();
    }

    static async delete(uuid: string) {
        delete this.data[uuid];

        await this.save();
    }
}
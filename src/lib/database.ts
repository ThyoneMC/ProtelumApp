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

        await fs.writeJSON(this.path, this.data);
    }

    static async get() {
        if (!await fs.exists(this.path)) {
            await this.save();

            return this.data;
        }

        this.data = await fs.readJSON(this.path);
        return this.data;
    }

    static getById(uuid: string) {
        return this.data[uuid];
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
export  class DiscordDatabase {
    static readonly path: string = path.join(process.cwd(), env.DATA_PATH, "discord.json");
    static data: DiscordDataFormat = {};

    static async save() {
        if (!await fs.exists(this.path)) {
            await fs.ensureFile(this.path);
        }

        await fs.writeJSON(this.path, this.data);
    }

    static async get() {
        if (!await fs.exists(this.path)) {
            await this.save();

            return this.data;
        }
        
        this.data = await fs.readJSON(this.path);
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
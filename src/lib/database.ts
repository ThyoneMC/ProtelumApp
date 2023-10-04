import * as fs from "fs-extra";

import process from "node:process";
import path from "node:path";

import env from "./dotenv";

import type { ContentBase, ContentUUID } from "../model/content";

export default class BaseDatabase<T extends ContentBase> {
    readonly path: string;
    data: Record<ContentUUID, T>;

    constructor(name: string) {
        this.path = path.join(process.cwd(), env.DATA_PATH, `${name}.json`);
        this.data = {};
    }

    async save() {
        if (!(await fs.exists(this.path))) {
            await fs.ensureFile(this.path);
        }

        await fs.writeJSON(this.path, Object.values(this.data));
    }

    async load() {
        if (!(await fs.exists(this.path))) {
            await this.save();
        } else {
            const read: Array<T> = await fs.readJSON(this.path);
            for (const user of read) {
                this.data[user.uuid] = user;
            }
        }

        return this.data;
    }

    get(uuid: ContentUUID) {
        return this.data[uuid];
    }

    async update(data: T) {
        this.data[data.uuid] = data;

        await this.save();
    }

    async delete(uuid: ContentUUID) {
        delete this.data[uuid];

        await this.save();
    }
}

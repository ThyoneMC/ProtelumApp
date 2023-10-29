import BaseDatabase from "../lib/database";
import type { ContentBase } from "../model/content";

export interface NotifySettings extends ContentBase {}

export class Notify {
    static readonly database = new BaseDatabase<NotifySettings>("notify");

    static save() {
        return this.database.save();
    }
    static load() {
        return this.database.load();
    }
    static get(uuid: string) {
        return this.database.get(uuid);
    }
    static getValues() {
        return this.database.getValues();
    }
    static update(data: NotifySettings) {
        return this.database.update(data);
    }
    static delete(uuid: string) {
        return this.database.delete(uuid);
    }
}

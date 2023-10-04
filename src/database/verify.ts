import type { ContentUUID } from "../model/content";

import type { DiscordUserData } from "./users";

export interface VerificationData extends DiscordUserData {
    code: string;
    discordId: string;
}

export class Verification {
    static data: Record<ContentUUID, VerificationData> = {};

    static get(uuid: ContentUUID) {
        return this.data[uuid];
    }

    static getByCode(code: string) {
        for (const verify of Object.values(this.data)) {
            if (verify.code == code) {
                return verify;
            }
        }

        return;
    }

    static update(data: VerificationData) {
        this.data[data.uuid] = data;
    }

    static delete(uuid: ContentUUID) {
        delete this.data[uuid];
    }

    static isVerify(uuid: ContentUUID) {
        if (!this.get(uuid).discordId) {
            return false;
        }

        return true;
    }
}

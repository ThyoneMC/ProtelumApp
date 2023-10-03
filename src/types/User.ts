import type ContentBase from "./ContentBase";

export interface UserData extends ContentBase {
    discordId: string;
};

export type Users = Record<UserData["uuid"], UserData>;
import ContentBase from "./ContentBase";

export enum TeamRole {
    Owner,
    Admin,
    Member,
}

export interface TeamMember extends ContentBase {
    role: TeamRole;
}

export interface Team extends ContentBase {
    name: string;
    members: TeamMember[];
    invites: String[];
    score: number;
}
export enum TeamRole {
    Owner,
    Admin,
    Member,
}

export interface TeamMember {
    role: TeamRole;
}

export interface Team {
    name: string;
    members: TeamMember[];
    invites: String[];
    score: number;
}
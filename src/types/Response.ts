export interface ServerResponse<T> {
    status: number;
    data: T;
}

export interface VerifyFormat {
    uuid: string;
    code: string;
    discordId: string;
}
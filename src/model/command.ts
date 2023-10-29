import type {
    ChatInputCommandInteraction,
    Client,
    InteractionReplyOptions,
    SlashCommandSubcommandBuilder
} from "discord.js";

export interface CommandExecuteInput {
    interaction: ChatInputCommandInteraction;
    client: Client<false>;
}

export type CommandCallbackFunction = (data: CommandExecuteInput) => Promise<InteractionReplyOptions>;

export type CommandInteractionCreate = (interaction: ChatInputCommandInteraction) => Promise<void>;

import { CommonStatusCodeResponse, CommonStatusCodeAPIResponse } from "./api";
export function createResponse(statusCode: CommonStatusCodeResponse): InteractionReplyOptions {
    const response = CommonStatusCodeAPIResponse[statusCode];

    return {
        content: `${response.status} ${response.message}`,
        ephemeral: true
    };
}

export class Command {
    readonly command: SlashCommandSubcommandBuilder;
    private readonly callback: CommandCallbackFunction;

    constructor(command: SlashCommandSubcommandBuilder, callback: CommandCallbackFunction) {
        this.command = command;
        this.callback = callback;
    }

    getExecute(client: Client): CommandInteractionCreate {
        return async (interaction) => {
            console.info(`[${new Date().toLocaleTimeString()} COMMAND] <${this.command.name}>`);

            interaction.reply(
                await this.callback({
                    interaction,
                    client
                })
            );
        };
    }
}

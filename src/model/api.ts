import { Request, Response } from "express";
import type { RouteParameters, RequestHandler } from "express-serve-static-core";

import type { Client } from "discord.js";

export type APIMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface APIExecuteInput<P extends string> {
    request: Request<RouteParameters<P>>;
    response: Response;
    client?: Client;
}

export interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export type APICallbackFunction<T, P extends string> = (data: APIExecuteInput<P>) => Promise<APIResponse<T>>;

export type CommonStatusCodeResponse = 200 | 400 | 404 | 500;

export const CommonStatusCodeAPIResponse: Record<CommonStatusCodeResponse, APIResponse<null>> = {
    200: {
        status: 200,
        message: "OK",
        data: null
    },
    400: {
        status: 400,
        message: "Bad Request",
        data: null
    },
    404: {
        status: 404,
        message: "Not Found",
        data: null
    },
    500: {
        status: 500,
        message: "Internal Server Error",
        data: null
    }
};

export function createResponse(statusCode: CommonStatusCodeResponse) {
    return CommonStatusCodeAPIResponse[statusCode];
}

export class API<T, P extends string> {
    readonly name: string;
    readonly method: APIMethod;
    readonly path: P;
    private readonly callback: APICallbackFunction<T, P>;

    constructor(name: string, method: APIMethod, path: P, callback: APICallbackFunction<T, P>) {
        this.method = method;
        this.path = path;
        this.callback = callback;
        this.name = name;
    }

    getExecute(client: Client): RequestHandler<any> {
        return async (request, response) => {
            console.info(
                `[${new Date().toLocaleTimeString()} ${this.method}] <${this.name}> ${Object.values(request.params)}`
            );

            response.json(
                await this.callback({
                    request,
                    response,
                    client
                })
            );
        };
    }
}

import express from "express";
import bodyParser from "body-parser";

import * as fs from "fs-extra";
import path from "node:path";

import env from "./lib/dotenv";

import type { API } from "./model/api";

import { TeamDiscord, DiscordUser, Notify } from "./database/index";

import createClient from "./discord";

(async () => {
    await TeamDiscord.load();
    await DiscordUser.load();
    await Notify.load();

    const client = await createClient();

    const app = express().use(bodyParser.json());

    const apiFolders = path.join(__dirname, "api");
    for (const topFolders of await fs.readdir(apiFolders)) {
        const thatFolders = path.join(apiFolders, topFolders);

        for (const thatFiles of await fs.readdir(thatFolders)) {
            const apiCommand: API<any, any> = (await import(path.join(thatFolders, thatFiles))).default;

            const _name = `/${apiCommand.name}${apiCommand.path}`;
            const _callback = apiCommand.getExecute(client);

            switch (apiCommand.method) {
                case "GET": {
                    app.get(_name, _callback);
                    break;
                }
                case "POST": {
                    app.post(_name, _callback);
                    break;
                }
                case "PUT": {
                    app.put(_name, _callback);
                    break;
                }
                case "DELETE": {
                    app.delete(_name, _callback);
                    break;
                }
            }
        }
    }

    app.listen(env.SERVER_PORT);
    console.info(`listening: ${env.SERVER_PORT}`);
})();

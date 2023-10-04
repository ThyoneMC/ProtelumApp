import dotenv from "dotenv";
dotenv.config();

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            readonly CLIENT_ID: string;
            readonly GUILD_ID: string;
            readonly TOKEN: string;
            readonly SERVER_PORT: string;
            readonly DATA_PATH: string;
        }
    }
}

import process from "node:process";
export default process.env;

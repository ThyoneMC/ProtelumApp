import dotenv from "dotenv";
dotenv.config();

import process from "node:process";
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
export default process.env;
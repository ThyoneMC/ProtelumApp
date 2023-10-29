import { API, createResponse } from "../../model/api";

import { DiscordUser, Verification } from "../../database/index";

export default new API("verify/delete", "DELETE", "/:uuid", async ({ request }) => {
    const verify = Verification.get(request.params.uuid);
    if (!verify) return createResponse(404);
    if (!Verification.isVerify(request.params.uuid)) return createResponse(400);

    await DiscordUser.update({
        uuid: request.params.uuid,
        discordId: verify.discordId
    });

    return {
        status: 200,
        message: "Verification Request Deleted",
        data: verify
    };
});

import { API, createResponse } from "../../model/api";

import { Verification } from "../../database/verify";

export default new API("verify", "POST", "/:uuid/:verify_code", async ({ request }) => {
    if (Verification.get(request.params.uuid)) {
        return createResponse(400);
    }

    Verification.update({
        uuid: request.params.uuid,
        code: request.params.verify_code,
        discordId: ""
    });

    return {
        status: 200,
        message: "verification Request Created",
        data: null
    };
});

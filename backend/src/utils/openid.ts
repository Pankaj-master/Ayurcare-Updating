import { Issuer } from "openid-client";

let client: any;

export async function getOpenIdClient() {
    if (client) return client;

    const issuer = await Issuer.discover(
        "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_E2cBQupsx"
    );

    client = new issuer.Client({
        client_id: process.env.COGNITO_APP_CLIENT_ID!,
        client_secret: process.env.COGNITO_APP_CLIENT_SECRET!,
        redirect_uris: [process.env.COGNITO_REDIRECT_URI!],
        response_types: ["code"],
    });

    return client;
}

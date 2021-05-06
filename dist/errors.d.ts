/**
 * An OAuth2 error will come from the authorization server and will have at least an `error` property which will
 * be the error code. And possibly an `error_description` property
 *
 * See: https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.6
 */
export declare class OAuthError extends Error {
    error: string;
    error_description?: string | undefined;
    constructor(error: string, error_description?: string | undefined);
}
//# sourceMappingURL=errors.d.ts.map
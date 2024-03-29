import { SdPlatformModelTokenScopes } from "@shapediver/sdk.platform-api-sdk-v1";

/**
 * Data required to access a model (or multiple models) on its Geometry Backend system.
 */
 export interface IGeometryBackendAccessData {
    /** JWT */
    access_token: string,
    /** API endpoint */
    model_view_url: string,
    /** Ticket (Encrypted model identifier, available for models which have been confirmed) */ 
    ticket?: string,
    /** Id of the model on the Geometry Backend system */
    guid?: string,
    /** Ids of the models on the Geometry Backend system, either guid or guids must be set */
    guids?: string[],
    /** Scopes of the token */
    scopes: SdPlatformModelTokenScopes[]
};

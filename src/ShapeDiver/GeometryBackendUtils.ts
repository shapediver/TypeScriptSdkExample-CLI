import { IGeometryBackendAccessData } from "./Commons";
import { create, ShapeDiverResponseDto, ShapeDiverResponseExport, ShapeDiverSdk } from "@shapediver/sdk.geometry-api-sdk-v2";

/**
 * Wrapper for an instance of the Geometry Backend SDK and a session,
 * makes it easy to handle multiple sessions at once.
 */
export interface ISessionData {
    /** Instance of the sdk (holds the access token) */
    sdk: ShapeDiverSdk,
    /** Data of the model (parameters, outputs, exports, etc), the response of the session init call */
    data: ShapeDiverResponseDto
};

/**
 * Initialize a session
 * @param accessData 
 * @returns 
 */
export const initSession = async (accessData: IGeometryBackendAccessData) : Promise<ISessionData> => {

    const sdk = create(accessData.model_view_url, accessData.access_token);
    const data = await sdk.session.init(accessData.ticket);
    
    return {sdk, data};
};

/**
 * Close a session
 * @param session 
 */
export const closeSession = async (session: ISessionData) : Promise<void> => {

    const {sdk, data} = session;

    await sdk.session.close(data.sessionId);
};

/**
 * Run an export
 * @param session Session data as returned from initSession
 * @param parameters Parameter values to use, default values will be used for parameters not specified
 * @param id Id of the export
 * @param maxWaitMsec Maximum duration to wait for result (in milliseconds), pass value < 0 to disable limit.
 *                    A ShapeDiverError will be thrown in case max_wait_time is exceeded.
 */
export const runExport = async (session: ISessionData, parameters: {[paramId: string]: string}, id: string, maxWaitMsec: number = -1) : Promise<ShapeDiverResponseExport> => {

    const {sdk, data} = session;

    const result = await sdk.utils.submitAndWaitForExport(sdk, data.sessionId, {parameters, exports: {id}}, maxWaitMsec);

    return (result.exports[id] as ShapeDiverResponseExport);
}

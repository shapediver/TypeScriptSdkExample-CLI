import { IGeometryBackendAccessData } from "./Commons";
import { 
    create, 
    ShapeDiverResponseDto, 
    ShapeDiverResponseExport, 
    ShapeDiverSdk 
} from "@shapediver/sdk.geometry-api-sdk-v2";
import * as fsp from 'fs/promises';

/**
 * Wrapper for an instance of the Geometry Backend SDK and a session,
 * makes it easy to handle multiple sessions at once.
 */
export interface ISessionData {
    /** Instance of the sdk (holds the access token) */
    sdk: ShapeDiverSdk,
    /** Data of the model (parameters, outputs, exports, etc), the response of the session init call */
    dto: ShapeDiverResponseDto
};

/**
 * Initialize a session
 * @param access_data 
 * @returns 
 */
export const initSession = async (access_data: IGeometryBackendAccessData) : Promise<ISessionData> => {

    const sdk = create(access_data.model_view_url, access_data.access_token);
    const dto = await sdk.session.init(access_data.ticket);
    
    return {sdk, dto};
};

/**
 * Close a session
 * @param session 
 */
export const closeSession = async (session: ISessionData) : Promise<void> => {

    const {sdk, dto} = session;

    await sdk.session.close(dto.sessionId);
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

    const {sdk, dto} = session;

    const result = await sdk.utils.submitAndWaitForExport(sdk, dto.sessionId, {parameters, exports: {id}}, maxWaitMsec);

    return (result.exports[id] as ShapeDiverResponseExport);
}

/**
 * Get upload link for model, upload file
 * @param access_data 
 * @param filename 
 * @returns 
 */
export const uploadModel = async (access_data: IGeometryBackendAccessData, filename: string) : Promise<ISessionData> => {

    const sdk = create(access_data.model_view_url, access_data.access_token);

    // get model info, which will include upload link
    const dto = await sdk.model.get(access_data.guid);

    // upload model
    await sdk.utils.upload(
        dto.file.upload, 
        await fsp.readFile(filename), 
        dto.setting.compute.ftype === 'gh' ? 'application/octet-stream' : 'application/xml' 
    );

    return {
        sdk,
        dto
    };
}

const sleep = async (msec: number) : Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, msec));
}

/**
 * Wait for the model status to become 'confirmed', 'denied', or 'pending'
 * @param session_data 
 * @returns 
 */
export const waitForModelCheck = async (session_data: ISessionData) : Promise<ISessionData> => {

    const {sdk} = session_data;
    let {dto} = session_data;

    dto = await sdk.model.get(dto.model.id);

    while (dto.model.stat === 'not_uploaded' ) {
        console.log('Waiting for model check to start...');
        await sleep(1000);
        dto = await sdk.model.get(dto.model.id);
    }

    while ( !['confirmed', 'denied', 'pending'].includes(dto.model.stat) ) {
        console.log('Waiting for model check to finish...');
        await sleep(1000);
        dto = await sdk.model.get(dto.model.id);
    }

    console.log(`Model status: ${dto.model.stat}`);

    return {
        sdk,
        dto
    };
}

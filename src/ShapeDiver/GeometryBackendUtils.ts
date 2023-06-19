import { IGeometryBackendAccessData } from "./Commons";
import { 
    create, 
    ShapeDiverResponseDto, 
    ShapeDiverResponseExport, 
    ShapeDiverResponseOutput, 
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
 * Run a customization and return all outputs.
 * @param session Session data as returned from initSession
 * @param parameters Parameter values to use, default values will be used for parameters not specified
 * @param maxWaitMsec Maximum duration to wait for result (in milliseconds), pass value < 0 to disable limit.
 *                    A ShapeDiverError will be thrown in case max_wait_time is exceeded.
 */
 export const runCustomization = async (session: ISessionData, parameters: {[paramId: string]: string}, maxWaitMsec: number = -1) : Promise<{[outputId: string]: ShapeDiverResponseOutput}> => {

    const {sdk, dto} = session;

    const result = await sdk.utils.submitAndWaitForCustomization(sdk, dto.sessionId, parameters, maxWaitMsec);

    return (result.outputs as {[outputId: string]: ShapeDiverResponseOutput});
}

/**
 * Run an export and return it.
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

    if (!['not_uploaded', 'uploaded', 'pending'].includes(dto.model.stat)) {
        // no need to wait
        return {
            sdk,
            dto
        };
    }
    
    let epochStart = Date.now();
    while (dto.model.stat === 'not_uploaded' ) {
        if (Date.now() - epochStart > 60000) {
            throw new Error('Model checking did not start within 60 seconds.');
        }
        console.log('Waiting for model check to start...');
        await sleep(2500);
        dto = await sdk.model.get(dto.model.id);
    }

    const max_comp_time = dto.setting.compute.max_comp_time;
    console.log(`Maximum allowed computation time: ${max_comp_time}`);

    epochStart = Date.now();
    while ( !['confirmed', 'denied', 'pending'].includes(dto.model.stat) ) {
        if (Date.now() - epochStart > 2 * max_comp_time) {
            console.warn(`Model check did not complete within ${max_comp_time / 1000} seconds.`);
            return {
                sdk,
                dto
            };
        }
        console.log('Waiting for model check to finish...');
        await sleep(2500);
        dto = await sdk.model.get(dto.model.id);
    }

    console.log(`Model status: ${dto.model.stat}`);

    return {
        sdk,
        dto
    };
}

export const getSessionAnalytics = async (access_data: IGeometryBackendAccessData, timestamp_from: string, timestamp_to: string) : Promise<ShapeDiverResponseDto> => {
    const sdk = create(access_data.model_view_url, access_data.access_token);
    const dto = await sdk.analytics.modelSessionStatistics({
        parameters: [{
            modelid: access_data.guid,
            timestamp_from,
            timestamp_to
        }]
    })
    return dto
}
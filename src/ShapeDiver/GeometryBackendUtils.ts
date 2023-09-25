import { IGeometryBackendAccessData } from "./Commons";
import { 
    create, 
    ShapeDiverResponseDto, 
    ShapeDiverResponseExport, 
    ShapeDiverResponseOutput, 
    ShapeDiverSdk, 
    ShapeDiverSdkApiResponseType
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

/**
 * Helper for getting aggregated session analytics for the given model (or models)
 * @param access_data 
 * @param timestamp_from 
 * @param timestamp_to 
 * @returns 
 */
export const getSessionAnalytics = async (access_data: IGeometryBackendAccessData, timestamp_from: string, timestamp_to: string) : Promise<ShapeDiverResponseDto> => {
    const sdk = create(access_data.model_view_url, access_data.access_token);
    const dto = await sdk.analytics.modelSessionStatistics({
        parameters: access_data.guid ? 
            [{
                modelid: access_data.guid,
                timestamp_from,
                timestamp_to
            }] :
            access_data.guids.map(g => { return {
                modelid: g,
                timestamp_from,
                timestamp_to
            };})
    })
    return dto
}

/**
 * Run a computation of a ShapeDiver model which expects a GeoJSON input and outputs GeoJSON. 
 * Throws if the model does not have the expected parameters (inputs), output, and export. 
 * @param ticket Embedding ticket when calling this from a browser, backend ticket otherwise. 
 * @param modelViewUrl 
 * @param geojsonInput The GeoJSON input as string. 
 * @returns The GeoJSON output as string. 
 */
export const runShapeDiverGeoJsonModel = async (ticket: string, modelViewUrl: string, geojsonInput: string) : Promise<string> => {

    /**
     * Create instance of SDK. 
     * This could be strengthened by JWT auth, but would require a backend application to request the JWT from 
     * the ShapeDiver platform using platform access keys. 
     */ 
    const sdk = create(modelViewUrl); 

    /**
     * Initialize session. 
     * When running from a browser, the ticket must be an "embedding ticket". 
     * In case of JWT auth, it's sufficient to provide the model id. 
     */
    const dto = await sdk.session.init(ticket);

    // look for inputs (parameters) and outputs
    const filterByDisplayNameorNameInvariant = (o : {name: string, displayname?: string}, text: string) : boolean => {
        text = text.toLowerCase();
        if (o.displayname?.toLowerCase().startsWith(text)) 
            return true;
        return o.name.toLowerCase().startsWith(text);
    };

    const textParam = Object.values(dto.parameters).find(p => p.type === 'String' && filterByDisplayNameorNameInvariant(p, "text"));
    if (!textParam) {
        throw new Error('Expected model to have a text parameter whose name starts with "Text" (case insensitive)');
    }

    const textFileParam = Object.values(dto.parameters).find(p => p.type === 'File' && filterByDisplayNameorNameInvariant(p, "text"));
    if (!textFileParam) {
        throw new Error('Expected model to have a text file parameter whose name starts with "Text" (case insensitive)');
    }

    const geojsonOutput = Object.values(dto.outputs).find(o => filterByDisplayNameorNameInvariant(o, "geojson"));
    if (!geojsonOutput) {
        throw new Error('Expected model to have an output whose name starts with "Geojson" (case insensitive)');
    }

    const geojsonExport = Object.values(dto.exports).find(o => o.type === "download" && filterByDisplayNameorNameInvariant(o, "geojson"));
    if (!geojsonExport) {
        throw new Error('Expected model to have an export of type "download" whose name starts with "Geojson" (case insensitive)');
    }

    // assign parameter values
    const parameterBody : {[key: string]: string} = {};
    const forceUseFileParam = false;
    if (forceUseFileParam || geojsonInput.length >= textParam.max) {
        // geojson length exceeds maximum length of direct text parameter, upload as file
        const buffer = Buffer.from(geojsonInput, 'utf8');
        // check if 'application/json' is available among allowed content types, otherwise just use whatever we got
        const contentType = textFileParam.format.includes('application/json') ? 'application/json' : textFileParam.format[0];
        // request file upload
        const uploadRequest = await sdk.file.requestUpload(dto.sessionId, {[textFileParam.id]: {format: contentType, size: buffer.byteLength}})
        const uploadDefinition = uploadRequest.asset.file[textFileParam.id]
        // upload file
        await sdk.utils.upload(uploadDefinition.href, buffer, contentType)

        parameterBody[textParam.id] = "";
        parameterBody[textFileParam.id] = uploadDefinition.id;
    }
    else {
        parameterBody[textParam.id] = geojsonInput;
        parameterBody[textFileParam.id] = "";
    }

    // run and wait for computation
    const maxWaitMsecs = dto.setting?.compute?.max_comp_time ? 2.0 * dto.setting.compute.max_comp_time : -1;
    const body = {
        parameters: parameterBody,
        outputs: [geojsonOutput.id],
        exports: [geojsonExport.id],
    };
    const result = await sdk.utils.submitAndWaitForExport(sdk, dto.sessionId, body, maxWaitMsecs);
  
    // get output data
    const geojsonOutputResult = result.outputs[geojsonOutput.id] as ShapeDiverResponseOutput;
    if (geojsonOutputResult.status_computation !== 'success') {
        throw new Error(`Computation of model failed with status ${geojsonOutputResult.status_computation}`);
    }
    if (geojsonOutputResult.status_collect !== 'success') {
        throw new Error(`Data collection for model failed with status ${geojsonOutputResult.status_collect}`);
    }

    let geojsonResult = '';
    const forceUseExport = false;
    if (!forceUseExport && geojsonOutputResult.content.length === 1 && geojsonOutputResult.content[0].data && typeof geojsonOutputResult.content[0].data === 'string') 
    {
        // The GeoJSON data output provides data, we use it and skip using the export link. 
        geojsonResult = geojsonOutputResult.content[0].data;
    }
    else
    {
        // In case we didn't get data from the GeoJSON data output, probably the size of the resulting GeoJSON  
        // exceeded the limit for data outputs, and we need to download the result from the export link. 
        const geojsonExportResult = result.exports[geojsonExport.id] as ShapeDiverResponseExport;

        if (geojsonExportResult.status_computation !== 'success') {
            throw new Error(`Computation of model failed with status ${geojsonExportResult.status_computation}`);
        }
        if (geojsonExportResult.status_collect !== 'success') {
            throw new Error(`Data collection for model failed with status ${geojsonExportResult.status_collect}`);
        }

        if (geojsonExportResult.content.length < 1) {
            throw new Error(`Expected a text file resulting from export ${geojsonExport.name}`);
        }

        // download from the export link
        const href = geojsonExportResult.content[0].href;
        const geojsonObject = ((await sdk.utils.download(href, ShapeDiverSdkApiResponseType.JSON))[1]);
        geojsonResult = JSON.stringify(geojsonObject, null, 0);
    }

    // close session
    await sdk.session.close(dto.sessionId);

    return geojsonResult;
}


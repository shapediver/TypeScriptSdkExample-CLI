import { 
    ShapeDiverResponseOutput,
    ShapeDiverRequestSdtfUploadPartType,
    ShapeDiverRequestCustomization,
    ShapeDiverRequestParameterSType
} from "@shapediver/sdk.geometry-api-sdk-v2";
import { ISessionData } from "./GeometryBackendUtils";

/**
 * Interface for specifying parameter values.
 */
export interface IParameterValue {
    /** 
     * String value of the parameter. Takes precedence over property `sdtf`. 
     */
    value?: string,
    /** 
     * sdTF value of the parameter. Used if `value` is undefined.
     * Use this only for parameters which support sdTF input data. 
     * The `Type` property of such parameters starts with a lowercase s, like "sCurve".
     */
    sdtf?: {
        /** 
         * The id of a previously uploaded sdtf. 
         * Takes precedence over property `arrayBuffer`.
         */
        id?: string,
        /**
         * ArrayBuffer holding an sdTF that should be uploaded. 
         * Used if `id` is undefined.
         * In case you specify the same ArrayBuffer for multiple 
         * parameter values, it will only be uploaded once.
         */
        arrayBuffer?: ArrayBuffer,
        /**
         * Optional id or name of the chunk which should be used.
         * Please read about the chunk selection logic here: https://help.shapediver.com/doc/sdtf-structured-data-transfer-format#sdTF-Structureddatatransferformat-Chunkselectionlogic
         */
        chunkName?: string
    }
}

/**
 * Result of a customization which involved sdTF input data.
 */
export interface SdtfCustomizationResult {
    /** Resulting outputs. */
    outputs: {[outputId: string]: ShapeDiverResponseOutput},
    /** The parameter body that was used for the customization request, the sdTF ids can be read from here. */
    requestBody: ShapeDiverRequestCustomization
}

/**
 * Run a customization and return all outputs.
 * @param session Session data as returned from initSession
 * @param parameters Parameter values to use, default values will be used for parameters not specified
 * @param maxWaitMsec Maximum duration to wait for result (in milliseconds), pass value < 0 to disable limit.
 *                    A ShapeDiverError will be thrown in case max_wait_time is exceeded.
 */
export const runCustomizationUsingSdtf = async (session: ISessionData, parameters: {[paramId: string]: IParameterValue}, maxWaitMsec: number = -1) : Promise<SdtfCustomizationResult> => {

    const {sdk, dto} = session;

    // collect sdTFs which need to be uploaded
    const sdTFsForUpload: Array<ArrayBuffer> = [];

    // sanity check
    for (const paramId in parameters) {
        const param = dto.parameters[paramId];
        if (!param) throw new Error(`Parameter ${paramId} does not exist.`);

        const value = parameters[paramId];
    
        if (!value.value && value.sdtf) {
            if (!param.type.startsWith('s')) {
                throw new Error(`Parameter ${paramId} does not support sdTF data.`);
            }

            const sdtfData = value.sdtf;
            if (!sdtfData.id && !sdtfData.arrayBuffer) {
                throw new Error(`Please specify an sdTF id or arrayBuffer for parameter ${paramId}.`);
            }

            if (sdtfData.arrayBuffer && !sdTFsForUpload.includes(sdtfData.arrayBuffer)) {
                sdTFsForUpload.push(sdtfData.arrayBuffer);
            }
        }
    }

    // request upload of sdTFs
    let response = await sdk.sdtf.requestUpload(dto.sessionId, sdTFsForUpload.map(arrayBuffer => { 
        return {
            namespace: 'pub',
            content_length: arrayBuffer.byteLength,
            content_type: ShapeDiverRequestSdtfUploadPartType.MODEL_SDTF
    }}));

    // upload of sdTFs
    const promises = sdTFsForUpload.map((buffer, index) => {
        const url = response.asset.sdtf[index].href;
        return sdk.utils.upload(url, buffer, ShapeDiverRequestSdtfUploadPartType.MODEL_SDTF);
    })
    await Promise.all(promises);
   
    // prepare parameter data
    const requestBody: ShapeDiverRequestCustomization = {};
    // TODO remove once fixed: https://shapediver.atlassian.net/browse/SS-5987
    const requestBodyStrings: ShapeDiverRequestCustomization = {};
    Object.keys(parameters).forEach(paramId => {
        const value = parameters[paramId];
        // did we get a string value?
        if (value.value) {
            requestBody[paramId] = value.value;
            requestBodyStrings[paramId] = value.value;
        }
        // did we get sdTF data?
        else if (value.sdtf) {
            // was an id specified for the sdTF?
            let stypeValue: ShapeDiverRequestParameterSType = {};
            if (value.sdtf.id) {
                // in case no chunk name was specified, send a string value
                // TODO remove once fixed: https://shapediver.atlassian.net/browse/SS-5986
                if (!value.sdtf.chunkName) {
                    requestBody[paramId] = value.sdtf.id;
                    requestBodyStrings[paramId] = value.sdtf.id;
                    return;
                } 
                stypeValue = {
                    asset: {
                        id: value.sdtf.id
                    }
                };
            }
            // an ArrayBuffer must have been specified in this case (validation happens above)
            else {
                const index = sdTFsForUpload.indexOf(value.sdtf.arrayBuffer);
                // in case no chunk name was specified, send a string value
                // TODO remove once fixed: https://shapediver.atlassian.net/browse/SS-5986
                if (!value.sdtf.chunkName) {
                    requestBody[paramId] = response.asset.sdtf[index].id;
                    requestBodyStrings[paramId] = response.asset.sdtf[index].id;
                    return;
                }
                stypeValue = {
                    asset: {
                        id: response.asset.sdtf[index].id
                    }
                };
            }
            // was a chunk name specified?
            if (value.sdtf.chunkName) {
                stypeValue.asset.chunk = {name: value.sdtf.chunkName};
            }
            requestBody[paramId] = stypeValue;
            requestBodyStrings[paramId] = JSON.stringify(stypeValue);
        }
    });
    console.log('Customization request body', requestBody);

    const result = await sdk.utils.submitAndWaitForCustomization(sdk, dto.sessionId, requestBodyStrings, maxWaitMsec);

    return {
        requestBody,
        outputs: (result.outputs as {[outputId: string]: ShapeDiverResponseOutput})
    }
}

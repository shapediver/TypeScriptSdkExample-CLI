import { initSession, uploadModel, waitForModelCheck } from "./GeometryBackendUtils";
import { createModel, getModelAccessData, getModelInfo, initPlatformSdk, listLatestModels, patchModelStatus } from "./PlatformBackendUtils";
import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { SdPlatformModelStatus, SdPlatformRequestModelStatus } from "@shapediver/sdk.platform-api-sdk-v1";

export const displayModelAccessData = async (identifier: string, allowExports: boolean, backend: boolean) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, allowExports, backend);

    console.log(data.access_data);
};

export const displayLatestModels = async (limit: number, own: boolean) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const models = await listLatestModels(sdk, limit, own);

    console.log(models);
}

export const displayModelInfoPlatform = async (identifier: string) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const result = await getModelInfo(sdk, identifier);

    console.log(result);
}

export const displayModelInfoGeometry = async (identifier: string) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, true, true);
    const result = await initSession(data.access_data);

    console.log(result.dto);
}

export const createAndUploadModel = async (filename: string, title?: string) : Promise<void> => {

    try {
        await fsp.access(filename, fs.constants.R_OK);
    } catch {
        throw new Error(`File ${filename} can not be read`)
    }

    const sdk = await initPlatformSdk();

    // Create model on platform backend, which also creates a corresponding
    // empty model on the geometry backend system of the user
    console.log('Create model...')
    const platform_data = await createModel(sdk, path.basename(filename), title);

    // Upload model file to geometry backend
    console.log('Upload model...')
    let geometry_data = await uploadModel(platform_data.access_data, filename);
    geometry_data = await waitForModelCheck(geometry_data);

    console.log(geometry_data.dto);

    if (geometry_data.dto.model.stat === 'pending') {
        console.log('Model checking in progress, you will be notified once it completes.');
    } 
    else if (geometry_data.dto.model.stat === 'denied') {
        console.error(`Model was denied: ${geometry_data.dto.model.msg}`);
    } 
    else if (geometry_data.dto.model.stat === 'confirmed') {
        console.log('Congratulations, your model was confirmed!');
    }

    console.log('Updating platform model status...');
    let model = await patchModelStatus(sdk, platform_data.model.id);
    if (model.status === SdPlatformModelStatus.Confirmed) {
        console.log('Publishing confirmed model...');
        model = await patchModelStatus(sdk, platform_data.model.id, SdPlatformRequestModelStatus.Done);
    }
   
    console.log(model);
}

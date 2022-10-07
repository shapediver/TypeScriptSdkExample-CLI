import { initSession, ISessionData, uploadModel, waitForModelCheck } from "./GeometryBackendUtils";
import { createModel, getModelAccessData, getModelInfo, initPlatformSdk, IPlatformBackendModelData, listLatestModels, patchModelStatus, queryUserCreditUsage } from "./PlatformBackendUtils";
import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { SdPlatformModelStatus, SdPlatformRequestModelStatus, SdPlatformResponseAnalyticsTimestampType, SdPlatformSdk } from "@shapediver/sdk.platform-api-sdk-v1";

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

    await publishModel_(sdk, platform_data, geometry_data);
}

const publishModel_ = async (sdk: SdPlatformSdk, platform_data: IPlatformBackendModelData, geometry_data: ISessionData) : Promise<void> => {

    if (geometry_data.dto.model.stat === 'pending') {
        console.log('Model checking is pending, you will be notified once it completes.');
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

export const publishModel = async (identifier: string) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const platform_data = await getModelAccessData(sdk, identifier, true, true);

    if (platform_data.model.status === SdPlatformModelStatus.Done) {
        console.log('Your model has already been published!');
        return;
    }

    let geometry_data = await initSession(platform_data.access_data);
    geometry_data = await waitForModelCheck(geometry_data);

    console.log(geometry_data.dto);

    await publishModel_(sdk, platform_data, geometry_data);
}

const dayTimestampToEpoch = (ts: string) : number => {
    if (ts.length != 8) 
        throw new Error('Provide a timestamp in format YYYYMMDD, e.g. 20220815');
    let num = 0;
    try {
        const y = Number(ts.substring(0, 4));
        const m = Number(ts.substring(4, 6)) - 1;
        const d = Number(ts.substring(6, 8));
        num = Math.round(Date.UTC(y, m, d) / 1000);
    } catch {
        throw new Error('Provide a timestamp in format YYYYMMDD, e.g. 20220815');
    }
    return num;
}

export const displayUserCreditUsage = async (identifier: string, days: number, from_s: string, to_s: string) : Promise<void> => {

    const sdk = await initPlatformSdk();

    const user_id = identifier ? identifier : sdk.authorization.authData.userId;

    if (from_s && !to_s || !from_s && to_s) {
        throw new Error('Specify "--days", or "--from" and "--to" timestamps.');
    }

    const to = to_s ? dayTimestampToEpoch(to_s) : Math.round(Date.now() / 1000);
    const from = from_s ? dayTimestampToEpoch(from_s) : to - (days + 1) * 86400;
  
    const data = await queryUserCreditUsage(sdk, user_id, from, to, SdPlatformResponseAnalyticsTimestampType.Day);

    console.table(data);
}

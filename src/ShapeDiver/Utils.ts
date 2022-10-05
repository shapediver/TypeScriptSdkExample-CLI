import { initSession } from "./GeometryBackendUtils";
import { getModelAccessData, getModelInfo, initPlatformSdk, listLatestModels } from "./PlatformBackendUtils";

export const displayModelAccessData = async (identifier: string, allowExports: boolean, backend: boolean) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, allowExports, backend);

    console.log(data.accessData);
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
    const result = await initSession(data.accessData);

    console.log(result.data);
}

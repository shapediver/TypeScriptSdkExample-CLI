import { getModelAccessData, initPlatformSdk, listLatestModels } from "./PlatformBackendUtils";

export const displayModelAccessData = async (identifier: string, allowExports: boolean, backend: boolean) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, allowExports, backend);

    console.log(data);
};

export const displayLatestModels = async (limit: number, own: boolean) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const models = await listLatestModels(sdk, limit, own);

    console.log(models);
}
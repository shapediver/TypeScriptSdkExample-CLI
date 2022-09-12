import { getModelAccessData, initPlatformSdk } from "./PlatformBackendUtils";

export const displayModelAccessData = async (identifier: string, allowExports: boolean, backend: boolean) : Promise<void> => {

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, allowExports, backend);

    console.log(data);
};

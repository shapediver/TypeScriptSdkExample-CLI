import { getSessionAnalytics, initSession, ISessionData, uploadModel, waitForModelCheck } from "./GeometryBackendUtils";
import { 
    createModel, 
    getAnalyticsAccessData, 
    getModelAccessData, 
    getModelInfo, 
    initPlatformSdk, 
    IPlatformBackendModelData, 
    listLatestModels, 
    notifyUsers, 
    NotifyUsersNotificationOptions, 
    NotifyUsersUserOptions, 
    patchModelStatus, 
    queryAllMatchingModels, 
    queryUserCreditUsage 
} from "./PlatformBackendUtils";
import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { SdPlatformModelStatus, SdPlatformNotificationClass, SdPlatformNotificationCreator, SdPlatformNotificationLevel, SdPlatformNotificationType, SdPlatformRequestModelStatus, SdPlatformResponseAnalyticsTimestampType, SdPlatformResponseModelAdmin, SdPlatformResponseUserAdmin, SdPlatformResponseUserPublic, SdPlatformSdk, SdPlatformValidationResponseError } from "@shapediver/sdk.platform-api-sdk-v1";
import { getChunkNameFromAttributes, makeExampleSdtf, mapSdtfTypeHintToParameterType, parseSdtf, printSdtfInfo, readSdtf } from "./SdtfUtils";
import { IParameterValue, runCustomizationUsingSdtf } from "./GeometryBackendUtilsSdtf";
import { ISdtfReadableAsset, SdtfTypeHintName } from "@shapediver/sdk.sdtf-v1";
import { ShapeDiverSdkApiResponseType } from "@shapediver/sdk.geometry-api-sdk-v2";

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
    for (let i = 0; i < arr.length; i += n) {
        yield arr.slice(i, i + n);
    }
}

export const displayModelAccessData = async (identifier: string, allowExports: boolean, backend: boolean): Promise<void> =>
{

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, allowExports, backend);

    console.log(data.access_data);
};

export const displayLatestModels = async (limit: number, own: boolean): Promise<void> =>
{

    const sdk = await initPlatformSdk();
    const models = await listLatestModels(sdk, limit, own);

    console.log(models);
}

/** Model info, for json export */
interface IModelInfo {
    id: string,
    guid: string,
    slug: string,
    title: string,
    analytics: {
        timestamp_from: string,
        timestamp_to: string,
        sessions: {
            app: number,
            backend: number,
            desktop: number,
            embedded: number, 
        }
    }
}

/** Model info per user, for json export  */
interface IModelInfoPerUser {
    done: IModelInfo[],
    confirmed: IModelInfo[],
    pending: IModelInfo[],
    email: string
}

/** Map from user id to model data, for json export */
interface IModelsPerUser {
    [key: string]: IModelInfoPerUser
}

/** Filename for json export */
const analyticsExportFilename = 'modelsPerUser.json'

/** Query model by model view URL and export them */
export const displayModelsByModelViewUrl = async (modelViewUrl: string, filename?: string): Promise<void> => 
{
    const sdk = await initPlatformSdk()

    const filters = {
        'backend_system.model_view_url[=]': modelViewUrl,
        'status[,]': ['pending', 'confirmed', 'done'],
        'deleted_at[?]': null,
    }

    const modelsPerUser : IModelsPerUser = {}

    console.log('Model id;User id;Status;Slug;Title')
    await queryAllMatchingModels(sdk, filters, async ({id, guid, user, slug, status, title}) => {
        if ( !modelsPerUser[user.id] ) { 
            const u = await sdk.users.get<SdPlatformResponseUserPublic>(user.id)
            modelsPerUser[user.id] = { pending: [], confirmed: [], done: [], email: u.data.email }
            console.log(u.data.email)
        }
        modelsPerUser[user.id][status].splice(
            modelsPerUser[user.id][status].length, 0, {id, guid, slug, title}
        )
    })

    await fsp.writeFile(filename ?? analyticsExportFilename, JSON.stringify(modelsPerUser))
}

/** Fetch analytics for previously exported models */
export const fetchModelAnalytics = async (timestamp_from: string, timestamp_to: string, filename?: string): Promise<void> => {

    const modelsPerUser : IModelsPerUser = JSON.parse(await fsp.readFile(filename ?? analyticsExportFilename, { encoding: 'utf8'}))

    const sdk = await initPlatformSdk()

    for (const user_id in modelsPerUser) {
        const models = modelsPerUser[user_id].done
            .filter( m => !m.analytics || m.analytics.timestamp_from !== timestamp_from || m.analytics.timestamp_to !== timestamp_to )
        const modelChunks = chunks<IModelInfo>(models, 50)
        
        for ( const chunk of modelChunks ) {

            const filteredChunk : IModelInfo[] = []
            for (const m of chunk) {
                try {
                    const data = (await sdk.models.get<SdPlatformResponseModelAdmin>(m.id)).data
                    if (!data.deleted_at)
                        filteredChunk.push(m)
                    else
                        console.log(`Model ${m.id} does not exist anymore.`)
                }
                catch (e)
                {
                    console.log(e)
                    if (e instanceof SdPlatformValidationResponseError)
                        console.log(`Model ${m.id} does not exist anymore.`)
                    else
                        throw e
                }
            }

            if (filteredChunk.length === 0)
                continue
       
            const data = await getAnalyticsAccessData(sdk, filteredChunk.map(c => c.id), filteredChunk.map(c => c.guid))
            const dto = await getSessionAnalytics(data, timestamp_from, timestamp_to)
            let i = 0
            for ( const model of filteredChunk ) {
                const modelData = dto.analytics.models[i++]
                model.analytics = {
                    timestamp_from, 
                    timestamp_to,
                    sessions: {
                        app: modelData.app.count,
                        backend: modelData.backend.count,
                        desktop: modelData.desktop.count,
                        embedded: modelData.embedded.count
                    }
                }
                console.log(model.guid, model.analytics)
            }
            fsp.writeFile(filename ?? analyticsExportFilename, JSON.stringify(modelsPerUser))
        }
    }
}

/** 
 * Notify users about decommissioning of the Rhino 5 geometry backend system, based on data exported by
 * displayModelsByModelViewUrl and fetchModelAnalytics
 */
export const notifyUsersAboutDecommissioning = async (filename?: string): Promise<void> => {

    const createNotifications = true

    const modelsPerUser : IModelsPerUser = JSON.parse(await fsp.readFile(filename ?? analyticsExportFilename, { encoding: 'utf8'}))

    const sdk = await initPlatformSdk()

    const htmlEscape = (str: string) => str
            .replace('–','-')
            .replace(/&/g, '&amp')
            .replace(/'/g, '&apos')
            .replace(/"/g, '&quot')
            .replace(/>/g, '&gt')   
            .replace(/</g, '&lt')
    
    const headingHtml = (level: number, heading: string) => `<h${level}>${htmlEscape(heading)}</h${level}>`
    const linkHtml = (url: string, text: string) => `<a href="${url}" target="_blank">${htmlEscape(text)}</a>`

    const htmlHeader = '<head><title>ShapeDiver - Rhino 5 Geometry Backend Decommissioning</title></head>'
    let htmlBody = headingHtml(1, "ShapeDiver - Rhino 5 Geometry Backend Decommissioning")
    htmlBody += 'After almost 7 years of operating a ShapeDiver Geometry Backend system based on Rhino 5, we are planning to decommission it on 31 August 2023 (2023/08/31). '
    htmlBody += 'Rhino 5 has not been updated since a long time, and almost no traffic is handled by this system anymore, which causes its operation to become uneconomic. '
    htmlBody += '<br/>Below please find a list of the ShapeDiver models owned by your account which are still operated on this system. '
    htmlBody += `You can also list those models in your ${linkHtml("https://www.shapediver.com/app/library?searchPhrase=https%3A%2F%2Fsduse1.us-east-1.shapediver.com", "Library")} by searching for the model view URL <i>https://sduse1.us-east-1.shapediver.com</i>. `
    htmlBody += `<br/>If you wish to do so, please ${linkHtml("https://help.shapediver.com/doc/model-library#Modellibrary-DownloadGrasshopperfilesagain", "download the corresponding Grasshopper models from the ShapeDiver platform")} before 31 August 2023 (2023/08/31). `
    htmlBody += '<br/>Uploading your Grasshopper models to one of the new ShapeDiver Geometry Backend systems (operated using Rhino 6 or 7) will work flawlessly in many cases, although this is not guaranteed due to subtle differences in the behavior of Grasshopper. '
    htmlBody += '<br/>Your models hosted on the Rhino 5 Geometry Backend system will disappear from your dashboard on 1 September 2023 (2023/09/01). '
    htmlBody += `<br/>Should you have any questions, please contact us via our ${linkHtml("https://forum.shapediver.com", "forum")}. `
    
    const listModelsHtml = (heading: string, models: IModelInfo[], type?: string) : string => {
        let html = ''
        html += headingHtml(4, heading)
        models.map(m => {
            html += "Title: " + linkHtml(`https://shapediver.com/app/m/${m.slug}`, m.title) + `, slug: ${m.slug}`
            if (type)
                html += `, usage count: ${m.analytics.sessions[type]}`
            html += "<br/>"
        })
        return html
    }

    const execAsync = async (cmd: string): Promise<{stdout: string, stderr: string}> => {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                }
                else
                {
                    resolve({stdout, stderr})
                }
            })
        })
    }

    const createNotification = async (user_id: string, href: string): Promise<void> => {

        if (!createNotifications)
            return

        await sdk.notifications.create({
          creator: SdPlatformNotificationCreator.Platform,
          level: SdPlatformNotificationLevel.Warning,
          class: SdPlatformNotificationClass.Account,
          type: SdPlatformNotificationType.GeometryBackendUpdate,
          description: 'Rhino 5 decommissioning - Click for more information',
          receiver_id: user_id,
          href
        });
      
    }

    for (const user_id in modelsPerUser ) {

        const email = modelsPerUser[user_id].email

        let htmlUser = headingHtml(2, `User ${email}`)
        htmlUser += `User id: ${user_id}`
        
        const modelsApp = modelsPerUser[user_id].done.filter(m => m.analytics.sessions.app > 0)
        const modelsBackend = modelsPerUser[user_id].done.filter(m => m.analytics.sessions.backend > 0)
        const modelsDesktop = modelsPerUser[user_id].done.filter(m => m.analytics.sessions.desktop > 0)
        const modelsEmbedded = modelsPerUser[user_id].done.filter(m => m.analytics.sessions.embedded > 0)

        htmlUser += headingHtml(3, "Models accessed in the past three months")
       
        if (modelsApp.length > 0 || modelsBackend.length > 0 || modelsDesktop.length > 0 || modelsEmbedded.length > 0) {
            
            htmlUser += 'The following models hosted on the Rhino 5 Geometry Backend system and owned by you have been accessed in the past three months. The usage count shows how many sessions have been opened. '

            if (modelsApp.length > 0) {
                htmlUser += listModelsHtml('Access via platform', modelsApp, "app")
            }
            if (modelsBackend.length > 0) {
                htmlUser += listModelsHtml('Access via backend API', modelsBackend, "backend")
            }
            if (modelsDesktop.length > 0) {
                htmlUser += listModelsHtml('Access from desktop clients', modelsDesktop, "desktop")
            }
            if (modelsEmbedded.length > 0) {
                htmlUser += listModelsHtml('Access from embedding', modelsEmbedded, "embedded")
            }

        }
        else
        {
            htmlUser += 'None of your models hosted on the Rhino 5 Geometry Backend system have been accessed in the past three months.'
        }

        htmlUser += headingHtml(3, "All models")
        if ( modelsPerUser[user_id].done.length > 0 )
            htmlUser += listModelsHtml('Status "done"', modelsPerUser[user_id].done)
        if ( modelsPerUser[user_id].confirmed.length > 0 )
            htmlUser += listModelsHtml('Status "confirmed"', modelsPerUser[user_id].confirmed)
        if ( modelsPerUser[user_id].pending.length > 0 )
            htmlUser += listModelsHtml('Status "pending"', modelsPerUser[user_id].pending)

        const html = `<!DOCTYPE html>${htmlHeader}<body>${htmlBody}${htmlUser}</body`

        const fn = `${user_id}.html`

        await fsp.writeFile(fn, html)
        await execAsync(`aws s3 cp ${fn} s3://shapediverdownloads/rhino5-decommissioning/${fn}`)
        await fsp.unlink(fn)

        const href = `https://downloads.shapediver.com/rhino5-decommissioning/${fn}`
        console.log(`User ${user_id}, ${email}, ${href}`)
        await createNotification(user_id, href)
    
    }

}

export const displayModelInfoPlatform = async (identifier: string): Promise<void> =>
{

    const sdk = await initPlatformSdk();

    const result = await getModelInfo(sdk, identifier);

    console.log(result);
}

export const displayModelInfoGeometry = async (identifier: string): Promise<void> =>
{

    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, true, true);
    const result = await initSession(data.access_data);

    console.log(result.dto);
}

export const createAndUploadModel = async (filename: string, title?: string): Promise<void> =>
{

    try
    {
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

const publishModel_ = async (sdk: SdPlatformSdk, platform_data: IPlatformBackendModelData, geometry_data: ISessionData): Promise<void> =>
{

    if (geometry_data.dto.model.stat === 'pending')
    {
        console.log('Model checking is pending, you will be notified once it completes.');
    }
    else if (geometry_data.dto.model.stat === 'denied')
    {
        console.error(`Model was denied: ${geometry_data.dto.model.msg}`);
    }
    else if (geometry_data.dto.model.stat === 'confirmed')
    {
        console.log('Congratulations, your model was confirmed!');
    }

    console.log('Updating platform model status...');
    let model = await patchModelStatus(sdk, platform_data.model.id);
    if (model.status === SdPlatformModelStatus.Confirmed)
    {
        console.log('Publishing confirmed model...');
        model = await patchModelStatus(sdk, platform_data.model.id, SdPlatformRequestModelStatus.Done);
    }

    console.log(model);
}

export const publishModel = async (identifier: string): Promise<void> =>
{

    const sdk = await initPlatformSdk();
    const platform_data = await getModelAccessData(sdk, identifier, true, true);

    if (platform_data.model.status === SdPlatformModelStatus.Done)
    {
        console.log('Your model has already been published!');
        return;
    }

    let geometry_data = await initSession(platform_data.access_data);
    geometry_data = await waitForModelCheck(geometry_data);

    console.log(geometry_data.dto);

    await publishModel_(sdk, platform_data, geometry_data);
}

const dayTimestampToEpoch = (ts: string): number =>
{
    if (ts.length != 8)
        throw new Error('Provide a timestamp in format YYYYMMDD, e.g. 20220815');
    let num = 0;
    try
    {
        const y = Number(ts.substring(0, 4));
        const m = Number(ts.substring(4, 6)) - 1;
        const d = Number(ts.substring(6, 8));
        num = Math.round(Date.UTC(y, m, d) / 1000);
    } catch {
        throw new Error('Provide a timestamp in format YYYYMMDD, e.g. 20220815');
    }
    return num;
}

export const displayUserCreditUsage = async (identifier: string, days: number, from_s: string, to_s: string): Promise<void> =>
{
    const sdk = await initPlatformSdk();

    const user_id = identifier ? identifier : sdk.authorization.authData.userId;

    if (from_s && !to_s || !from_s && to_s)
    {
        throw new Error('Specify "--days", or "--from" and "--to" timestamps.');
    }

    const to = to_s ? dayTimestampToEpoch(to_s) : Math.round(Date.now() / 1000);
    const from = from_s ? dayTimestampToEpoch(from_s) : to - (days + 1) * 86400;

    const data = await queryUserCreditUsage(sdk, user_id, from, to, SdPlatformResponseAnalyticsTimestampType.Day);

    console.table(data);
}

export const sdTFExample = async (identifier: string, sdTFfilename?: string, saveSdtfs?: boolean) : Promise<void> => {

    // get access to the model
    const sdk = await initPlatformSdk();
    const data = await getModelAccessData(sdk, identifier, true, true);
    const context = await initSession(data.access_data);

    // get input sdTF from command line, otherwise use auto-generated example
    let sdTFbuffer: ArrayBuffer;
    let sdTFasset: ISdtfReadableAsset;
    if (sdTFfilename) {
        try {
            await fsp.access(sdTFfilename, fs.constants.R_OK);
        } catch {
            throw new Error(`File ${sdTFfilename} can not be read`)
        }
        sdTFasset = await readSdtf(sdTFfilename);
        sdTFbuffer = await (await fsp.readFile(sdTFfilename)).buffer;
    }
    else {
        console.log('No input sdTF file was provided, using an example.')
        sdTFbuffer = await makeExampleSdtf([SdtfTypeHintName.STRING, SdtfTypeHintName.GEOMETRY_LINE, SdtfTypeHintName.GEOMETRY_POLYLINE, SdtfTypeHintName.RHINO_CURVE, SdtfTypeHintName.GEOMETRY_POINT]);
        sdTFasset = await readSdtf(sdTFbuffer);
        //await fsp.writeFile(`${identifier}.sdtf`, new DataView(sdTFbuffer));
    }

    // print information about input sdTF
    console.log('Input sdTF:');
    await printSdtfInfo(sdTFasset);
    
    console.log('\nMatching of chunks to parameters:');
    // find matching parameters for chunks, and create request dto
    const requestDto: {[id: string]: IParameterValue} = {};
    for (const chunk of sdTFasset.chunks) {
        // get chunk id
        if (!chunk.name) return;
        const chunkId = chunk.name;
        // check if the chunk has a friendly name
        const chunkFriendlyName = await getChunkNameFromAttributes(chunk);
        const chunkDisplayName = chunkFriendlyName ? `id "${chunkId}" name "${chunkFriendlyName}"` : `id "${chunkId}"`;
        // verify that the chunk has a typeHint
        if (!chunk.typeHint?.name) {
            console.warn(`Skipping chunk ${chunkDisplayName} which does not have a typeHint.`);
            continue;
        }
        const typeHint = chunk.typeHint.name;
        const parameterType = mapSdtfTypeHintToParameterType(typeHint as SdtfTypeHintName);
        if (!parameterType) {
            console.warn(`Skipping chunk ${chunkDisplayName} with typeHint "${typeHint}" for which no matching parameter type was found.`);
            continue;
        }
        // find a matching parameter for the chunk
        const params = Object.values(context.dto.parameters).filter(p => p.type === parameterType);
        if (params.length === 0) {
            console.warn(`No matching parameter for chunk ${chunkDisplayName} with typeHint "${typeHint}".`);
            continue;
        }
        else if (params.length > 1) {
            console.warn(`Multiple matching parameters for chunk ${chunkDisplayName} with typeHint "${typeHint}", picking the first one.`);
        }
        const param = params.find(p => !requestDto[p.id]);
        if (!param) {
            console.log(`Skipping chunk ${chunkDisplayName} with typeHint "${typeHint}" (parameters already matched to other chunks).`);
        } else {
            requestDto[param.id] = {
                sdtf: { arrayBuffer: sdTFbuffer, chunkId: chunkId, chunkName: chunkFriendlyName }
            };
            console.log(`Matched chunk ${chunkDisplayName} with typeHint "${typeHint}" to parameter id "${param.id}" name "${param.name}" with type "${param.type}".`);
        }
    };
  
    // run customization
    console.log('\nRunning customization:');
    const result = await runCustomizationUsingSdtf(context, requestDto);

    // print info about results
    console.log('\nParsing result:');
    let foundSdtfOutput = false;
    for (const outputId in result.outputs) {
        const output = result.outputs[outputId];
        if (!output.content) continue;
        for (const item of output.content) {
            if (item.contentType === 'model/vnd.sdtf') {
                foundSdtfOutput = true;
                console.log(`Found sdTF asset for output with name "${output.name}", id "${output.id}"`);
                await parseSdtf(item.href, data.access_data.access_token);
                if (saveSdtfs) {
                    const buf = await context.sdk.utils.download(item.href, ShapeDiverSdkApiResponseType.DATA);
                    const filename = `${output.name}_${output.id}:${output.version}.sdtf`;
                    try {
                        await fsp.writeFile(filename, new DataView(buf[1]));
                    } catch (e) {
                        console.log(`File ${filename} could not be saved.`, e)
                    }
                }
            }
        }
    }
    if (!foundSdtfOutput) {
        console.log('No sdTF asset could be found among the outputs.');
    }

    // TODO: optionally save resulting sdTFs

}

export const sdTFParse = async (filename: string) : Promise<void> => {
    try {
        await fsp.access(filename, fs.constants.R_OK);
    } catch {
        throw new Error(`File ${filename} can not be read`)
    }

    await parseSdtf(filename);
}

export const notifyUsersPlatform = async (options: NotifyUsersUserOptions, notification_options: NotifyUsersNotificationOptions) =>
{
    const sdk = await initPlatformSdk();
    const data = await notifyUsers(sdk, options, notification_options);

    console.table(data.map((x: SdPlatformResponseUserAdmin) => 
    {
        return {
            username: x.username,
            slug: x.slug,
            email: x.email,
        }
    }));
}

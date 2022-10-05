import { 
  create, 
  SdPlatformSdk, 
  SdPlatformModelGetEmbeddableFields, 
  SdPlatformModelTokenScopes, 
  SdPlatformResponseModelOwner, 
  SdPlatformResponseModelPublic, 
  SdPlatformSortingOrder,
  SdPlatformModelQueryEmbeddableFields
} from "@shapediver/sdk.platform-api-sdk-v1";
import { config } from "../../config";
import { IGeometryBackendAccessData } from "./Commons";

/**
 * Create an instance of the Platform Backend SDK and authenticate.
 * @returns 
 */
export const initPlatformSdk = async () : Promise<SdPlatformSdk> => {
    
  const sdk = await create({
    baseUrl: config.PlatformBackend.baseUrl,
    clientId: config.PlatformBackend.clientId
  });

  await sdk.authorization.passwordGrant(
    config.PlatformBackend.accessKeyId,
    config.PlatformBackend.accessKeySecret
  );

  return sdk;
};

/**
 * Fetch a model based on one of the following identifiers, and return the data required 
 * to access the model on its Geometry Backend system. 
 * 
 * @param sdk Authenticated instance of the Platform Backend SDK
 * @param identifier One of the following: 
 *   * id:    id of the model on the Platform Backend
 *   * guid:  id of the model on the Geometry Backend
 *   * slug:  URL identifier of the model as in (https://www.shapediver.com/app/m/{slug}), also works with private links
 * 
 * @param allowExports Pass true to allow exports
 * @param backend Pass true to return a ticket for backend access instead of embedding (frontend access)
 * @returns 
 */
export const getModelAccessData = async (sdk: SdPlatformSdk, identifier: string, allowExports: boolean, backend: boolean) : Promise<IGeometryBackendAccessData> => {

  const model = (await sdk.models.get<SdPlatformResponseModelOwner>(identifier, [
    backend ? SdPlatformModelGetEmbeddableFields.BackendTicket : SdPlatformModelGetEmbeddableFields.Ticket
  ])).data;
  
  const scopes = allowExports ? [SdPlatformModelTokenScopes.GroupView, SdPlatformModelTokenScopes.GroupExport] : [SdPlatformModelTokenScopes.GroupView];
  const tokenData = (await sdk.modelTokens.create({id: identifier, scope: scopes})).data;

  return {
    access_token: tokenData.access_token,
    model_view_url: tokenData.model_view_url,
    ticket: backend ? model.backend_ticket.ticket : model.ticket.ticket,
    guid: model.guid,
    scopes
  }
};

/**
 * Query latest models in status 'done' which the user has access to.
 * 
 * @param sdk 
 * @param limit How many models to return (upper limit)
 * @param own If true filter models owned by the user.
 * @returns 
 */
export const listLatestModels = async (sdk: SdPlatformSdk, limit: number, own: boolean) : Promise<SdPlatformResponseModelPublic[]> => {

  const filters = {
    'status[=]': 'done'
  };
  if (own) {
    filters['user_id[=]'] = sdk.authorization.authData.userId;
  }

  const models = (await sdk.models.query({
    sorters: { created_at: SdPlatformSortingOrder.Desc},
    limit,
    filters,
    embed: [SdPlatformModelQueryEmbeddableFields.User],
    strict_limit: true
  })).data.result;

  return models;
}

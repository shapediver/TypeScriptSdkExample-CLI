import { 
  create, 
  SdPlatformSdk, 
  SdPlatformModelGetEmbeddableFields, 
  SdPlatformModelTokenScopes, 
  SdPlatformResponseModelOwner, 
  SdPlatformResponseModelPublic, 
  SdPlatformSortingOrder,
  SdPlatformModelQueryEmbeddableFields,
  SdPlatformPolicyPermissionsModel
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
export const getModelAccessData = async (sdk: SdPlatformSdk, identifier: string, allowExports: boolean, backend: boolean) : Promise<{model: SdPlatformResponseModelOwner, accessData: IGeometryBackendAccessData}> => {

  const model = (await sdk.models.get<SdPlatformResponseModelOwner>(identifier, [
    backend ? SdPlatformModelGetEmbeddableFields.BackendTicket : SdPlatformModelGetEmbeddableFields.Ticket
  ])).data;
  
  const scopes = allowExports ? [SdPlatformModelTokenScopes.GroupView, SdPlatformModelTokenScopes.GroupExport] : [SdPlatformModelTokenScopes.GroupView];
  const tokenData = (await sdk.modelTokens.create({id: identifier, scope: scopes})).data;

  return {
    model,
    accessData: {
      access_token: tokenData.access_token,
      model_view_url: tokenData.model_view_url,
      ticket: backend ? model.backend_ticket.ticket : model.ticket.ticket,
      guid: model.guid,
      scopes
    }
  }
};

/**
 * Get information about a model. Makes two request to the platform backend, to decide which information to embed.
 * 
 * @param sdk 
 * @param identifier 
 * @returns 
 */
export const getModelInfo = async (sdk: SdPlatformSdk, identifier: string) : Promise<SdPlatformResponseModelOwner> => {

  let model = (await sdk.models.get<SdPlatformResponseModelOwner>(identifier)).data;
  const fields : SdPlatformModelGetEmbeddableFields[] = [];

  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedAccessDomains)) {
    fields.push(SdPlatformModelGetEmbeddableFields.Accessdomains);
    fields.push(SdPlatformModelGetEmbeddableFields.GlobalAccessdomains);
  }
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedBackendProperties))
    fields.push(SdPlatformModelGetEmbeddableFields.BackendProperties);
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedBackendSystems))
    fields.push(SdPlatformModelGetEmbeddableFields.BackendSystem);
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedBookmark))
    fields.push(SdPlatformModelGetEmbeddableFields.Bookmark);
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedDecoration))
    fields.push(SdPlatformModelGetEmbeddableFields.Decoration);
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedOrganization))
    fields.push(SdPlatformModelGetEmbeddableFields.Organization);
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedTags))
    fields.push(SdPlatformModelGetEmbeddableFields.Tags);
  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedUser))
    fields.push(SdPlatformModelGetEmbeddableFields.User);

  model = (await sdk.models.get<SdPlatformResponseModelOwner>(identifier, fields)).data;

  return model;
}

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


import
{
  create,
  SdPlatformSdk,
  SdPlatformModelGetEmbeddableFields,
  SdPlatformModelTokenScopes,
  SdPlatformResponseModelOwner,
  SdPlatformResponseModelPublic,
  SdPlatformSortingOrder,
  SdPlatformModelQueryEmbeddableFields,
  SdPlatformPolicyPermissionsModel,
  SdPlatformRequestModelCreate,
  SdPlatformModelFileType,
  SdPlatformModelVisibility,
  SdPlatformRequestModelStatus,
  SdPlatformResponseAnalyticsTimestampType,
  SdPlatformNotificationCreator,
  SdPlatformNotificationLevel,
  SdPlatformNotificationClass,
  SdPlatformNotificationType,
  SdPlatformResponseUserPublic,
} from "@shapediver/sdk.platform-api-sdk-v1";
import { config } from "../../config";
import { IGeometryBackendAccessData } from "./Commons";

/**
 * Information about a model
 */
export interface IPlatformBackendModelData
{
  /** Platform backend model DTO */
  model: SdPlatformResponseModelOwner,
  /** Data required to access a model on its Geometry Backend system */
  access_data: IGeometryBackendAccessData
}

/**
 * Create an instance of the Platform Backend SDK and authenticate.
 * @returns 
 */
export const initPlatformSdk = async (): Promise<SdPlatformSdk> =>
{

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
export const getModelAccessData = async (sdk: SdPlatformSdk, identifier: string, allowExports: boolean, backend: boolean): Promise<IPlatformBackendModelData> =>
{

  const model = (await sdk.models.get<SdPlatformResponseModelOwner>(identifier, [
    backend ? SdPlatformModelGetEmbeddableFields.BackendTicket : SdPlatformModelGetEmbeddableFields.Ticket
  ])).data;

  const scopes = allowExports ? [SdPlatformModelTokenScopes.GroupView, SdPlatformModelTokenScopes.GroupExport] : [SdPlatformModelTokenScopes.GroupView];
  const tokenData = (await sdk.modelTokens.create({ id: identifier, scope: scopes })).data;

  return {
    model,
    access_data: {
      access_token: tokenData.access_token,
      model_view_url: tokenData.model_view_url,
      ticket: backend ? model.backend_ticket.ticket : model.ticket.ticket,
      guid: model.guid,
      scopes
    }
  }
};

/**
 * Fetch a token for accessing the analytics of a model. 
 * @param sdk Authenticated instance of the Platform Backend SDK
 * @param id id of the model
 * @returns 
 */
export const getAnalyticsAccessData = async (sdk: SdPlatformSdk, id: string | string[], guid: string | string[]): Promise<IGeometryBackendAccessData> => 
{
  const scope = [SdPlatformModelTokenScopes.GroupAnalytics]
  const tokenData = Array.isArray(id) ? 
    (await sdk.modelTokens.create({ ids: id, scope })).data :
    (await sdk.modelTokens.create({ id, scope })).data

  if (Array.isArray(guid)) 
    return {
      access_token: tokenData.access_token,
      model_view_url: tokenData.model_view_url,
      guids: guid,
      scopes: scope
    }
  else
    return {
      access_token: tokenData.access_token,
      model_view_url: tokenData.model_view_url,
      guid: guid,
      scopes: scope
    }
} 

/**
 * Get information about a model. Makes two request to the platform backend, to decide which information to embed.
 * 
 * @param sdk 
 * @param identifier 
 * @returns 
 */
export const getModelInfo = async (sdk: SdPlatformSdk, identifier: string): Promise<SdPlatformResponseModelOwner> =>
{

  let model = (await sdk.models.get<SdPlatformResponseModelOwner>(identifier)).data;
  const fields: SdPlatformModelGetEmbeddableFields[] = [];

  if (model.permissions.includes(SdPlatformPolicyPermissionsModel.embedAccessDomains))
  {
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
export const listLatestModels = async (sdk: SdPlatformSdk, limit: number, own: boolean): Promise<SdPlatformResponseModelPublic[]> =>
{

  const filters = {
    'status[=]': 'done'
  };
  if (own)
  {
    filters['user_id[=]'] = sdk.authorization.authData.userId;
  }

  const models = (await sdk.models.query({
    sorters: { created_at: SdPlatformSortingOrder.Desc },
    limit,
    filters,
    embed: [SdPlatformModelQueryEmbeddableFields.User],
    strict_limit: true
  })).data.result;

  return models;
}

/**
 * Query all models matching the given filter 
 * @param sdk 
 * @param filters 
 * @param callback 
 * @returns 
 */
export const queryAllMatchingModels = async (sdk: SdPlatformSdk, filters: any, 
  callback: (model: SdPlatformResponseModelOwner) => Promise<void>
  ): Promise<SdPlatformResponseModelOwner[]> =>
{
  const models: SdPlatformResponseModelOwner[] = []
  let offset: string | undefined

  while (true) {
    const result = (await sdk.models.query<SdPlatformResponseModelOwner>({
      sorters: { created_at: SdPlatformSortingOrder.Desc },
      limit: 100,
      filters,
      embed: [SdPlatformModelQueryEmbeddableFields.User],
      strict_limit: false,
      offset
    })).data;

    models.splice( models.length, 0, ...result.result)
    console.log(`Models found: ${models.length}`)

    for (const model of result.result) {
      await callback(model)
    } 
 
    if (!result.pagination.next_offset)
      break
    offset = result.pagination.next_offset
  }

  return models;
}

/**
 * Create a model
 * 
 * @param sdk
 * @param filename 
 * @param title 
 * @returns 
 */
export const createModel = async (sdk: SdPlatformSdk, filename: string, title?: string): Promise<IPlatformBackendModelData> =>
{

  const filename_lower = filename.toLocaleLowerCase();
  if (!filename_lower.endsWith('.ghx') && !filename_lower.endsWith('.gh'))
    throw new Error('File ending must be ".gh" or ".ghx"')

  const body: SdPlatformRequestModelCreate = {
    filename,
    ftype: filename.toLocaleLowerCase().endsWith('.ghx') ? SdPlatformModelFileType.GHX : SdPlatformModelFileType.GH,
    title,
    backendaccess: true,
    visibility: SdPlatformModelVisibility.Private
  };

  const scopes = [
    SdPlatformModelTokenScopes.GroupOwner,
    SdPlatformModelTokenScopes.GroupView
  ];
  const model = (await sdk.models.create(body)).data;
  const token = (await sdk.modelTokens.create({ id: model.id, scope: scopes })).data;

  return {
    model,
    access_data: {
      access_token: token.access_token,
      model_view_url: token.model_view_url,
      guid: token.guid,
      scopes
    }
  };
}

/**
 * Empty model patch request, which will cause the platform backend to update the model's status based on the geometry backend.
 * @param sdk 
 * @param model_id 
 * @returns 
 */
export const patchModelStatus = async (sdk: SdPlatformSdk, model_id: string, status?: SdPlatformRequestModelStatus): Promise<SdPlatformResponseModelOwner> =>
{
  const model = (await sdk.models.patch(model_id, { status })).data;
  return model;
}

/**
 * Credit usage
 */
export interface ICreditUsage
{
  /** timestamp */
  timestamp: string,
  /** credits spent for sessions (10 minute periods) */
  sessions: number,
  /** credits spent for exports */
  exports: number,
  /** credits spent for computations */
  computations: number,
}

/**
 * Query the credit usage aggregated for a user. 
 * Note: This corresponds to the credit calculation formula as of 2022-10-07.
 * @param sdk 
 * @param user_id 
 * @param from epoch timestamp, start date
 * @param to epoch timestamp, end date
 * @param type type of aggregated, defaults to daily (daily and monthly are available)
 * @returns 
 */
export const queryUserCreditUsage = async (sdk: SdPlatformSdk, user_id: string, from: number, to: number, type: SdPlatformResponseAnalyticsTimestampType = SdPlatformResponseAnalyticsTimestampType.Day): Promise<ICreditUsage[]> =>
{

  const filters = {
    'user_id[=]': user_id,
    'timestamp_type[=]': type,
    'timestamp_date[>=]': from,
    'timestamp_date[<=]': to,
  };

  const limit = 100;

  const result = (await sdk.userAnalytics.query({
    sorters: { timestamp_date: SdPlatformSortingOrder.Asc },
    filters,
    limit,
    strict_limit: true
  }));

  if (result.data.pagination.next_offset)
  {
    console.warn(`Result is limited to ${limit} items, more items are available.`);
  }

  const items: ICreditUsage[] = []
  const aggregated: ICreditUsage = {
    timestamp: 'SUM',
    sessions: 0,
    exports: 0,
    computations: 0,
  }

  for (const item of result.data.result)
  {
    const sessions = item.data.export.sum;

    let exports = 0;
    exports += Math.ceil(0.1 * (item.data.customize?.sum_desktop || 0));
    exports += Math.ceil(0.1 * (item.data.customize?.sum_backend || 0));

    const computations = item.data.embedded.billable_count;

    items.push({
      timestamp: item.timestamp,
      sessions,
      exports,
      computations,
    });

    aggregated.computations += computations;
    aggregated.exports += exports;
    aggregated.sessions += sessions;
  }

  items.push(aggregated);

  return items;
}

/**
 * Decides which filter to use.
 */
export enum NotifyUsersOrganizationFilter 
{
  /**
   * If no filter is to be applied.
   */
  NoFilter,
  /**
   * Check for users that are in organization.
   */
  InOrganization,

  /**
   * Check for users which are not in organization.
   */
  NotInOrganization,
}

export interface NotifyUsersUserOptions 
{
  subscribed_plan_name: string;
  subscribed_plan_name_exact: string;
  features_of_user_true_value?: string | Array<string>;
  features_of_user_false_value?: string | Array<string>;
  organization_filter?: NotifyUsersOrganizationFilter;
  organization_roles?: string | Array<string>;
  dry_run?: boolean;
  offset?: string
}

/**
 * The notification options parameters.
 */
export interface NotifyUsersNotificationOptions 
{
  type: SdPlatformNotificationType;
  href?: string;
  description: string;
}


export const notifyUsers = async (sdk: SdPlatformSdk, notify_users_user_options: NotifyUsersUserOptions, notification_options: NotifyUsersNotificationOptions): Promise<Array<SdPlatformResponseUserPublic>> => 
{
  const uo = notify_users_user_options;

  // validation
  if ( -1 === Object.keys(SdPlatformNotificationType).findIndex(k => SdPlatformNotificationType[k] === notification_options.type) ) {
    throw new Error(`Notification type must be one of ${Object.values(SdPlatformNotificationType).join(",")}`);
  }

  const filter = {};

  // Don't send notifications to deleted users
  filter["deleted_at[?]"] = null;

  // Filter by subscribed plan name
  if (uo.subscribed_plan_name_exact) {
    filter["chargebee_user.type"] = "plan";
    filter["chargebee_user.data->name[=]"] = uo.subscribed_plan_name_exact;
  }
  else if (uo.subscribed_plan_name) {
    filter["chargebee_user.type"] = "plan";
    filter["chargebee_user.data->name[%]"] = uo.subscribed_plan_name;
  }

  // Features of user filter
  if (Array.isArray(uo.features_of_user_true_value))
  {
    for (let feature of uo.features_of_user_true_value)
    {
      filter[`user_features->feature->${feature.trim()}`] = true;
    }
  }
  else if (uo.features_of_user_true_value && uo.features_of_user_true_value != "")
  {
    filter[`user_features->feature->${uo.features_of_user_true_value}`] = true;
  }

  if (Array.isArray(uo.features_of_user_false_value))
  {
    for (let feature of uo.features_of_user_false_value)
    {
      filter[`user_features->feature->${feature.trim()}`] = false;
    }
  }
  else if (uo.features_of_user_false_value && uo.features_of_user_false_value != "")
  {
    filter[`user_features->feature->${uo.features_of_user_false_value}`] = false;
  }

  // organization filter.
  if (uo.organization_filter == NotifyUsersOrganizationFilter.InOrganization)
  {
    filter["organization_id[!?]"] = null;
  }
  else if (uo.organization_filter == NotifyUsersOrganizationFilter.NotInOrganization)
  {
    filter["organization_id[?]"] = null;
  }

  // users
  if (Array.isArray(uo.organization_roles))
  {
    filter["organization_role[,]"] = uo.organization_roles.map(x => x.trim());
  }
  else if (uo.organization_roles && uo.organization_roles != "")
  {
    filter["organization_role"] = uo.organization_roles;
  }

  let offset = null;
  if (uo.offset)
    offset = uo.offset;

  let users_notified : SdPlatformResponseUserPublic[] = [];

  do
  {
    const users_res = await sdk.users.query({
      filters: filter,
      //sorters: {'created_at': SdPlatformSortingOrder.Asc},
      limit: 100,
      strict_limit: true,
      offset: offset
    });

    offset = users_res.data.pagination.next_offset;
    const users = users_res.data.result as SdPlatformResponseUserPublic[];
    users_notified = users_notified.concat(users);

    if (offset) {
      console.log(`Fetched ${users.length} users, current offset ${offset}.`)
    } else {
      console.log(`Fetched ${users.length} users, done.`)
    }

    // if not dry run, create notifications. 
    if (uo.dry_run === false)
    {
      // divide array users into chunks of 75 
      const chunkLength = 75;
      for (let i=0; i<users.length; i+=chunkLength)
      {
        const chunk = users.slice(i, i+chunkLength);
        
        for (const user of chunk)
          console.log(`Creating notification for user id "${user.id}", username "${user.username}", email "${user.email}".`);
      
        try
        {
          await sdk.notifications.createMultiple({
            creator: SdPlatformNotificationCreator.Platform,
            level: SdPlatformNotificationLevel.Info,
            class: SdPlatformNotificationClass.Account,
            type: notification_options.type,
            description: notification_options.description,
            receiver_ids: chunk.map(x => x.id),
            href: notification_options.href
          });
        }
        catch (ex)
        {
          console.log(ex);
          throw ex;
        }
      }

    }
    else {
      console.log(`Dry run mode, not creating notifications.`);
    }

  } while (offset != null);

  return users_notified;
}

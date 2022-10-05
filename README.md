# TypeScriptSdkExample-CLI

A simple example on how to use the ShapeDiver TypeScript SDKs for a CLI tool. This example makes use of the following SDKs: 

  * [ShapeDiver Platform SDK](https://www.npmjs.com/package/@shapediver/sdk.platform-api-sdk-v1)
  * [ShapeDiver Geometry Backend SDK](https://www.npmjs.com/package/@shapediver/sdk.geometry-api-sdk-v2)

Please find more information about our [APIs and SDKs](https://help.shapediver.com/doc/apis-and-sdks) on our help pages. 

The CLI tool offered by this example allows to do things like: 

  * list models which the user has access to
  * get access data for a ShapeDiver model
  * print information about a ShapeDiver model
  * programmatically upload new Grasshopper models to ShapeDiver

# Setup

## Install dependencies

```
npm install
```

## Create config.ts from config.ts.template

Copy `config.ts.template` to `config.ts` and fill in your data.
You will need a ShapeDiver Account to create a pair of [Platform API access keys](https://help.shapediver.com/doc/platform-api-access-keys).
In case you are not using the main shared ShapeDiver Platform, please adapt the `baseUrl`.

## Run CLI tool

```
$ ./shapediver-cli.ts

Examples:

"shapediver-cli.ts model-access-data -i IDENTIFIER"        - get embedding access data for model (IDENTIFIER = slug, id, guid)
"shapediver-cli.ts model-access-data -i IDENTIFIER -b"     - get backend access data for model 
"shapediver-cli.ts model-access-data -i IDENTIFIER -b -e"  - get backend access data for model, allowing exports

"shapediver-cli.ts list-latest-models"                   - list 10 latest models owned by the user
"shapediver-cli.ts list-latest-models --own false"       - list 10 latest models which the user has access to
"shapediver-cli.ts list-latest-models --limit 3"         - list 3 latest models owned by the user

"shapediver-cli.ts model-info-platform -i IDENTIFIER"     - get platform backend information of a model (user, domains, tags, decoration, etc)
"shapediver-cli.ts model-info-geometry -i IDENTIFIER"     - get geometry backend information of a model (parameters, outputs, exports, etc)

"upload-model -f "FILENAME" -t "TITLE"                    - create and upload model, wait for its confirmation, publish it (private visibility)

$ ./shapediver-cli.ts list-latest-models --limit 1
[
  {
    status: 'done',
    created_at: 1662580563,
    updated_at: 1662580712,
    link_sharing_slug: null,
    require_token: false,
    backend_properties: null,
    backend_ticket: null,
    author_ticket: null,
    accessdomains: [],
    global_accessdomains: null,
    use_global_accessdomains: true,
    backend_access: true,
    backend_system: null,
    user: {
      id: '9735f1cc-2010-424f-95ef-b3457d21c671',
      first_name: 'Alex',
      last_name: 'Schiftner',
      username: 'alex+sdksamples@shapediver.com',
      avatar_url: 'https://sduse1-assets.shapediver.com/production/assets/img/user.png',
      slug: 'alex-sdksamplesatshapediver-com',
      visibility: 'public',
      visibility_nominal: 'public'
    },
    tags: [],
    decoration: [],
    ticket: null,
    visibility: 'private',
    visibility_nominal: 'private',
    guid: '36c42660-6792-4e8d-866f-913323f104f7',
    featured: false,
    bookmark: null,
    organization: null,
    id: '9735f863-7187-4cb6-8f84-9e3bc2cb6bea',
    title: 'ImageToMeshProjector',
    slug: 'imagetomeshprojector-5',
    description: '',
    thumbnail_url: '',
    policies_granted: [
      'OwnedModelPolicyView',
      'OwnedModelPolicyExport',
      'OwnedModelPolicyBackendApi',
      'OwnedModelPolicyDesktopClients',
      'OwnedModelPolicySavedStates',
      'OwnedModelPolicyAnalyticsSession',
      'OwnedModelPolicyAnalyticsComputation',
      'OwnedModelPolicyIframeEmbedding',
      'OwnedModelPolicyDirectEmbedding',
      'OwnedModelPolicyUnlistedModels'
    ],
    policies_denied: [],
    permissions: [
      'create_saved_state',
      'decrypt_ticket',
      'embed_access_domains',
      'embed_backend_properties',
      'embed_backend_systems',
      'embed_bookmark',
      'embed_decoration',
      'embed_tags',
      'embed_user',
      'get_analytics_computation',
      'get_analytics_session',
      'get_rest_model_owner',
      'get_rest_model_public',
      'get_sharing_all',
      'get_ticket',
      'get_ticket_author',
      'get_ticket_backend',
      'get_token_scope_group_analytics',
      'get_token_scope_group_export',
      'get_token_scope_group_owner',
      'get_token_scope_group_view',
      'query_all_saved_states',
      'put_sharing_all',
      'ui_backend_api',
      'ui_desktop_clients',
      'ui_direct_embedding',
      'ui_iframe_embedding',
      'ui_unlisted_models',
      'update_owner',
      'delete',
      'embed_organization'
    ]
  }
]


$ ./shapediver-cli.ts model-info-geometry -i imagetomeshprojector-5
{
  version: '2.5.2',
  sessionId: '3d33b43a-4897-4181-b691-0e93fe8ce2f5',
  viewer: {
    config: {
      build_date: '2022-09-06T09:24:06.812Z',
      build_version: '3.2.3.1',
      settings_version: '1.0',
      ambientOcclusion: false,
      autoRotateSpeed: 0,
      backgroundColor: '#ffffffff',
      bumpAmplitude: 1,
      camera: [Object],
      cameraAutoAdjust: false,
      cameraMovementDuration: 800,
      cameraOrtho: [Object],
      cameraRevertAtMouseUp: false,
      clearAlpha: 1,
      clearColor: '#ffffffff',
      commitParameters: false,
      controlDamping: 0.1,
      controlNames: {},
      controlOrder: [Array],
      defaultMaterialColor: '#d3d3d3',
      disablePan: false,
      disableZoom: false,
      enableAutoRotation: false,
      enableRotation: true,
      environmentMap: 'photo_studio',
      environmentMapResolution: '1024',
      fov: 60,
      lightScene: 'e54890a8-58f3-4d10-90cc-0a23f9af05fa',
      lightScenes: [Object],
      panSpeed: 0.5,
      parametersHidden: [],
      pointSize: 1,
      revertAtMouseUpDuration: 800,
      rotateSpeed: 0.5,
      showEnvironmentMap: false,
      showGrid: false,
      showGroundPlane: false,
      showShadows: true,
      topView: false,
      zoomExtentFactor: 1,
      zoomSpeed: 0.5
    }
  },
  actions: [
    {
      name: 'default',
      title: 'Default model',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/default',
      method: 'GET'
    },
    {
      name: 'close',
      title: 'Close session',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/close',
      method: 'POST'
    },
    {
      name: 'log',
      title: 'Send a log message',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/log/message',
      template: 'log-request',
      method: 'POST'
    },
    {
      name: 'gltf-upload',
      title: 'Upload glTF file',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/gltf',
      template: 'gltf-upload-request',
      method: 'POST'
    },
    {
      name: 'customize',
      title: 'Customize model',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/output',
      method: 'PUT',
      template: 'customize-request'
    },
    {
      name: 'file-upload',
      title: 'Request file upload URLs',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/file/upload',
      template: 'file-upload-request',
      method: 'POST'
    },
    {
      name: 'cache',
      title: 'Get cached output',
      href: 'https://sdr7euc1.eu-central-1.shapediver.com/api/v2/session/3d33b43a-4897-4181-b691-0e93fe8ce2f5/output/cache',
      template: 'cache-request',
      method: 'PUT'
    }
  ],
  templates: [
    {
      name: 'log-request',
      title: 'Template for log action',
      data: [Object]
    },
    {
      name: 'gltf-upload-request',
      title: 'Template for glTF upload request',
      data: {}
    },
    {
      name: 'customize-request',
      title: 'Template for customize action',
      data: [Object]
    },
    {
      name: 'file-upload-request',
      title: 'Template for file-upload action',
      data: [Object]
    }
  ],
  model: {
    id: '36c42660-6792-4e8d-866f-913323f104f7',
    stat: 'confirmed',
    createdate: '2022-09-07T19:56:03.783Z',
    name: 'ImageToMeshProjector'
  },
  setting: {},
  file: {},
  statistic: {},
  parameters: {
    '4b542891-5f7e-4369-a86b-6182d8ff2204': {
      id: '4b542891-5f7e-4369-a86b-6182d8ff2204',
      defval: '10,-15,3',
      max: 100,
      name: 'Point of view',
      type: 'String',
      visualization: 'text',
      group: [Object],
      order: 5,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    '9876f55e-2e72-4446-852c-0b3f45f5bcc9': {
      id: '9876f55e-2e72-4446-852c-0b3f45f5bcc9',
      defval: '',
      format: [Array],
      max: 10485760,
      name: 'ImportBmp',
      type: 'File',
      visualization: 'button',
      group: [Object],
      order: 7,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    '9bcbbe0d-deff-460c-9658-12b1bd1a4718': {
      id: '9bcbbe0d-deff-460c-9658-12b1bd1a4718',
      defval: '',
      format: [Array],
      max: 10485760,
      name: 'Mesh, or...',
      type: 'File',
      visualization: 'button',
      group: [Object],
      order: 0,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    'b2804605-f0c4-48de-bca6-ec33b444e24d': {
      id: 'b2804605-f0c4-48de-bca6-ec33b444e24d',
      decimalplaces: 1,
      defval: '8',
      min: 0,
      max: 90,
      name: 'Field of view',
      type: 'Float',
      visualization: 'slider',
      group: [Object],
      order: 4,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    'fa076989-c83c-4988-b8b1-473101f16d43': {
      id: 'fa076989-c83c-4988-b8b1-473101f16d43',
      decimalplaces: 0,
      defval: '2',
      min: 1,
      max: 5,
      name: 'Faces per cube',
      type: 'Int',
      visualization: 'slider',
      group: [Object],
      order: 2,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    '87266a9f-04e9-4d0e-bd5f-637243f62070': {
      id: '87266a9f-04e9-4d0e-bd5f-637243f62070',
      decimalplaces: 0,
      defval: '2',
      min: 1,
      max: 5,
      name: 'Cube density',
      type: 'Int',
      visualization: 'slider',
      group: [Object],
      order: 3,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    'b719ebef-68f7-4c8e-b3b4-0e21b6ffcf4c': {
      id: 'b719ebef-68f7-4c8e-b3b4-0e21b6ffcf4c',
      decimalplaces: 0,
      defval: '8',
      min: 1,
      max: 20,
      name: 'Cubes',
      type: 'Int',
      visualization: 'slider',
      group: [Object],
      order: 1,
      tooltip: '',
      displayname: '',
      hidden: false
    },
    '57840b0b-bfa5-4d09-b309-60502c829fd1': {
      id: '57840b0b-bfa5-4d09-b309-60502c829fd1',
      defval: '0xffffffff',
      name: 'Color',
      type: 'Color',
      visualization: 'swatch',
      group: [Object],
      order: 6,
      tooltip: '',
      displayname: '',
      hidden: false
    }
  },
  outputs: {
    f8b19bd58d4940ae3c2cc11505b6d5ea: {
      id: 'f8b19bd58d4940ae3c2cc11505b6d5ea',
      name: 'glTFDisplay',
      uid: '3a18af94-4ef9-427a-820e-5347b8306775',
      version: '848284166160e601e1ab228ccc28904f',
      order: 1,
      tooltip: '',
      displayname: '',
      hidden: false,
      status_computation: 'success',
      status_collect: 'success',
      bbmin: [Array],
      bbmax: [Array],
      content: [Array]
    },
    '6dfb8ae7dec6c5b57f1a1f32961be3db': {
      id: '6dfb8ae7dec6c5b57f1a1f32961be3db',
      name: 'Mesh, or...',
      uid: '9bcbbe0d-deff-460c-9658-12b1bd1a4718',
      version: '99914b932bd37a50b983c5e7c90ae93b',
      order: 0,
      tooltip: '',
      displayname: '',
      hidden: false,
      status_computation: 'success',
      status_collect: 'success',
      content: []
    }
  }
}


$ ./shapediver-cli.ts model-info-platform -i imagetomeshprojector-5
{
  status: 'done',
  created_at: 1662580563,
  updated_at: 1662580712,
  link_sharing_slug: null,
  require_token: false,
  backend_properties: {
    stat: 'confirmed',
    msg: null,
    settings: { compute: [Object], ticket: [Object], token: [Object] }
  },
  backend_ticket: null,
  author_ticket: null,
  accessdomains: [],
  global_accessdomains: [],
  use_global_accessdomains: true,
  backend_access: true,
  backend_system: {
    id: '93ab7a93-c616-45e0-b6cd-b85109d34b3a',
    model_view_url: 'https://sdr7euc1.eu-central-1.shapediver.com',
    model_mgmt_url: 'https://sdr7euc1.eu-central-1.shapediver.com',
    alias: 'sdr7euc1',
    description: 'Rhino 7, shared Geometry Backend'
  },
  user: {
    id: '9735f1cc-2010-424f-95ef-b3457d21c671',
    first_name: 'Alex',
    last_name: 'Schiftner',
    username: 'alex+sdksamples@shapediver.com',
    avatar_url: 'https://sduse1-assets.shapediver.com/production/assets/img/user.png',
    slug: 'alex-sdksamplesatshapediver-com',
    visibility: 'public',
    visibility_nominal: 'public'
  },
  tags: [],
  decoration: [
    {
      id: '9735f93c-031e-4073-921b-440be7e758ce',
      url: 'https://sduse1-assets.shapediver.com/images/model/9735f93c-031e-4073-921b-440be7e758ce.png',
      alt: null,
      alias: null
    }
  ],
  ticket: null,
  visibility: 'private',
  visibility_nominal: 'private',
  guid: '36c42660-6792-4e8d-866f-913323f104f7',
  featured: false,
  bookmark: { bookmarked: false },
  organization: null,
  id: '9735f863-7187-4cb6-8f84-9e3bc2cb6bea',
  title: 'ImageToMeshProjector',
  slug: 'imagetomeshprojector-5',
  description: '',
  thumbnail_url: 'https://sduse1-assets.shapediver.com/images/model/9735f93c-031e-4073-921b-440be7e758ce_thumb.png',
  policies_granted: [
    'OwnedModelPolicyView',
    'OwnedModelPolicyExport',
    'OwnedModelPolicyBackendApi',
    'OwnedModelPolicyDesktopClients',
    'OwnedModelPolicySavedStates',
    'OwnedModelPolicyAnalyticsSession',
    'OwnedModelPolicyAnalyticsComputation',
    'OwnedModelPolicyIframeEmbedding',
    'OwnedModelPolicyDirectEmbedding',
    'OwnedModelPolicyUnlistedModels'
  ],
  policies_denied: [],
  permissions: [
    'create_saved_state',
    'decrypt_ticket',
    'embed_access_domains',
    'embed_backend_properties',
    'embed_backend_systems',
    'embed_bookmark',
    'embed_decoration',
    'embed_tags',
    'embed_user',
    'get_analytics_computation',
    'get_analytics_session',
    'get_rest_model_owner',
    'get_rest_model_public',
    'get_sharing_all',
    'get_ticket',
    'get_ticket_author',
    'get_ticket_backend',
    'get_token_scope_group_analytics',
    'get_token_scope_group_export',
    'get_token_scope_group_owner',
    'get_token_scope_group_view',
    'query_all_saved_states',
    'put_sharing_all',
    'ui_backend_api',
    'ui_desktop_clients',
    'ui_direct_embedding',
    'ui_iframe_embedding',
    'ui_unlisted_models',
    'update_owner',
    'delete',
    'embed_organization'
  ]
}

```


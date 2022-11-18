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

## Prerequisites

Install node.js. Possibilities and related reading: 

 * [Node Version Manager](https://github.com/nvm-sh/nvm)
 * [nodejs.org](https://nodejs.org/)
 * [Node.js tutorial in Visual Studio Code](https://code.visualstudio.com/docs/nodejs/nodejs-tutorial)

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

"shapediver-cli.ts model-access-data -i IDENTIFIER"       - Get embedding access data for model (IDENTIFIER = slug, id, guid)
"shapediver-cli.ts model-access-data -i IDENTIFIER -b"    - Get backend access data for model 
"shapediver-cli.ts model-access-data -i IDENTIFIER -b -e" - Get backend access data for model, allowing exports

"shapediver-cli.ts list-latest-models"                    - List 10 latest models owned by the user
"shapediver-cli.ts list-latest-models --own false"        - List 10 latest models which the user has access to
"shapediver-cli.ts list-latest-models --limit 3"          - List 3 latest models howned by the user

"shapediver-cli.ts model-info-platform -i IDENTIFIER"     - Get platform backend information of a model (user, basic properties, domains, tags, decoration)
"shapediver-cli.ts model-info-geometry -i IDENTIFIER"     - Get geometry backend information of a model (parameters, outputs, exports)

"shapediver-cli.ts upload-model -f FILENAME -t TITLE"     - Create and upload model, wait for checking process, publish model (private visibility)
"shapediver-cli.ts publish-model -i IDENTIFIER"           - Publish a model whose checking process resulted in status "pending"

"shapediver-cli.ts credit-usage"                          - Query credit usage for the past 31 days (credit calculation formula as of 2022-10-07)
"shapediver-cli.ts credit-usage -d 90"                    - Query credit usage for the past 90 days
"shapediver-cli.ts credit-usage --from 20220901 --to 20220930"
                                                          - Query credit usage from 20220901 to 20220930

"shapediver-cli.ts sdtf-example -i IDENTIFIER"            - Run a computation of a model which has sdTF inputs and outputs
"shapediver-cli.ts sdtf-example -i IDENTIFIER -f SDTF_FILE"
                                                          - Use given sdTF file as input data
"shapediver-cli.ts sdtf-example -i IDENTIFIER -s"         - Save the resulting sdTF files.

"shapediver-cli.ts parse-sdtf -f SDTF_FILE"               - Parse an sdTF file and prints some information about the contents

$
```

### List latest model
<details>
<summary>

```
$ ./shapediver-cli.ts list-latest-models --limit 1
```

</summary>

```
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
```

</details>

### Get Geometry Backend information for model
<details>
<summary>

```
$ ./shapediver-cli.ts model-info-geometry -i imagetomeshprojector-5
```

</summary>

```
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
```

</details>

### Get Platform Backend information for model
<details>
<summary>

```
$ ./shapediver-cli.ts model-info-platform -i imagetomeshprojector-5
```

</summary>

```
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

</details>


### Upload a model
<details>
<summary>

```
$ ./shapediver-cli.ts upload-model -f ./ARRS_texturized.ghx -t ARRS_texturized
```

</summary>

```
Create model...
Upload model...
Waiting for model check to start...
Maximum allowed computation time: 30000
Waiting for model check to finish...
Waiting for model check to finish...
Model status: confirmed
{
  version: '2.5.2',
  model: {
    id: '7e6158a6-df50-42ff-8484-069267d07b74',
    stat: 'confirmed',
    createdate: '2022-10-07T13:57:44.868Z',
    name: 'ARRS_texturized'
  },
  setting: {
    auth: { ticket: [Object], token: {} },
    compute: {
      deny_scripts: false,
      ftype: 'ghx',
      initial_warmup: false,
      max_comp_time: 30000,
      max_export_size: 536870912,
      max_idle_minutes: 30,
      max_model_size: 536870912,
      max_output_size: 536870912,
      max_wait_time: 0,
      num_loaded_max: 0,
      num_loaded_min: 2,
      num_preloaded_min: 0,
      trust: ''
    }
  },
  file: {
    download: 'https://sdr7euc1-nocdn.eu-central-1.shapediver.com/api/v2/model/7e6158a6-df50-42ff-8484-069267d07b74/file/download'
  },
  statistic: {
    comptime: 1923,
    lastview: '2022-10-07T13:57:56.996Z',
    memUsage: -3813376,
    numcomp: 1,
    numsessions: 0,
    requesttime: 3518,
    size: 1823858
  },
  parameters: {
    '86a6e7be-2b08-47b8-8ca4-8f81d75780f7': {
      id: '86a6e7be-2b08-47b8-8ca4-8f81d75780f7',
      choices: [Array],
      defval: '0',
      name: 'Export format',
      type: 'StringList',
      visualization: 'dropdown',
      order: 133,
      hidden: false
    },
    'ae479df2-1153-45c2-8897-4de1dc5e8f05': {
      id: 'ae479df2-1153-45c2-8897-4de1dc5e8f05',
      defval: 'false',
      name: 'Wall side',
      type: 'Bool',
      visualization: 'toggle',
      order: 543,
      hidden: false
    },
    '49746232-9136-42e4-872f-9b9c2f7bd121': {
      id: '49746232-9136-42e4-872f-9b9c2f7bd121',
      decimalplaces: 0,
      defval: '3',
      min: 1,
      max: 6,
      name: 'Count H',
      type: 'Int',
      visualization: 'slider',
      order: 816,
      hidden: false
    },
    'd2aa070b-3d6e-47ed-ac64-ffed14a4a392': {
      id: 'd2aa070b-3d6e-47ed-ac64-ffed14a4a392',
      decimalplaces: 0,
      defval: '2',
      min: 1,
      max: 4,
      name: 'Count V',
      type: 'Int',
      visualization: 'slider',
      order: 865,
      hidden: false
    },
    '8b874783-08cd-4a5c-9d82-0ec13e2986bc': {
      id: '8b874783-08cd-4a5c-9d82-0ec13e2986bc',
      defval: 'true',
      name: 'Back plates',
      type: 'Bool',
      visualization: 'toggle',
      order: 1064,
      hidden: false
    },
    'f40448dc-59ab-4fb9-a88f-628ef484ab8b': {
      id: 'f40448dc-59ab-4fb9-a88f-628ef484ab8b',
      decimalplaces: 0,
      defval: '330',
      min: 200,
      max: 600,
      name: 'Spacing vertical',
      type: 'Int',
      visualization: 'slider',
      order: 676,
      hidden: false
    },
    'fa8d1166-d611-4189-955b-73aa9c7aaa31': {
      id: 'fa8d1166-d611-4189-955b-73aa9c7aaa31',
      decimalplaces: 0,
      defval: '600',
      min: 300,
      max: 600,
      name: 'Spacing horizontal',
      type: 'Int',
      visualization: 'slider',
      order: 613,
      hidden: false
    },
    'eac642f3-e360-4d00-ae67-869dc00abde9': {
      id: 'eac642f3-e360-4d00-ae67-869dc00abde9',
      decimalplaces: 0,
      defval: '22',
      min: 10,
      max: 30,
      name: 'Board thickness',
      type: 'Int',
      visualization: 'slider',
      order: 247,
      hidden: false
    },
    'e5ed8216-1dd8-430d-8c29-d997b94ce5c1': {
      id: 'e5ed8216-1dd8-430d-8c29-d997b94ce5c1',
      decimalplaces: 0,
      defval: '250',
      min: 120,
      max: 300,
      name: 'Board depth',
      type: 'Int',
      visualization: 'slider',
      order: 432,
      hidden: false
    },
    'e2a3e14f-199b-410d-ad2c-8d48015863d4': {
      id: 'e2a3e14f-199b-410d-ad2c-8d48015863d4',
      decimalplaces: 0,
      defval: '500',
      min: 0,
      max: 1000,
      name: 'Texturescale',
      type: 'Int',
      visualization: 'slider',
      order: -175,
      hidden: false
    },
    '5a072830-e1d3-487b-be6e-bd8123d77631': {
      id: '5a072830-e1d3-487b-be6e-bd8123d77631',
      defval: 'false',
      name: 'Rotated',
      type: 'Bool',
      visualization: 'toggle',
      order: 1026,
      hidden: false
    },
    '7d1ca1b8-0348-495c-a059-1981f2a14447': {
      id: '7d1ca1b8-0348-495c-a059-1981f2a14447',
      decimalplaces: 1,
      defval: '3.5',
      min: 1,
      max: 6,
      name: 'Pocket size factor',
      type: 'Float',
      visualization: 'slider',
      order: 329,
      hidden: false
    },
    'db9a259d-df99-4bf0-8542-f447b45b68b5': {
      id: 'db9a259d-df99-4bf0-8542-f447b45b68b5',
      decimalplaces: 2,
      defval: '0.25',
      min: 0.1,
      max: 0.5,
      name: 'Notch depth factor',
      type: 'Float',
      visualization: 'slider',
      order: 163,
      hidden: false
    },
    '8c42ff7d-6bdb-406a-b9dd-0d0d19f06a34': {
      id: '8c42ff7d-6bdb-406a-b9dd-0d0d19f06a34',
      decimalplaces: 0,
      defval: '150',
      min: 25,
      max: 200,
      name: 'Side board',
      type: 'Int',
      visualization: 'slider',
      order: 718,
      hidden: false
    },
    '1d8bae6d-7f22-4a02-8634-c3cffc968ece': {
      id: '1d8bae6d-7f22-4a02-8634-c3cffc968ece',
      decimalplaces: 0,
      defval: '100',
      min: 0,
      max: 100,
      name: 'Rotation %',
      type: 'Int',
      visualization: 'slider',
      order: 982,
      hidden: false
    },
    'b616a953-afa3-4f05-a536-4ad36ad4118a': {
      id: 'b616a953-afa3-4f05-a536-4ad36ad4118a',
      decimalplaces: 0,
      defval: '200',
      min: 100,
      max: 200,
      name: 'Top board',
      type: 'Int',
      visualization: 'slider',
      order: 759,
      hidden: false
    },
    '08a9d69c-deec-4e74-a0ce-247239b21abd': {
      id: '08a9d69c-deec-4e74-a0ce-247239b21abd',
      choices: [Array],
      defval: '2',
      name: 'List',
      type: 'StringList',
      visualization: 'dropdown',
      order: 225,
      hidden: false
    },
    '88e4b20a-0fe9-4127-90c5-a44137caf9a0': {
      id: '88e4b20a-0fe9-4127-90c5-a44137caf9a0',
      defval: '0xffffffff',
      name: 'Color',
      type: 'Color',
      visualization: 'swatch',
      order: 181,
      hidden: false
    },
    'b4472d08-21f1-47e8-b420-08995c906f39': {
      id: 'b4472d08-21f1-47e8-b420-08995c906f39',
      choices: [Array],
      defval: '1',
      name: 'TextureBase',
      type: 'StringList',
      visualization: 'dropdown',
      order: 36,
      hidden: false
    },
    '37228913-c602-4f72-87d1-3bdf350d86af': {
      id: '37228913-c602-4f72-87d1-3bdf350d86af',
      defval: 'true',
      name: 'Wall',
      type: 'Bool',
      visualization: 'toggle',
      order: 952,
      hidden: false
    },
    'be66dbca-c11a-40f2-89f3-1cf955d50bbc': {
      id: 'be66dbca-c11a-40f2-89f3-1cf955d50bbc',
      defval: '0xffffffff',
      name: 'Diffuse concrete',
      type: 'Color',
      visualization: 'swatch',
      group: [Object],
      order: 1025,
      hidden: false
    },
    'c217ffeb-ef72-49ce-b189-e647b9a9f9dd': {
      id: 'c217ffeb-ef72-49ce-b189-e647b9a9f9dd',
      defval: '0x000000ff',
      name: 'Dimensioning',
      type: 'Color',
      visualization: 'swatch',
      order: 1553,
      hidden: false
    },
    'ca5f340f-0364-428f-a07f-a35c05a5b450': {
      id: 'ca5f340f-0364-428f-a07f-a35c05a5b450',
      defval: 'true',
      name: 'Dimensioning',
      type: 'Bool',
      visualization: 'toggle',
      order: 1713,
      hidden: false
    }
  },
  outputs: {
    c6868b74af5e322e08c9b0bd6e8ea3a2: {
      id: 'c6868b74af5e322e08c9b0bd6e8ea3a2',
      uid: 'cb1ba10d-0774-4f9a-a0c2-4b1a1f558da1',
      name: 'bookshelf',
      material: '13016beacfa16b94c963450272ac421c',
      dependency: [Array],
      hidden: false
    },
    '13016beacfa16b94c963450272ac421c': {
      id: '13016beacfa16b94c963450272ac421c',
      uid: 'cb1ba10d-0774-4f9a-a0c2-4b1a1f558da1',
      name: 'bookshelf',
      dependency: [Array],
      hidden: false
    },
    '775744b372f7e9dc1b5dc7cf558cd3fc': {
      id: '775744b372f7e9dc1b5dc7cf558cd3fc',
      uid: '47d91cf7-e1dc-4270-bd24-d2c72c52de25',
      name: 'concrete wall',
      material: '3e55ca0332915cac495e8ddba26d7b17',
      dependency: [Array],
      hidden: false
    },
    '3e55ca0332915cac495e8ddba26d7b17': {
      id: '3e55ca0332915cac495e8ddba26d7b17',
      uid: '47d91cf7-e1dc-4270-bd24-d2c72c52de25',
      name: 'concrete wall',
      dependency: [Array],
      hidden: false
    },
    f643417d03c140a8ad1019f47ed32ffc: {
      id: 'f643417d03c140a8ad1019f47ed32ffc',
      uid: 'ca96f982-1c25-420d-8021-eb86047cf12d',
      name: 'Tag',
      dependency: [Array],
      hidden: false
    },
    '715192b0c285cd81d1e4149fc5933e94': {
      id: '715192b0c285cd81d1e4149fc5933e94',
      uid: '3e24d242-4bb2-4b27-9dc2-2a2e99f438cb',
      name: 'Dimensioning',
      material: 'dba66e36236dbc6614c333182bb71076',
      dependency: [Array],
      hidden: false
    },
    dba66e36236dbc6614c333182bb71076: {
      id: 'dba66e36236dbc6614c333182bb71076',
      uid: '3e24d242-4bb2-4b27-9dc2-2a2e99f438cb',
      name: 'Dimensioning',
      dependency: [Array],
      hidden: false
    }
  },
  exports: {
    '6f95a6daca7722d288113914730fadee': {
      id: '6f95a6daca7722d288113914730fadee',
      uid: '22e0519f95a4b214a66db85491cd8760',
      name: 'Download 3D',
      type: 'download',
      dependency: [Array],
      order: 45,
      hidden: false
    },
    ea402cb0ba25dc161e066e4d3f3a12fd: {
      id: 'ea402cb0ba25dc161e066e4d3f3a12fd',
      uid: 'e9493363b53d2cdbf9814d5b3c406933',
      name: 'Download Parts',
      type: 'download',
      dependency: [Array],
      order: -95,
      hidden: false
    }
  }
}
Congratulations, your model was confirmed!
Updating platform model status...
Publishing confirmed model...
{
  status: 'done',
  created_at: 1665151064,
  updated_at: 1665151080,
  link_sharing_slug: null,
  require_token: false,
  backend_properties: null,
  backend_ticket: null,
  author_ticket: null,
  accessdomains: [],
  global_accessdomains: [],
  use_global_accessdomains: false,
  backend_access: true,
  backend_system: null,
  user: null,
  tags: [],
  decoration: [],
  ticket: null,
  visibility: 'private',
  visibility_nominal: 'private',
  guid: '7e6158a6-df50-42ff-8484-069267d07b74',
  featured: false,
  bookmark: null,
  organization: null,
  id: '9771d1c4-7fc4-410d-a0b7-3e04af5f7ce5',
  title: 'ARRS_texturized',
  slug: 'arrs-texturized-82',
  description: '',
  thumbnail_url: 'https://sduse1-assets.shapediver.com/images/model/7e6158a6-df50-42ff-8484-069267d07b74_thumb.png?v=1665151080'
}
```

</details>


### Query credit usage
<details>
<summary>

```
$ ./shapediver-cli.ts credit-usage --from 20220901 --to 20220930
```

</summary>

```
┌─────────┬────────────┬──────────┬─────────┬──────────────┐
│ (index) │ timestamp  │ sessions │ exports │ computations │
├─────────┼────────────┼──────────┼─────────┼──────────────┤
│    0    │ '20220901' │    0     │    0    │      0       │
│    1    │ '20220902' │    0     │    0    │      0       │
│    2    │ '20220903' │    0     │    0    │      0       │
│    3    │ '20220904' │    0     │    0    │      0       │
│    4    │ '20220905' │    0     │    0    │      0       │
│    5    │ '20220906' │    0     │    0    │      0       │
│    6    │ '20220907' │    0     │    2    │      0       │
│    7    │ '20220908' │    1     │    2    │      0       │
│    8    │ '20220909' │    0     │    0    │      0       │
│    9    │ '20220910' │    0     │    0    │      0       │
│   10    │ '20220911' │    0     │    0    │      0       │
│   11    │ '20220912' │    0     │    0    │      0       │
│   12    │ '20220913' │    0     │    0    │      0       │
│   13    │ '20220914' │    0     │    0    │      0       │
│   14    │ '20220915' │    0     │    0    │      0       │
│   15    │ '20220916' │    0     │    0    │      0       │
│   16    │ '20220917' │    0     │    0    │      0       │
│   17    │ '20220918' │    0     │    0    │      0       │
│   18    │ '20220919' │    0     │    0    │      0       │
│   19    │ '20220920' │    0     │    0    │      0       │
│   20    │ '20220921' │    0     │    0    │      0       │
│   21    │ '20220922' │    0     │    0    │      0       │
│   22    │ '20220923' │    0     │    0    │      0       │
│   23    │ '20220924' │    0     │    0    │      0       │
│   24    │ '20220925' │    0     │    0    │      0       │
│   25    │ '20220926' │    0     │    0    │      0       │
│   26    │ '20220927' │    0     │    0    │      0       │
│   27    │ '20220928' │    0     │    0    │      0       │
│   28    │ '20220929' │    0     │    0    │      0       │
│   29    │ '20220930' │    0     │    0    │      0       │
│   30    │   'SUM'    │    1     │    4    │      0       │
└─────────┴────────────┴──────────┴─────────┴──────────────┘
```

</details>


### Run sdTF computation
<details>
<summary>

```
$ ./shapediver-cli.ts sdtf-example -i curvepipe -f Grasshopper/SomeCurves.sdtf
```

</summary>

```
The sdTF asset contains 1 chunks.
  Chunk name "aca94b27-19a3-43c3-a1e2-8e36faeed5d7", typeHint "rhino.curve":
    Attributes:
      "Name" => "Crv"
    Branches:
      [0,0] => 3 items
      [0,1] => 20 items

Matching of chunks to parameters:
Matched chunk id "aca94b27-19a3-43c3-a1e2-8e36faeed5d7" name "Crv" with typeHint "rhino.curve" to parameter id "2dda6f57-2b58-442b-8d17-07f00c8129fa" name "Crv" with type "sCurve".

Running customization:
Customization request body:  {
  "2dda6f57-2b58-442b-8d17-07f00c8129fa": {
    "asset": {
      "id": "pub/0ec32d44-27be-4888-9e6a-856e79592a7b",
      "chunk": {
        "id": "aca94b27-19a3-43c3-a1e2-8e36faeed5d7",
        "name": "Crv"
      }
    }
  }
}

Parsing result:
Found sdTF asset for output with name "SDOutput", id "122fdd60fbaa30c8588da25674bf9d88"
The sdTF asset contains 2 chunks.
  Chunk name "cb2bce9f-e7a6-4f7d-a43a-7313cda38107", typeHint "rhino.curve":
    Attributes:
      "Name" => "Curve"
    Branches:
      [0,0] => 3 items
      [0,1] => 20 items
  Chunk name "bb8a271f-64c2-4694-b95f-48f72639281e", typeHint "unknown":
    Attributes:
      "Name" => "Text"
```

</details>


### Parse sdTF and print basic information
<details>
<summary>

```
$ ./shapediver-cli.ts parse-sdtf -f Grasshopper/SomeCurves.sdtf
```

</summary>

```
The sdTF asset contains 1 chunks.
  Chunk name "aca94b27-19a3-43c3-a1e2-8e36faeed5d7", typeHint "rhino.curve":
    Attributes:
      "Name" => "Crv"
    Branches:
      [0,0] => 3 items
      [0,1] => 20 items
```

</details>
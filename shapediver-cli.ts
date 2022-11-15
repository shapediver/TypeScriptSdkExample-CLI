#!/usr/bin/env node_modules/.bin/ts-node

import { NotifyUsersOrganizationFilter } from "./src/ShapeDiver/PlatformBackendUtils";
import { createAndUploadModel, displayLatestModels, displayModelAccessData, displayModelInfoGeometry, displayModelInfoPlatform, displayUserCreditUsage, notifyUsersPlatform, publishModel } from "./src/ShapeDiver/Utils"

const yargs = require("yargs")

yargs(process.argv.slice(2))
    .command(
        "model-access-data",
        "Display access data for a model (identified by id, guid, or slug)",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "Model identifier (slug, id, guid)",
                        type: "string",
                        demandOption: true,
                    },
                    e: {
                        alias: "export",
                        description: "Allow exports",
                        type: 'boolean',

                    },
                    b: {
                        alias: "backend",
                        description: "Backend access (non-browser access)",
                        type: 'boolean'
                    }
                })
        },
        async (argv) => {
            await displayModelAccessData(
                argv.i as string,
                argv.e as boolean,
                argv.b as boolean   
            );
        },
    )
    .command(
        "list-latest-models",
        "Query and display latest models",
        (yargs) => {
            yargs
                .options({
                    l: {
                        alias: "limit",
                        description: "How many models to query",
                        type: 'number',
                    },
                    o: {
                        alias: "own",
                        description: "Filter models owned by the querying user",
                        type: 'boolean',
                    }
                })
        },
        async (argv) => {
            await displayLatestModels(
                argv.l ? argv.l as number : 10,
                typeof argv.o === 'boolean' ? argv.o as boolean : true,
            );
        },
    )
    .command(
        "model-info-platform",
        "Get platform backend information of a model",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "Model identifier (slug, id, guid)",
                        type: "string",
                        demandOption: true,
                    },
                })
        },
        async (argv) => {
            await displayModelInfoPlatform(
                argv.i as string,
            );
        },
    )
    .command(
        "model-info-geometry",
        "Get geometry backend information of a model",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "Model identifier (slug, id, guid)",
                        type: "string",
                        demandOption: true,
                    },
                })
        },
        async (argv) => {
            await displayModelInfoGeometry(
                argv.i as string,
            );
        },
    )
    .command(
        "upload-model",
        "Create and upload model, wait for its confirmation, publish it (private visibility)",
        (yargs) => {
            yargs
                .options({
                    f: {
                        alias: "filename",
                        description: "Filename of the model to be uploaded",
                        type: "string",
                        demandOption: true,
                    },
                    t: {
                        alias: "title",
                        description: "Title of the model",
                        type: "string",
                    },
                })
        },
        async (argv) => {
            await createAndUploadModel(
                argv.f as string,
                argv.t as string,
            );
        },
    )
    .command(
        "publish-model",
        "Publish a model whose checking process resulted in status \"pending\".",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "Model identifier (slug, id, guid)",
                        type: "string",
                        demandOption: true,
                    },
                })
        },
        async (argv) => {
            await publishModel(
                argv.i as string,
            );
        },
    )
    .command(
        "credit-usage",
        "Query per-user credit usage.",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "User identifier (slug, id, username), defaults to authenticated user",
                        type: "string",
                    },
                    d: {
                        alias: "days",
                        description: "Number of past days to query, defaults to 31",
                        type: "number",
                    },
                    f: {
                        alias: "from",
                        description: "Query from this daystimestamp (YYYYMMDD), use this instead of --days",
                        type: "string"
                    },
                    t: {
                        alias: "to",
                        description: "Query to this daystimestamp (YYYYMMDD), use this instead of --days",
                        type: "string"
                    }
                })
        },
        async (argv) => {
            await displayUserCreditUsage(
                argv.i as string,
                argv.d ? argv.d as number : 31,
                argv.f as string,
                argv.t as string,
            );
        },
    )
    .command(
        "notify-users",
        "Notify our users about updates, maintenance, etc.",
        (yargs) => 
        {
            yargs
                .options({
                    p: {
                        alias: "plan name",
                        description: "Name of subscribed chargebee plan.",
                        type: "string",
                        demandOption: true 
                    },
                    f: {
                        alias: "features",
                        description: "Features of user.  If array, concat with ','.  example: admin, exports, imports ",
                        type: "string"
                    }, 
                    o: {
                        alias: "has organization",
                        description: `If users should be in organization. Can be one of 'y', 'n' or empty. If 'y' user must be in organization.
                         If 'n' filters users without organization. Empty does nothing.`,
                        type: "string"
                    },
                    r: {
                        alias: "organization role",
                        description: `The organization role. Checks for user in organization role or in roles. If array, concat with ','.  example: owner, user `,
                        type: "string"
                    },
                    d: {
                        alias: "dry run",
                        description: "If dry run, notifactions are not sent. Just returns and prints list of users which are fetched. Use 'y' for dry run.",
                        type: "boolean"
                    },
                    h: {
                        alias: "notification href",
                        description: "Link for notification. Can be used to link release notes etc...",
                        type: "string"
                    },
                    t: {
                        alias: "notification type",
                        description: "The notification type.",
                        type: "string",
                        demandOption: true,
                    },
                    n: {
                        alias: "notification description",
                        description: "The description of a notification",
                        type: "string",
                        demandOption: true 
                    }
                
                })
        },
        async (argv) => {

            // handle features
            let features: Array<string>|string = null;
            if(argv.f && (argv.f as string).indexOf(",") > 0) {
                features = (argv.f as string).split(",");
            }
            else if(argv.f && argv.f != "") {
                features = argv.f;
            }

            // handle organization filter
            let organization_filter = NotifyUsersOrganizationFilter.NoFilter;
            if(argv.o === "y")
            {
                organization_filter = NotifyUsersOrganizationFilter.InOrganization;
            }
            else if(argv.o === "n")
            {
                organization_filter = NotifyUsersOrganizationFilter.NotInOrganization;
            }

            // handle organization roles
            let organization_roles : Array<string>|string = null;
            if(argv.r && (argv.r as string).indexOf(",") > 0)
            {
                organization_roles = (argv.r as string).split(",");
            }
            else if(argv.r && argv.r != "")
            {
                organization_roles = argv.r;
            }

            // handle dry run
            let dry_run = false;
            if(argv.d === "y"){
                dry_run = true;
            }

            await notifyUsersPlatform({
                subscribed_plan_name: argv.p,
                features_of_user: features,
                organization_filter,
                organization_roles,
                dry_run
            }, {
                href: argv.h,
                type: argv.t,
                description: argv.n
            });
        },
        
        )
    .command(
        "*",
        "",
        () => {
            console.log('');
            console.log('Examples:');
            console.log('');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER"       - Get embedding access data for model (IDENTIFIER = slug, id, guid)');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER -b"    - Get backend access data for model ');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER -b -e" - Get backend access data for model, allowing exports');
            console.log('');
            console.log('"shapediver-cli.ts list-latest-models"                    - List 10 latest models owned by the user');
            console.log('"shapediver-cli.ts list-latest-models --own false"        - List 10 latest models which the user has access to');
            console.log('"shapediver-cli.ts list-latest-models --limit 3"          - List 3 latest models howned by the user');
            console.log('');
            console.log('"shapediver-cli.ts model-info-platform -i IDENTIFIER"     - Get platform backend information of a model (user, basic properties, domains, tags, decoration)');
            console.log('"shapediver-cli.ts model-info-geometry -i IDENTIFIER"     - Get geometry backend information of a model (parameters, outputs, exports)');
            console.log('');
            console.log('"shapediver-cli.ts upload-model -f FILENAME -t TITLE"     - Create and upload model, wait for checking process, publish model (private visibility)');
            console.log('"shapediver-cli.ts publish-model -i IDENTIFIER"           - Publish a model whose checking process resulted in status "pending"');
            console.log('');
            console.log('"shapediver-cli.ts credit-usage"                          - Query credit usage for the past 31 days');
            console.log('"shapediver-cli.ts credit-usage -d 90"                    - Query credit usage for the past 90 days');
            console.log('"shapediver-cli.ts credit-usage --from 20220901 --to 20220930"');
            console.log('                                                          - Query credit usage from 20220901 to 20220930');
            console.log('');
            console.log('"shapediver-cli.ts notify-users -p pro -dn description"   - Send notifications to users');
            console.log('"shapediver-cli.ts notify-users -p pro -f admin,exports');
            console.log('                                -o y -r admin,owner -d y');
            console.log('                                -n description -t maintenance"');
            console.log('                                                          - Send notification to to users with all filters filled the parameters.');
            console.log('');
        }
    )
    .argv

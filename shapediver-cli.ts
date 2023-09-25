#!/usr/bin/env node_modules/.bin/ts-node

import { NotifyUsersOrganizationFilter } from "./src/ShapeDiver/PlatformBackendUtils";
import { 
    createAndUploadModel, 
    displayLatestModels, 
    displayModelAccessData, 
    displayModelInfoGeometry, 
    displayModelInfoPlatform, 
    displayModelsByModelViewUrl, 
    displayUserCreditUsage, 
    fetchModelAnalytics, 
    notifyUsersAboutDecommissioning, 
    notifyUsersPlatform, 
    publishModel, 
    sdTFExample, 
    sdTFParse
} from "./src/ShapeDiver/Utils"

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
        "list-models-by-backend",
        "Query models by backend system and export them",
        (yargs) => {
            yargs
                .options({
                    m: {
                        alias: "model-view-url",
                        description: "The model view URL to search models by",
                        type: 'string',
                        demandOption: true,
                    },
                    j: {
                        alias: "filename",
                        description: "The filename to export to (json)",
                        type: 'string',
                    }
                })
        },
        async (argv) => {
            await displayModelsByModelViewUrl(
                argv.m,
                argv.j
            );
        },
    )
    .command(
        "fetch-model-analytics",
        "Fetch analytics for previously exported models",
        (yargs) => {
            yargs
                .options({
                    f: {
                        alias: "timestamp-from",
                        description: "Timestamp in format YYYY or YYYYMM or YYYYMMDD or YYYYMMDDhh",
                        type: 'string',
                        demandOption: true,
                    },
                    t: {
                        alias: "timestamp-to",
                        description: "Timestamp in format YYYY or YYYYMM or YYYYMMDD or YYYYMMDDhh",
                        type: 'string',
                        demandOption: true,
                    },
                    j: {
                        alias: "filename",
                        description: "The filename to read and write to (json)",
                        type: 'string',
                    }
                })
        },
        async (argv) => {
            await fetchModelAnalytics(
                argv.f, 
                argv.t,
                argv.j
            );
        },
    )
    .command(
        "notify-of-decommissioning",
        "Notify users about decommissioning of models",
        (yargs) => {
            yargs
                .options({
                    j: {
                        alias: "filename",
                        description: "The filename to read and write to (json)",
                        type: 'string',
                    }
                })
        },
        async (argv) => {
            await notifyUsersAboutDecommissioning(
                argv.j
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
        "sdtf-example",
        "Run a computation of a model which has sdTF inputs and outputs.",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "Model identifier (slug, id, guid)",
                        type: "string",
                        demandOption: true,
                    },
                    f: {
                        alias: "filename",
                        description: "Path to the sdTF file to be used",
                        type: "string",
                    },
                    s: {
                        alias: "save",
                        description: "Save the resulting sdTF files",
                        type: "boolean",
                    },
                })
        },
        async (argv) => {
            await sdTFExample(
                argv.i as string,
                argv.f as string,
                typeof argv.s === 'boolean' ? argv.s as boolean : false,
            );
        },
    )
    .command(
        "parse-sdtf",
        "Parse an sdTF file and prints some information about the contents.",
        (yargs) => {
            yargs
                .options({
                    f: {
                        alias: "filename",
                        description: "Path to the sdTF file to be parsed",
                        type: "string",
                        demandOption: true,
                    },
                })
        },
        async (argv) => {
            await sdTFParse(
                argv.f as string,
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
                        alias: "plan-name",
                        description: "Name of subscribed chargebee plan (query using LIKE operator).",
                        type: "string",
                    },
                    pe: {
                        alias: "plan-name-exact",
                        description: "Exact name of subscribed chargebee plan.",
                        type: "string",
                    },
                    f: {
                        alias: "features-true",
                        description: "Filters user based on features of a user. Check where individual feature is true. If array, concat with ','.  example: admin,exports,imports ",
                        type: "string"
                    }, 
                    n: {
                        alias: "features-false",
                        description: "Filters user based on features of a user. Check where individual feature is false. If array, concat with ','.  example: admin,exports,imports ",
                        type: "string"
                    }, 
                    o: {
                        alias: "has-organization",
                        description: `If users should be in organization. Can be one of 'y', 'n' or empty. If 'y' user must be in organization.
                         If 'n' filters users without organization. Empty does nothing.`,
                        type: "string"
                    },
                    r: {
                        alias: "organization-role",
                        description: `The organization role. Checks for user in organization role or in roles. If array, concat with ','.  example: owner,user `,
                        type: "string"
                    },
                    dryrun: {
                        alias: "dry-run",
                        description: "If true (default), notifactions are not created. Just returns and prints list of users which are fetched.",
                        type: "boolean"
                    },
                    h: {
                        alias: "href",
                        description: "Link to add to the notification. Can be used to link release notes etc.",
                        type: "string"
                    },
                    t: {
                        alias: "type",
                        description: "The notification type.",
                        type: "string",
                        demandOption: true,
                    },
                    d: {
                        alias: "description",
                        description: "The description of the notification.",
                        type: "string",
                        demandOption: true 
                    },
                    offset: {
                        alias: "offset",
                        description: `Offset to start querying users at.`,
                        type: "string"
                    }
                })
        },
        async (argv) => {

            // handle features
            let features_true: Array<string>|string = null;
            if(argv.f && (argv.f as string).indexOf(",") > 0) {
                features_true = (argv.f as string).split(",");
            }
            else if(argv.f && argv.f != "") {
                features_true = argv.f;
            }

            let features_false: Array<string>|string = null;
            if(argv.n && (argv.n as string).indexOf(",") > 0) {
                features_false = (argv.n as string).split(",");
            }
            else if(argv.n && argv.n != "") {
                features_false = argv.n;
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
            const dry_run = typeof argv.dryrun === 'boolean' ? argv.dryrun as boolean : (argv.dryrun === 'false' ? false : true);

            await notifyUsersPlatform({
                subscribed_plan_name: argv.p,
                subscribed_plan_name_exact: argv.pe,
                features_of_user_true_value: features_true,
                features_of_user_false_value: features_false,
                organization_filter,
                organization_roles,
                dry_run,
                offset: argv.offset
            }, {
                href: argv.h,
                type: argv.t,
                description: argv.d
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
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER"       - Get embedding access data for model (IDENTIFIER = slug, id, guid).');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER -b"    - Get backend access data for model.');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER -b -e" - Get backend access data for model, allowing exports.');
            console.log('');
            console.log('"shapediver-cli.ts list-latest-models"                    - List 10 latest models owned by the user.');
            console.log('"shapediver-cli.ts list-latest-models --own false"        - List 10 latest models which the user has access to.');
            console.log('"shapediver-cli.ts list-latest-models --limit 3"          - List 3 latest models howned by the user.');
            console.log('');
            console.log('"shapediver-cli.ts model-info-platform -i IDENTIFIER"     - Get platform backend information of a model (user, basic properties, domains, tags, decoration).');
            console.log('"shapediver-cli.ts model-info-geometry -i IDENTIFIER"     - Get geometry backend information of a model (parameters, outputs, exports).');
            console.log('');
            console.log('"shapediver-cli.ts upload-model -f FILENAME -t TITLE"     - Create and upload model, wait for checking process, publish model (private visibility).');
            console.log('"shapediver-cli.ts publish-model -i IDENTIFIER"           - Publish a model whose checking process resulted in status "pending".');
            console.log('');
            console.log('"shapediver-cli.ts credit-usage"                          - Query credit usage for the past 31 days.');
            console.log('"shapediver-cli.ts credit-usage -d 90"                    - Query credit usage for the past 90 days.');
            console.log('"shapediver-cli.ts credit-usage --from 20220901 --to 20220930"');
            console.log('');
            console.log('"shapediver-cli.ts sdtf-example -i IDENTIFIER"            - Run a computation of a model which has sdTF inputs and outputs.');
            console.log('"shapediver-cli.ts sdtf-example -i IDENTIFIER -f SDTF_FILE"');
            console.log('                                                          - Use given sdTF file as input data.');
            console.log('"shapediver-cli.ts sdtf-example -i IDENTIFIER -s"         - Save the resulting sdTF files.');
            console.log('');
            console.log('"shapediver-cli.ts parse-sdtf -f SDTF_FILE"               - Parse an sdTF file and prints some information about the contents');
            console.log('');
            console.log('"shapediver-cli.ts notify-users"                          - Send notifications to users according to the specified filter criteria.');
            console.log('                                                              The creator of the notification will be set to "platform".');
            console.log('                                                              The class of the notification will be set to "account".');
            console.log('                                                              The level of the notification will be set to "info".');
            console.log('                                -d DESCRIPTION            - Description to use for notification.');
            console.log('                                -t TYPE                   - Type of notification. Typical types are:');
            console.log('                                                              "viewer-update"');
            console.log('                                                              "platform-frontend-update"');
            console.log('                                                              "platform-backend-update"');
            console.log('                                                              "geometry-backend-update"');
            console.log('                                                              "plugin-update"');
            console.log('                                                              "generic-update"');
            console.log('                                                              "maintenance"');
            console.log('                                -h URL                    - Optional URL to add to notification.');
            console.log('                                -p PLAN_NAME              - Search users by name of the plan they are subscribed to, case sensitive!');
            console.log('                                -o \'y\' or \'n\'             - Search users which are (are not) members of an org.');
            console.log('                                -f FEATURES               - Search users by features.');
            console.log('                                -n FEATURES               - Search users by features which they do not have.');
            console.log('                                --dryrun false            - Used to disable dry run mode.');
            console.log('                                --offset OFFSET           - Offset to start querying users at.');
            console.log('');
            console.log('  Example: Notify all organization admins and owners:');
            console.log('    "./shapediver-cli.ts notify-users -t TYPE -d DESCRIPTION -o y -r owner,admin"');
            console.log('');
            console.log('  Example: Notify all users subscribed to plans called "%Business%":');
            console.log('    "./shapediver-cli.ts notify-users -t TYPE -d DESCRIPTION -o n -p Business"');
            console.log('');
        }
    )
    .argv

#!/usr/bin/env node_modules/.bin/ts-node

import { displayLatestModels, displayModelAccessData, displayModelInfoGeometry, displayModelInfoPlatform } from "./src/ShapeDiver/Utils"

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
        "*",
        "",
        () => {
            console.log('');
            console.log('Examples:');
            console.log('');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER"        - get embedding access data for model (IDENTIFIER = slug, id, guid)');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER -b"     - get backend access data for model ');
            console.log('"shapediver-cli.ts model-access-data -i IDENTIFIER -b -e"  - get backend access data for model, allowing exports');
            console.log('');
            console.log('"shapediver-cli.ts list-latest-models"                   - list 10 latest models owned by the user');
            console.log('"shapediver-cli.ts list-latest-models --own false"       - list 10 latest models which the user has access to');
            console.log('"shapediver-cli.ts list-latest-models --limit 3"         - list 3 latest models howned by the user');
            console.log('');
            console.log('"shapediver-cli.ts model-info-platform -i IDENTIFIER"     - get platform backend information of a model (user, basic properties, domains, tags, decoration)');
            console.log('"shapediver-cli.ts model-info-geometry -i IDENTIFIER"     - get geometry backend information of a model (parameters, outputs, exports)');
            console.log('');
        }
    )
    .argv

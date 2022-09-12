import { displayModelAccessData } from "../ShapeDiver/Utils"

const yargs = require("yargs")

yargs(process.argv.slice(2))
    .command(
        "get-access-data",
        "Get and display access data for a model (identified by id, guid, or slug)",
        (yargs) => {
            yargs
                .options({
                    i: {
                        alias: "id",
                        description: "Model identifier",
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
                        description: "Backend access",
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
        "*",
        "",
        () => {
            console.log('Examples:');
            console.log('"npm run cli -- get-access-data -i IDENTIFIER"        - get embedding access data for model (IDENTIFIER = slug, id, guid)');
            console.log('"npm run cli -- get-access-data -i IDENTIFIER -b"     - get backend access data for model ');
            console.log('"npm run cli -- get-access-data -i IDENTIFIER -b -e"  - get backend access data for model, allowing exports');
        }
    )
    .argv

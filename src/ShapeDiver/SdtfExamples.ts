import { 
    ShapeDiverResponseOutput
} from "@shapediver/sdk.geometry-api-sdk-v2";
import { 
    //SdtfRhino3dmTypeGuard, 
    SdtfRhino3dmTypeIntegration 
} from "@shapediver/sdk.sdtf-rhino3dm";
import { 
    create as createSdtfSdk, SdtfRhinoTypeHintName 
} from "@shapediver/sdk.sdtf-v1";
import { RhinoModule } from "rhino3dm";
import { ISessionData } from "./GeometryBackendUtils";

/**
 * Create a sample sdTF which contains two chunks of data.
 * A chunk called "Text" which contains a tree of strings (two branches). 
 * A chunk called "Curve" which contains a single curve. 
 * @returns 
 */
export const makeExampleSdtf = async () : Promise<ArrayBuffer> => {
    
    // create an instance of the sdTF SDK, also using the Rhino3dm integration
    const sdk = await createSdtfSdk({
        integrations: [ new SdtfRhino3dmTypeIntegration() ]
    });
    const constructor = sdk.createConstructor();
    const factory = constructor.getFactory();
    const builder = constructor.getWriter().createGrasshopperSdtfBuilder();
    
    //// Step 1
    //// Create a chunk which represents a Grasshopper tree of strings ("Text" in terms of Grasshopper).

    const typeHintForStrings = "string";
    // Create two branches that hold the data - all of the same type.
    // Note that branches must consist of as many sub-lists as `paths.`
    const branches1 = [
        [
            // Creating two data items, both storing their content directly in the sdTF JSON content object
            factory.createDataItem("foo", typeHintForStrings),
            factory.createDataItem("bar", typeHintForStrings),
        ],
        [
            // Creating a data item that stores the content directly in the sdTF JSON content object
            factory.createDataItem("baz", typeHintForStrings),
        ],
    ];
    
    // Create two paths, one for each branch.
    // Note: "[ 0, 0 ]" is the name of the first branch, "[ 0, 1 ]" is the name of the seconds branch.
    const paths1 = [
        [ 0, 0 ],
        [ 0, 1 ],
    ];
    
    // Add a chunk called "Text" to the sdTF asset builder.
    // We name it "Text" because this is the default name of Grasshopper text paramater components. 
    // You could choose any name you like. 
    builder.addChunkForTreeData("Text", { branches: branches1, paths: paths1 });
    
    //// Step 2
    //// Create a chunk which represents a Grasshopper tree of polylines.
    const rhino: RhinoModule = await require("rhino3dm")();

    // use rhino3dm.js and create a tree called "Curve" as shown above.
    const polyline = new rhino.PolylineCurve();
    polyline.setPoint(0, [0.1, 0.2, 0.3]);
    polyline.setPoint(0, [0.4, 0.6, 0.8]);
    polyline.setPoint(0, [0.5, 0.7, 0.9]);

    const branches2 = [
        [
            factory.createDataItem(polyline, SdtfRhinoTypeHintName.RHINO_POLYLINE_CURVE )
        ]
    ];
    const paths2 = [
        [ 0 ]
    ];
    builder.addChunkForTreeData("Curve", { branches: branches2, paths: paths2 });

    //// Final step
    
    // Create the asset
    const asset = builder.build();
    
    // Creates a new sdTF file from the writeable-asset
    const sdtf = constructor.createBinarySdtf(asset);
    
    return sdtf;
}



/**
 * Run a customization and return all outputs.
 * @param session Session data as returned from initSession
 * @param parameters Parameter values to use, default values will be used for parameters not specified
 * @param maxWaitMsec Maximum duration to wait for result (in milliseconds), pass value < 0 to disable limit.
 *                    A ShapeDiverError will be thrown in case max_wait_time is exceeded.
 */
 export const runCustomizationUsingSdtf = async (session: ISessionData, parameters: {[paramId: string]: string}, maxWaitMsec: number = -1) : Promise<{[outputId: string]: ShapeDiverResponseOutput}> => {

    const {sdk, dto} = session;

    const result = await sdk.utils.submitAndWaitForCustomization(sdk, dto.sessionId, parameters, maxWaitMsec);

    return (result.outputs as {[outputId: string]: ShapeDiverResponseOutput});
}

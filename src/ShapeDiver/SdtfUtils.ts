import { 
    //SdtfRhino3dmTypeGuard, 
    SdtfRhino3dmTypeIntegration 
} from "@shapediver/sdk.sdtf-rhino3dm";
import { 
    create as createSdtfSdk, SdtfRhinoTypeHintName 
} from "@shapediver/sdk.sdtf-v1";
import { RhinoModule } from "rhino3dm";

/**
 * Create a sample sdTF which contains two chunks of data.
 * A chunk called "Text" which contains a tree of strings (two branches). 
 * A chunk called "Curve" which contains a list of curves. 
 * A chunk called "Point" which contains a list of points. 
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
 
    const rhino: RhinoModule = await require("rhino3dm")();

    {
        //// Step 1
        //// Create a chunk which represents a Grasshopper tree of strings ("Text" in terms of Grasshopper).

        const typeHintForStrings = "string";
        // Create two branches that hold the data - all of the same type.
        // Note that branches must consist of as many sub-lists as `paths.`
        const branches = [
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
        const paths = [
            [ 0, 0 ],
            [ 0, 1 ],
        ];
        
        // Add a chunk called "Text" to the sdTF asset builder.
        // We name it "Text" because this is the default name of Grasshopper text paramater components. 
        // You could choose any name you like. 
        builder.addChunkForTreeData("Text", { branches: branches, paths: paths });
    }
    
    {
        //// Step 2
        //// Create a chunk which represents a Grasshopper tree of polylines.
    
        // use rhino3dm.js and create a tree called "Curve" as shown above.
        
        // create some polyline curve
        const polyline = new rhino.Polyline(3);
        polyline.add(0.1, 0.2, 0.3);
        polyline.add(0.4, 0.6, 0.8);
        polyline.add(0.5, 0.7, 0.9);
        const polylineCurve = polyline.toPolylineCurve();

        // create a second polyline curve
        const polylineCurve2 = polylineCurve.duplicate();
        // @ts-ignore
        polylineCurve2.transform(rhino.Transform.translation(1, 0, 0));

        const branches = [
            [
                factory.createDataItem(polylineCurve, SdtfRhinoTypeHintName.RHINO_POLYLINE_CURVE ),
                factory.createDataItem(polylineCurve2, SdtfRhinoTypeHintName.RHINO_POLYLINE_CURVE )
            ]
        ];
        const paths = [
            [ 0 ]
        ];
        builder.addChunkForTreeData("Curve", { branches: branches, paths: paths });
    }

    {
        //// Step 3
        //// Create a chunk which represents a Grasshopper tree of points.
    
        // use rhino3dm.js and create a tree called "Point".
       
        const branches = [
            [
                factory.createDataItem(new rhino.Point([0.1, 0.2, 0.3]), SdtfRhinoTypeHintName.RHINO_POINT ),
                factory.createDataItem(new rhino.Point([0.4, 0.6, 0.8]), SdtfRhinoTypeHintName.RHINO_POINT ),
                factory.createDataItem(new rhino.Point([0.5, 0.7, 0.9]), SdtfRhinoTypeHintName.RHINO_POINT ),
            ]
        ];
        const paths = [
            [ 0 ]
        ];
        builder.addChunkForTreeData("Point", { branches: branches, paths: paths });
    }

    //// Final step
    
    // Create the asset
    const asset = builder.build();
    
    // Creates a new sdTF file from the writeable-asset
    const sdtf = constructor.createBinarySdtf(asset);
    
    return sdtf;
}

/**
 * Parses and sdTF asset and prints basic information about the asset's contents.
 * @param buffer 
 */
export const parseSdtf = async (buffer: ArrayBuffer | string) : Promise<void> => {
    // create an instance of the sdTF SDK, also using the Rhino3dm integration
    const sdk = await createSdtfSdk({
        integrations: [ new SdtfRhino3dmTypeIntegration() ]
    });
    const parser = await sdk.createParser();
    const asset = ((buffer as string).padStart) 
        ? await parser.readFromFile(buffer as string) 
        :  parser.readFromBuffer(buffer as ArrayBuffer);

    console.log(`The sdTF asset contains ${asset.chunks.length} chunks.`);

    for (const chunk of asset.chunks) {

        console.log(`  Chunk name ${chunk.name}, typeHint ${chunk.typeHint.name}:`);

        if (Object.keys(chunk.attributes.entries).length > 0) {
            console.log(`    Attributes:`);
            for (const key in chunk.attributes.entries) {
                const value = await chunk.attributes.entries[key].getContent();
                console.log(`      ${key} => ${value}`);
            }
        }

        // Below here we are assuming that the sdTF represents Grasshopper trees
        if (chunk.nodes.length > 0) {
            console.log(`    Branches:`);
            for (const node of chunk.nodes) {
                console.log(`      ${node.name} => ${node.items.length} items`);
            }
        }

    }
}


import { 
    SdtfRhino3dmSingleton,
    //SdtfRhino3dmTypeGuard, 
    SdtfRhino3dmTypeIntegration 
} from "@shapediver/sdk.sdtf-rhino3dm";
import { 
    create as createSdtfSdk, 
    ISdtfReadableAsset, 
    ISdtfReadableChunk, 
    SdtfPrimitiveTypeHintName, 
    SdtfRhinoTypeHintName,
    SdtfTypeHintName,
} from "@shapediver/sdk.sdtf-v1";
import {
    SdtfGeometryPoint3d
} from "@shapediver/sdk.sdtf-geometry";

/**
 * Create a sample sdTF which contains some chunks of data.
 * A chunk called "String" which contains a tree of strings (two branches). 
 * A chunk called "Curve" which contains a list of curves (one branch). 
 * A chunk called "Point" which contains a list of points (one branch). 
 * @param chunkTypes 
 * @returns 
 */
export const makeExampleSdtf = async (chunkTypes: Array<SdtfTypeHintName>) : Promise<ArrayBuffer> => {
    
    // create an instance of the sdTF SDK, also using the Rhino3dm integration
    const sdk = await createSdtfSdk({
        integrations: [ new SdtfRhino3dmTypeIntegration({enableCompression: false}) ]
    });
    const constructor = sdk.createConstructor();
    const factory = constructor.getFactory();
    const builder = constructor.getWriter().createGrasshopperSdtfBuilder();
 
    // it is important to use the same instance of rhino3dm which is used by the 3dm integration
    const rhino = SdtfRhino3dmSingleton.getInstance();

    if (chunkTypes.includes(SdtfTypeHintName.STRING)) {
        //// Step 1
        //// Create a chunk which represents a Grasshopper tree of strings ("String" in terms of Grasshopper).

        // Create two branches that hold the data - all of the same type.
        // Note that branches must consist of as many sub-lists as `paths.`
        const branches = [
            [
                // Creating two data items, both storing their content directly in the sdTF JSON content object
                factory.createDataItem("foo", SdtfPrimitiveTypeHintName.STRING),
                factory.createDataItem("bar", SdtfPrimitiveTypeHintName.STRING),
            ],
            [
                // Creating a data item that stores the content directly in the sdTF JSON content object
                factory.createDataItem("baz", SdtfPrimitiveTypeHintName.STRING),
            ],
        ];
        
        // Create two paths, one for each branch.
        // Note: "[ 0, 0 ]" is the name of the first branch, "[ 0, 1 ]" is the name of the seconds branch.
        const paths = [
            [ 0, 0 ],
            [ 0, 1 ],
        ];
        
        // Add a chunk called "String" to the sdTF asset builder.
        // We name it "String" because this is the default name of Grasshopper text paramater components. 
        // You could choose any name you like. 
        builder.addChunkForTreeData("String", { branches: branches, paths: paths }, factory.createAttributes({'Name': ['Text', SdtfPrimitiveTypeHintName.STRING]}));
    }
    
    if (chunkTypes.includes(SdtfTypeHintName.RHINO_CURVE)) {
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
                factory.createDataItem(polylineCurve, SdtfRhinoTypeHintName.RHINO_CURVE ),
                factory.createDataItem(polylineCurve2, SdtfRhinoTypeHintName.RHINO_CURVE )
            ]
        ];
        const paths = [
            [ 0 ]
        ];
        builder.addChunkForTreeData("Curve", { branches: branches, paths: paths }, factory.createAttributes({'Name': ['Crv', SdtfPrimitiveTypeHintName.STRING]}));
    }

    if (chunkTypes.includes(SdtfTypeHintName.RHINO_POINT)) {
        //// Step 3
        //// Create a chunk which represents a Grasshopper tree of points.
    
        const pt1: SdtfGeometryPoint3d = [0.1, 0.2, 0.3];
        const pt2: SdtfGeometryPoint3d = [0.4, 0.6, 0.8];
        const pt3: SdtfGeometryPoint3d = [0.5, 0.7, 0.9];
       
        const branches = [
            [
                factory.createDataItem(pt1, SdtfRhinoTypeHintName.RHINO_POINT ),
                factory.createDataItem(pt2, SdtfRhinoTypeHintName.RHINO_POINT ),
                factory.createDataItem(pt3, SdtfRhinoTypeHintName.RHINO_POINT ),
            ]
        ];
        const paths = [
            [ 0 ]
        ];
        builder.addChunkForTreeData("Point", { branches: branches, paths: paths }, factory.createAttributes({'Name': ['Pt', SdtfPrimitiveTypeHintName.STRING]}));
    }

    //// Final step
    
    // Create the asset
    const asset = builder.build();
    
    // Creates a new sdTF file from the writeable-asset
    const sdtf = constructor.createBinarySdtf(asset);
    
    return sdtf;
}

/**
 * Read an sdTF asset and return it.
 * @param buffer 
 */
 export const readSdtf = async (buffer: ArrayBuffer | string, authToken?: string) : Promise<ISdtfReadableAsset> => {
    // create an instance of the sdTF SDK, also using the Rhino3dm integration
    const sdk = await createSdtfSdk({
        integrations: [ new SdtfRhino3dmTypeIntegration() ],
        authToken
    });
    const parser = await sdk.createParser();
    let asset: ISdtfReadableAsset;
    if ((buffer as string).padStart) {
        const str: string = buffer as string;
        if (str.startsWith('http'))
            asset = await parser.readFromUrl(str);
        else 
            asset = await parser.readFromFile(buffer as string) 
    } else {
        asset = parser.readFromBuffer(buffer as ArrayBuffer);
    }

    return asset;
}

/**
 * Parses and sdTF asset and prints basic information about the asset's contents.
 * @param buffer 
 */
export const parseSdtf = async (buffer: ArrayBuffer | string, authToken?: string) : Promise<void> => {
    const asset = await readSdtf(buffer, authToken);
    printSdtfInfo(asset);
}

/**
 * Prints basic information about the asset's contents.
 * @param asset 
 */
export const printSdtfInfo = async (asset: ISdtfReadableAsset) : Promise<void> => {
    console.log(`The sdTF asset contains ${asset.chunks.length} chunks.`);

    for (const chunk of asset.chunks) {

        console.log(`  Chunk name "${chunk.name}", typeHint "${chunk.typeHint ? chunk.typeHint.name : 'unknown'}":`);

        if (Object.keys(chunk.attributes.entries).length > 0) {
            console.log(`    Attributes:`);
            for (const key in chunk.attributes.entries) {
                const value = await chunk.attributes.entries[key].getContent();
                console.log(`      "${key}" => "${value}"`);
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

/**
 * Given a chunk try to get the chunk's "friendly" name from its attributes.
 * Returns undefined if no such name was found.
 * @param chunk 
 */
export const getChunkNameFromAttributes = async (chunk: ISdtfReadableChunk): Promise<string | undefined> => {
    if (chunk.attributes) {
        const key = Object.keys(chunk.attributes.entries).find(k => 
            k.toLowerCase() === 'name' 
            && chunk.attributes.entries[k].typeHint?.name === 'string'
        );
        if (key) {
            return await chunk.attributes.entries[key].getContent() as string;
        }
    }
}

/**
 * Map from sdTF typeHint to parameter type.
 * Returns an empty string in case no matching parameter type could be found.
 */
export const mapSdtfTypeHintToParameterType = (typeHint: SdtfTypeHintName): string => {
    switch (typeHint) {
        case SdtfTypeHintName.BOOLEAN: 
            return 'sBool';
        case SdtfTypeHintName.COLOR:
            return 'sColor';
        case SdtfTypeHintName.DOUBLE:
            return 'sNumber';
        case SdtfTypeHintName.INT32:
            return 'sInteger';
        case SdtfTypeHintName.GEOMETRY_BOX: 
            return 'sBox';
        case SdtfTypeHintName.GEOMETRY_CIRCLE: 
            return 'sCircle';
        case SdtfTypeHintName.GEOMETRY_INTERVAL: 
            return 'sDomain';
        case SdtfTypeHintName.GEOMETRY_INTERVAL2: 
            return 'sDomain2D';
        case SdtfTypeHintName.GEOMETRY_LINE: 
            return 'sLine';
        case SdtfTypeHintName.GEOMETRY_PLANE: 
            return 'sPlane';
        case SdtfTypeHintName.GEOMETRY_POINT: 
            return 'sPoint';
        case SdtfTypeHintName.GEOMETRY_RECTANGLE: 
            return 'sRectangle';
        case SdtfTypeHintName.GEOMETRY_VECTOR: 
            return 'sVector';
        case SdtfTypeHintName.IMAGE: 
            return 'sBitmap';
        case SdtfTypeHintName.RHINO_BREP: 
            return 'sBrep';
        case SdtfTypeHintName.RHINO_CURVE: 
            return 'sCurve';
        case SdtfTypeHintName.RHINO_MESH: 
            return 'sMesh';
        case SdtfTypeHintName.RHINO_SUBD: 
            return 'sSubdiv';
        case SdtfTypeHintName.RHINO_SURFACE: 
            return 'sSurface';
        case SdtfTypeHintName.STRING: 
            return 'sString';
        default: 
            return '';
    }
}

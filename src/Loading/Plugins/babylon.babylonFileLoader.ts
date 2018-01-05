module BABYLON.Internals {

    var logOperation = (operation: string, producer: {file: string, name: string, version: string, exporter_version: string}) => {
        return operation + " of " + (producer ? producer.file + " from " + producer.name + " version: " + producer.version + ", exporter version: " + producer.exporter_version : "unknown");
    }

    SceneLoader.RegisterPlugin({
        name: "babylon.js",
        extensions: ".babylon",
        canDirectLoad: (data: string) => {
            if (data.indexOf("babylon") !== -1) { // We consider that the producer string is filled
                return true;
            }

            return false;
        },
        loadAssets: (scene: Scene, data: string, rootUrl: string, onError?: (message: string, exception?: any) => void): SceneAssetContainer =>{
            var container = new SceneAssetContainer(scene);

            // Entire method running in try block, so ALWAYS logs as far as it got, only actually writes details
            // when SceneLoader.debugLogging = true (default), or exception encountered.
            // Everything stored in var log instead of writing separate lines to support only writing in exception,
            // and avoid problems with multiple concurrent .babylon loads.
            var log = "importScene has failed JSON parse";
            try {
                var parsedData = JSON.parse(data);
                log = "";
                var fullDetails = SceneLoader.loggingLevel === SceneLoader.DETAILED_LOGGING;

                // Scene
                if (parsedData.useDelayedTextureLoading !== undefined && parsedData.useDelayedTextureLoading !== null) {
                    container.useDelayedTextureLoading = parsedData.useDelayedTextureLoading && !BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental;
                }
                if (parsedData.autoClear !== undefined && parsedData.autoClear !== null) {
                    container.autoClear = parsedData.autoClear;
                }
                if (parsedData.clearColor !== undefined && parsedData.clearColor !== null) {
                    container.clearColor = BABYLON.Color4.FromArray(parsedData.clearColor);
                }
                if (parsedData.ambientColor !== undefined && parsedData.ambientColor !== null) {
                    container.ambientColor = BABYLON.Color3.FromArray(parsedData.ambientColor);
                }
                if (parsedData.gravity !== undefined && parsedData.gravity !== null) {
                    container.gravity = BABYLON.Vector3.FromArray(parsedData.gravity);
                }

                // Fog
                if (parsedData.fogMode && parsedData.fogMode !== 0) {
                    container.fogMode = parsedData.fogMode;
                    container.fogColor = BABYLON.Color3.FromArray(parsedData.fogColor);
                    container.fogStart = parsedData.fogStart;
                    container.fogEnd = parsedData.fogEnd;
                    container.fogDensity = parsedData.fogDensity;
                    log += "\tFog mode for scene:  ";
                    switch (container.fogMode) {
                        // getters not compiling, so using hardcoded
                        case 1: log += "exp\n"; break;
                        case 2: log += "exp2\n"; break;
                        case 3: log += "linear\n"; break;
                    }
                }

                //Physics
                if (parsedData.physicsEnabled) {
                    container.physicsGravity = parsedData.physicsGravity ? BABYLON.Vector3.FromArray(parsedData.physicsGravity) : null;
                    container.physicsPluginName = parsedData.physicsEngine;
                }

                // Metadata
                if (parsedData.metadata !== undefined && parsedData.metadata !== null) {
                    container.metadata = parsedData.metadata;
                }

                //collisions, if defined. otherwise, default is true
                if (parsedData.collisionsEnabled !== undefined && parsedData.collisionsEnabled !== null) {
                    container.collisionsEnabled = parsedData.collisionsEnabled;
                }
                container.workerCollisions = !!parsedData.workerCollisions;

                var index: number;
                var cache: number;
                // Lights
                if (parsedData.lights !== undefined && parsedData.lights !== null) {
                    for (index = 0, cache = parsedData.lights.length; index < cache; index++) {
                        var parsedLight = parsedData.lights[index];
                        var light = Light.Parse(parsedLight, scene);
                        if (light) {
                            container.lights.push(light);
                            log += (index === 0 ? "\n\tLights:" : "");
                            log += "\n\t\t" + light.toString(fullDetails);
                        }
                    }
                }

                // Animations
                if (parsedData.animations !== undefined && parsedData.animations !== null) {
                    for (index = 0, cache = parsedData.animations.length; index < cache; index++) {
                        var parsedAnimation = parsedData.animations[index];
                        var animation = Animation.Parse(parsedAnimation);
                        scene.animations.push(animation);
                        container.animations.push(animation);
                        log += (index === 0 ? "\n\tAnimations:" : "");
                        log += "\n\t\t" + animation.toString(fullDetails);
                    }
                }

                if (parsedData.autoAnimate) {
                    container.autoAnimate = parsedData.autoAnimate;
                    container.autoAnimateFrom =  parsedData.autoAnimateFrom; 
                    container.autoAnimateTo =  parsedData.autoAnimateTo; 
                    container.autoAnimateLoop =  parsedData.autoAnimateLoop; 
                    container.autoAnimateSpeed =  parsedData.autoAnimateSpeed || 1.0;
                }

                // Materials
                if (parsedData.materials !== undefined && parsedData.materials !== null) {
                    for (index = 0, cache = parsedData.materials.length; index < cache; index++) {
                        var parsedMaterial = parsedData.materials[index];
                        var mat = Material.Parse(parsedMaterial, scene, rootUrl);
                        container.materials.push(mat);
                        log += (index === 0 ? "\n\tMaterials:" : "");
                        log += "\n\t\t" + mat.toString(fullDetails);
                    }
                }

                if (parsedData.multiMaterials !== undefined && parsedData.multiMaterials !== null) {
                    for (index = 0, cache = parsedData.multiMaterials.length; index < cache; index++) {
                        var parsedMultiMaterial = parsedData.multiMaterials[index];
                        var mmat = Material.ParseMultiMaterial(parsedMultiMaterial, scene);
                        container.multiMaterials.push(mmat);
                        log += (index === 0 ? "\n\tMultiMaterials:" : "");
                        log += "\n\t\t" + mmat.toString(fullDetails);
                    }
                }

                // Morph targets
                if (parsedData.morphTargetManagers !== undefined && parsedData.morphTargetManagers !== null) {
                    for (var managerData of parsedData.morphTargetManagers) {
                        container.morphTargetManagers.push(MorphTargetManager.Parse(managerData, scene));
                    }
                }

                // Skeletons
                if (parsedData.skeletons !== undefined && parsedData.skeletons !== null) {
                    for (index = 0, cache = parsedData.skeletons.length; index < cache; index++) {
                        var parsedSkeleton = parsedData.skeletons[index];
                        var skeleton = Skeleton.Parse(parsedSkeleton, scene);
                        container.skeletons.push(skeleton);
                        log += (index === 0 ? "\n\tSkeletons:" : "");
                        log += "\n\t\t" + skeleton.toString(fullDetails);
                    }
                }

                // Geometries
                var geometries = parsedData.geometries;
                if (geometries !== undefined && geometries !== null) {
                    var addedGeometry = new Array<Nullable<Geometry>>();
                    // Boxes
                    var boxes = geometries.boxes;
                    if (boxes !== undefined && boxes !== null) {
                        for (index = 0, cache = boxes.length; index < cache; index++) {
                            var parsedBox = boxes[index];
                            addedGeometry.push(Geometry.Primitives.Box.Parse(parsedBox, scene));
                        }
                    }

                    // Spheres
                    var spheres = geometries.spheres;
                    if (spheres !== undefined && spheres !== null) {
                        for (index = 0, cache = spheres.length; index < cache; index++) {
                            var parsedSphere = spheres[index];
                            addedGeometry.push(Geometry.Primitives.Sphere.Parse(parsedSphere, scene));
                        }
                    }

                    // Cylinders
                    var cylinders = geometries.cylinders;
                    if (cylinders !== undefined && cylinders !== null) {
                        for (index = 0, cache = cylinders.length; index < cache; index++) {
                            var parsedCylinder = cylinders[index];
                            addedGeometry.push(Geometry.Primitives.Cylinder.Parse(parsedCylinder, scene));
                        }
                    }

                    // Toruses
                    var toruses = geometries.toruses;
                    if (toruses !== undefined && toruses !== null) {
                        for (index = 0, cache = toruses.length; index < cache; index++) {
                            var parsedTorus = toruses[index];
                            addedGeometry.push(Geometry.Primitives.Torus.Parse(parsedTorus, scene));
                        }
                    }

                    // Grounds
                    var grounds = geometries.grounds;
                    if (grounds !== undefined && grounds !== null) {
                        for (index = 0, cache = grounds.length; index < cache; index++) {
                            var parsedGround = grounds[index];
                            addedGeometry.push(Geometry.Primitives.Ground.Parse(parsedGround, scene));
                        }
                    }

                    // Planes
                    var planes = geometries.planes;
                    if (planes !== undefined && planes !== null) {
                        for (index = 0, cache = planes.length; index < cache; index++) {
                            var parsedPlane = planes[index];
                            addedGeometry.push(Geometry.Primitives.Plane.Parse(parsedPlane, scene));
                        }
                    }

                    // TorusKnots
                    var torusKnots = geometries.torusKnots;
                    if (torusKnots !== undefined && torusKnots !== null) {
                        for (index = 0, cache = torusKnots.length; index < cache; index++) {
                            var parsedTorusKnot = torusKnots[index];
                            addedGeometry.push(Geometry.Primitives.TorusKnot.Parse(parsedTorusKnot, scene));
                        }
                    }

                    // VertexData
                    var vertexData = geometries.vertexData;
                    if (vertexData !== undefined && vertexData !== null) {
                        for (index = 0, cache = vertexData.length; index < cache; index++) {
                            var parsedVertexData = vertexData[index];
                            addedGeometry.push(Geometry.Parse(parsedVertexData, scene, rootUrl));
                        }
                    }

                    addedGeometry.forEach((g)=>{
                        if(g){
                            container.geometries.push(g);
                        }
                    })
                }
                
                // Transform nodes
                if (parsedData.transformNodes !== undefined && parsedData.transformNodes !== null) {
                    for (index = 0, cache = parsedData.transformNodes.length; index < cache; index++) {
                        var parsedTransformNode = parsedData.transformNodes[index];
                        var node = TransformNode.Parse(parsedTransformNode, scene, rootUrl);
                        container.transformNodes.push(node);
                    }
                }                

                // Meshes
                if (parsedData.meshes !== undefined && parsedData.meshes !== null) {
                    for (index = 0, cache = parsedData.meshes.length; index < cache; index++) {
                        var parsedMesh = parsedData.meshes[index];
                        var mesh = <AbstractMesh>Mesh.Parse(parsedMesh, scene, rootUrl);
                        container.meshes.push(mesh);
                        log += (index === 0 ? "\n\tMeshes:" : "");
                        log += "\n\t\t" + mesh.toString(fullDetails);
                    }
                }

                // Cameras
                if (parsedData.cameras !== undefined && parsedData.cameras !== null) {
                    for (index = 0, cache = parsedData.cameras.length; index < cache; index++) {
                        var parsedCamera = parsedData.cameras[index];
                        var camera = Camera.Parse(parsedCamera, scene);
                        container.cameras.push(camera);
                        log += (index === 0 ? "\n\tCameras:" : "");
                        log += "\n\t\t" + camera.toString(fullDetails);
                    }
                }
                if (parsedData.activeCameraID !== undefined && parsedData.activeCameraID !== null) {
                    container.activeCameraID = parsedData.activeCameraID;
                }

                // Browsing all the graph to connect the dots
                for (index = 0, cache = scene.cameras.length; index < cache; index++) {
                    var camera = scene.cameras[index];
                    if (camera._waitingParentId) {
                        camera.parent = scene.getLastEntryByID(camera._waitingParentId);
                        camera._waitingParentId = null;
                    }
                }

                for (index = 0, cache = scene.lights.length; index < cache; index++) {
                    let light = scene.lights[index];
                    if (light && light._waitingParentId) {
                        light.parent = scene.getLastEntryByID(light._waitingParentId);
                        light._waitingParentId = null;
                    }
                }

                // Sounds
                // TODO: add sound
                var loadedSounds: Sound[] = [];
                var loadedSound: Sound;
                if (AudioEngine && parsedData.sounds !== undefined && parsedData.sounds !== null) {
                    for (index = 0, cache = parsedData.sounds.length; index < cache; index++) {
                        var parsedSound = parsedData.sounds[index];
                        if (Engine.audioEngine.canUseWebAudio) {
                            if (!parsedSound.url) parsedSound.url = parsedSound.name;
                            if (!loadedSounds[parsedSound.url]) {
                                loadedSound = Sound.Parse(parsedSound, scene, rootUrl);
                                loadedSounds[parsedSound.url] = loadedSound;
                            }
                            else {
                                Sound.Parse(parsedSound, scene, rootUrl, loadedSounds[parsedSound.url]);
                            }
                        } else {
                            new Sound(parsedSound.name, null, scene);
                        }
                    }
                }

                loadedSounds = [];

                // Connect parents & children and parse actions
                for (index = 0, cache = scene.transformNodes.length; index < cache; index++) {
                    var transformNode = scene.transformNodes[index];
                    if (transformNode._waitingParentId) {
                        transformNode.parent = scene.getLastEntryByID(transformNode._waitingParentId);
                        transformNode._waitingParentId = null;
                    }
                }                
                for (index = 0, cache = scene.meshes.length; index < cache; index++) {
                    var mesh = scene.meshes[index];
                    if (mesh._waitingParentId) {
                        mesh.parent = scene.getLastEntryByID(mesh._waitingParentId);
                        mesh._waitingParentId = null;
                    }
                    if (mesh._waitingActions) {
                        ActionManager.Parse(mesh._waitingActions, mesh, scene);
                        mesh._waitingActions = null;
                    }
                }

                // freeze world matrix application
                for (index = 0, cache = scene.meshes.length; index < cache; index++) {
                    var currentMesh = scene.meshes[index];
                    if (currentMesh._waitingFreezeWorldMatrix) {
                        currentMesh.freezeWorldMatrix();
                        currentMesh._waitingFreezeWorldMatrix = null;
                    } else {
                        currentMesh.computeWorldMatrix(true);
                    }
                }

                // Particles Systems
                if (parsedData.particleSystems !== undefined && parsedData.particleSystems !== null) {
                    for (index = 0, cache = parsedData.particleSystems.length; index < cache; index++) {
                        var parsedParticleSystem = parsedData.particleSystems[index];
                        var ps = ParticleSystem.Parse(parsedParticleSystem, scene, rootUrl);
                        container.particleSystems.push(ps);
                    }
                }

                // Environment texture
                if (parsedData.environmentTexture !== undefined && parsedData.environmentTexture !== null) {
                    container.environmentTexture = CubeTexture.CreateFromPrefilteredData(rootUrl + parsedData.environmentTexture, scene);
                    container.createDefaultSkybox = parsedData.createDefaultSkybox;
                    container.skyboxBlurLevel = parsedData.skyboxBlurLevel || 0;
                    container.skyboxBlurLevel = parsedData.skyboxBlurLevel || 0;
                }

                // Lens flares
                if (parsedData.lensFlareSystems !== undefined && parsedData.lensFlareSystems !== null) {
                    for (index = 0, cache = parsedData.lensFlareSystems.length; index < cache; index++) {
                        var parsedLensFlareSystem = parsedData.lensFlareSystems[index];
                        var lf = LensFlareSystem.Parse(parsedLensFlareSystem, scene, rootUrl);
                        container.lensFlareSystems.push(lf);
                    }
                }

                // Shadows
                if (parsedData.shadowGenerators !== undefined && parsedData.shadowGenerators !== null) {
                    for (index = 0, cache = parsedData.shadowGenerators.length; index < cache; index++) {
                        var parsedShadowGenerator = parsedData.shadowGenerators[index];
                        var sg = ShadowGenerator.Parse(parsedShadowGenerator, scene);
                        container.shadowGenerators.push(sg);
                    }
                }

                // Lights exclusions / inclusions
                for (index = 0, cache = scene.lights.length; index < cache; index++) {
                    let light = scene.lights[index];
                    // Excluded check
                    if (light._excludedMeshesIds.length > 0) {
                        for (var excludedIndex = 0; excludedIndex < light._excludedMeshesIds.length; excludedIndex++) {
                            var excludedMesh = scene.getMeshByID(light._excludedMeshesIds[excludedIndex]);

                            if (excludedMesh) {
                                light.excludedMeshes.push(excludedMesh);
                            }
                        }

                        light._excludedMeshesIds = [];
                    }

                    // Included check
                    if (light._includedOnlyMeshesIds.length > 0) {
                        for (var includedOnlyIndex = 0; includedOnlyIndex < light._includedOnlyMeshesIds.length; includedOnlyIndex++) {
                            var includedOnlyMesh = scene.getMeshByID(light._includedOnlyMeshesIds[includedOnlyIndex]);

                            if (includedOnlyMesh) {
                                light.includedOnlyMeshes.push(includedOnlyMesh);
                            }
                        }

                        light._includedOnlyMeshesIds = [];
                    }
                }

                // Actions (scene)
                if (parsedData.actions !== undefined && parsedData.actions !== null) {
                    ActionManager.Parse(parsedData.actions, null, scene);
                }

                // TODO: Lights are sorted when calling scene.addLight so remove lights after old last index wont always work
                // It would be better to add all in place and then just remove them at the end
                
                container.cameras.forEach((o)=>{
                    scene.removeCamera(o);
                });
                
                container.lights.forEach((o)=>{
                    scene.removeLight(o);
                });

                container.meshes.forEach((o)=>{
                    scene.removeMesh(o);
                });
                container.skeletons.forEach((o)=>{
                    scene.removeSkeleton(o);
                });

                // Todo: Odd
                container.particleSystems.forEach((o)=>{
                    var index = scene.particleSystems.indexOf(o);
                    if (index !== -1) {
                        scene.particleSystems.splice(index, 1);
                    }
                });
                container.animations.forEach((o)=>{
                    var index = scene.animations.indexOf(o);
                    if (index !== -1) {
                        scene.animations.splice(index, 1);
                    }
                });
                container.multiMaterials.forEach((o)=>{
                    var index = scene.multiMaterials.indexOf(o);
                    if (index !== -1) {
                        scene.multiMaterials.splice(index, 1);
                    }
                });
                container.materials.forEach((o)=>{
                    var index = scene.materials.indexOf(o);
                    if (index !== -1) {
                        scene.materials.splice(index, 1);
                    }
                });

                container.morphTargetManagers.forEach((o)=>{
                    scene.removeMorphTargetManager(o);
                });
                container.geometries.forEach((o)=>{
                    scene.removeGeometry(o);
                });
                container.transformNodes.forEach((o)=>{
                    scene.removeTransformNode(o);
                });
                container.lensFlareSystems.forEach((o)=>{
                    var index = scene.lensFlareSystems.indexOf(o);
                    if (index !== -1) {
                        scene.lensFlareSystems.splice(index, 1);
                    }
                });
                // Todo: shadow generators?
                container.actionManagers.forEach((o)=>{
                    var index = scene._actionManagers.indexOf(o);
                    if (index !== -1) {
                        scene._actionManagers.splice(index, 1);
                    }
                });

                // Finish
                return container;

            } catch (err) {
                let msg = logOperation("importScene", parsedData ? parsedData.producer : "Unknown") + log;
                if (onError) {
                    onError(msg, err);
                } else {
                    Tools.Log(msg);
                    throw err;
                }
            } finally {
                if (log !== null && SceneLoader.loggingLevel !== SceneLoader.NO_LOGGING) {
                    Tools.Log(logOperation("importScene", parsedData ? parsedData.producer : "Unknown") + (SceneLoader.loggingLevel !== SceneLoader.MINIMAL_LOGGING ? log : ""));
                }
            }

            return container;
        }
    });
}

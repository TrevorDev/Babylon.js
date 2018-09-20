# 4.0.0

## Major updates

- Added support for [parallel shader compilation](https://www.khronos.org/registry/webgl/extensions/KHR_parallel_shader_compile/) ([Deltakosh](https://github.com/deltakosh))
- Added FlyCamera for free navigation in 3D space, with a limited set of settings ([Phuein](https://github.com/phuein))

## Updates

### GUI

### Core Engine

- Added utility function `Tools.BuildArray` for array initialisation ([barroij](https://github.com/barroij))
- Improved the way world matrices were computed ([Deltakosh](https://github.com/deltakosh))
- Added `scene.rootNodes` to track root nodes (ie. nodes with no parent) ([Deltakosh](https://github.com/deltakosh))
- Added `scene.pickSpriteWithRay` function ([Deltakosh](https://github.com/deltakosh))
- Added support for multiple clip planes. [Demo](https://www.babylonjs-playground.com/#Y6W087) ([Deltakosh](https://github.com/deltakosh))
- Added new `MixMaterial` to the Materials Library allowing to mix up to 8 textures ([julien-moreau](https://github.com/julien-moreau))
- Added new `BoundingInfo.scale()` function to let users control the size of the bounding info ([Deltakosh](https://github.com/deltakosh))
- Added new `Animatable.waitAsync` function to use Promises with animations. [Demo](https://www.babylonjs-playground.com/#HZBCXR) ([Deltakosh](https://github.com/deltakosh))
- Added the choice of [forming a closed loop](http://doc.babylonjs.com/how_to/how_to_use_curve3#catmull-rom-spline) to the catmull-rom-spline curve3 ([johnk](https://github.com/babylonjsguide))
- Added support for specifying the center of rotation to textures ([bghgary](http://www.github.com/bghgary))
- Added webVR support for Oculus Go ([TrevorDev](https://github.com/TrevorDev))
- Added ability to not generate polynomials harmonics upon prefiltered texture creation ([sebavan](http://www.github.com/sebavan))
- Added predicate function to customize the list of mesh included in the computation of bounding vectors in the ```getHierarchyBoundingVectors``` method ([sebavan](http://www.github.com/sebavan))
- Added webVR constructor options: disable laser pointer toggle, teleportation floor meshes ([TrevorDev](https://github.com/TrevorDev))
- Get a root mesh from an asset container, load a mesh from a file with a single string url ([TrevorDev](https://github.com/TrevorDev))
- UtilityLayer class used to render another scene as a layer on top of an existing scene ([TrevorDev](https://github.com/TrevorDev))
- AnimationGroup has now onAnimationGroupEnd observable ([RaananW](https://github.com/RaananW))
- New `serialize` and `Parse` functions to serialize and parse all procedural textures from the Procedural Textures Library ([julien-moreau](https://github.com/julien-moreau))
- Added a new `mesh.ignoreNonUniformScaling` to turn off non uniform scaling compensation ([Deltakosh](https://github.com/deltakosh))
- AssetsManager tasks will only run when their state is INIT. It is now possible to remove a task from the assets manager ([RaananW](https://github.com/RaananW))
- Added sprite isVisible field ([TrevorDev](https://github.com/TrevorDev))
- EnvironmentHelper will recreate ground and skybox meshes if force-disposed ([RaananW](https://github.com/RaananW))
- Added viewport caching mechanism in engine ([sebavan](http://www.github.com/sebavan))
- Added unpackFlipY caching mechanism in engine ([sebavan](http://www.github.com/sebavan))
- Added rebind optimization of video texture ([sebavan](http://www.github.com/sebavan))
- Fix Background Material effect caching ([sebavan](http://www.github.com/sebavan))
- Prevent texture ```getSize``` to generate garbage collection ([sebavan](http://www.github.com/sebavan))
- Prevent ```lodGenerationScale``` and ```lodGenerationOffset``` to force rebind ([sebavan](http://www.github.com/sebavan))
- Added poster property on VideoTexture ([sebavan](http://www.github.com/sebavan))
- Added ```onUserActionRequestedObservable``` to workaround and detect autoplay video policy restriction on VideoTexture ([sebavan](http://www.github.com/sebavan))
- `Sound` now accepts `MediaStream` as source to enable easier WebAudio and WebRTC integrations ([menduz](https://github.com/menduz))
- Vector x, y and z constructor parameters are now optional and default to 0 ([TrevorDev](https://github.com/TrevorDev))
- Added and removed camera methods in the default pipeline ([TrevorDev](https://github.com/TrevorDev))
- Added internal texture `format` support for RenderTargetCubeTexture ([PeapBoy](https://github.com/NicolasBuecher))
- Added canvas toBlob polyfill in tools ([sebavan](http://www.github.com/sebavan))
- Added `RawCubeTexture` class with RGBD and mipmap support ([bghgary](http://www.github.com/bghgary))
- Added effect layer per rendering group addressing ([sebavan](http://www.github.com/sebavan))
- Added predicate function `targetMask` argument to `scene.beginWeightedAnimation`, `scene.beginAnimation`, `scene.stopAnimation`, and `animatable.stop` to allow for selective application of animations.  ([fmmoret](http://github.com/fmmoret))
- Oculus GO and GearVR 3dof controllers will now rotate with the user's head if they turn around in their room ([TrevorDev](https://github.com/TrevorDev))
- Added onPoseUpdatedFromDeviceObservable to webVRCamera to detect when the camera's pose has been updated ([TrevorDev](https://github.com/TrevorDev))
- Added gltf light falloff ([sebavan](http://www.github.com/sebavan))
- Added falloff type per light to prevent material only inconsistencies ([sebavan](http://www.github.com/sebavan))
- Added WeightedSound; selects one from many Sounds with random weight for playback. ([najadojo](https://github.com/najadojo))
- Added HDR support to ReflectionProbe ([Deltakosh](https://github.com/deltakosh))
- Added ACES ToneMapping to the image processing to help getting more parity with other engines ([sebavan](http://www.github.com/sebavan))
- Added Image Processing to the particle system to allow consistency in one pass forward rendering scenes ([sebavan](http://www.github.com/sebavan))
- Added support for main WebGL2 texture formats ([PeapBoy](https://github.com/NicolasBuecher))
- Added fadeInOutBehavior and tooltipText for holographic buttons ([TrevorDev](https://github.com/TrevorDev))
- StartDrag method added to pointerDragBehavior used to simulate the start of a drag ([TrevorDev](https://github.com/TrevorDev))
- Added EdgesLineRenderer to address [#4919](https://github.com/BabylonJS/Babylon.js/pull/4919) ([barteq100](https://github.com/barteq100))
- Added ```ambientTextureImpactOnAnalyticalLights``` in PBRMaterial to allow fine grained control of the AmbientTexture on the analytical diffuse light ([sebavan](http://www.github.com/sebavan))
- BoundingBoxGizmo scalePivot field that can be used to always scale objects from the bottom ([TrevorDev](https://github.com/TrevorDev))
- Improved _isSyncronized performance and reduced GC in TransformNode.computeWorldMatrix by directly reading property ([Bolloxim](https://github.com/Bolloxim))
- Added supports for reflectionMatrix in Skybox Mode Cube Texture allowing offsetting the world center or rotating the matrix ([sebavan](http://www.github.com/sebavan))
- Improved performance of cached nodes but ensuring parent always updates cache. This removes failed isSynchronized test that meant computeWorldMatrix would always have to rebuild. On large scenes this could double framerate. ([Bolloxim](https://github.com/Bolloxim))
- Added FXAA and MSAA support to the StandardRenderingPipeline ([julien-moreau](https://github.com/julien-moreau))
- Make teleportCamera public in VR experience helper ([TrevorDev](https://github.com/TrevorDev))
- Added optional alphaFilter parameter to ```CreateGroundFromHeightMap``` to allow for heightmaps to be created that ignore any transparent data ([Postman-nz](https://github.com/Postman-nz))
- Fixed renormalization of mesh weights to in cleanMatrixWeights function. ([Bolloxim](https://github.com/Bolloxim))
- Added a validationSkin function to report out any errors on skinned meshes. ([Bolloxim](https://github.com/Bolloxim))
- Add customAnimationFrameRequester to engine ([TrevorDev](https://github.com/TrevorDev))

### glTF Loader

### glTF Serializer

### Viewer

### Materials Library

## Bug fixes

### Core Engine



### Viewer

### Loaders

## Breaking changes

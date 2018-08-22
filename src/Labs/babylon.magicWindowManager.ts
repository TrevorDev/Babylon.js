module BABYLON {
    /**
     * The _Labs namespace will contain classes/functions that are not (!) backwards compatible.
     * The APIs in all labs-related classes and configuration  might change.
     * Once stable, lab features will be moved to the publis API and configuration object.
     */
    export namespace _Labs {
        export class XRManger {
            private _xrDevice:any;
            private _xrSession:any;
            private _gl:any;
            private _camera:FreeCamera;
            private _outputCanvas:Nullable<HTMLCanvasElement>;
            /**
             * This will be true between the time enterXR() is called to the time the call completes.
             */
            private _enteringXRMode = false;

            /**
             * True if a magic window capabile device has been initialized. Only populated after calling init()
             */
            public xrSupported = false;

            /**
             * If the magic window is currently active
             */
            public inXRMode = false;
            

            constructor(public scene:BABYLON.Scene){  
                this._camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene); 
                this._camera.minZ = 0; 
                this._camera.rotationQuaternion = new Quaternion()
                this._camera.setCameraRigMode(Camera.RIG_MODE_CUSTOM, { parentCamera: this._camera, rigCameras: [new TargetCamera("a", this._camera.position.clone(), this._camera.getScene()),new TargetCamera("b", this._camera.position.clone(), this._camera.getScene())] });
                this._camera.rigCameras[0]._updateViewMatrix = false;
                this._camera.rigCameras[0].freezeProjectionMatrix()
                this._camera.rigCameras[0].minZ = 0;
                this._camera.rigCameras[1]._updateViewMatrix = false;
                this._camera.rigCameras[1].freezeProjectionMatrix()
                this._camera.rigCameras[1].minZ = 0;
            }
            init():Promise<boolean>{
                var xrNavigator:any = navigator;
                if(!xrNavigator.xr){
                    this.xrSupported = false;
                    return Promise.resolve(this.xrSupported);
                }
                return xrNavigator.xr.requestDevice()
                .then((device:any)=>{
                    this._xrDevice = device;
                    this.xrSupported = true;
                    return Promise.resolve(this.xrSupported);
                })
            }
            exitXR():Promise<void>{
                if(this._outputCanvas){
                    document.body.removeChild(this._outputCanvas);
                    this._outputCanvas = null;
                }
                return Promise.resolve();
            }
            enterXR(requestSessionOptions:any):Promise<void>{
                if(this.inXRMode || this._enteringXRMode){
                    return Promise.resolve();
                }
                this._enteringXRMode = true;

                if(!this._outputCanvas){
                    this._outputCanvas = document.createElement('canvas');
                    this._outputCanvas.style.cssText = "position:absolute; top:0px;left:0px;z-index:10;width:100%;height:100%";
                    document.body.appendChild(this._outputCanvas);
                }
               
                var ctx = this._outputCanvas.getContext('xrpresent');
                requestSessionOptions.outputContext = ctx;
                
                return this._xrDevice.requestSession(requestSessionOptions)
                .then((session:any)=>{
                    this._xrSession = session;
                    console.log("got sesssion")
                    this._gl = this.scene.getEngine()._gl;
                    return this._gl.setCompatibleXRDevice(this._xrSession.device)
                }).then(()=>{
                    // @ts-ignore
                    this._xrSession.baseLayer = new XRWebGLLayer(this._xrSession, this._gl);
                    console.log("created XR layer")
                    return this._xrSession.requestFrameOfReference('eye-level')
                }).then((frameOfRef:any)=>{
                    console.log("frame of ref")
                    this.scene.activeCamera = this._camera;
                    //this.scene.autoClear = false;
                    this.scene.getEngine().getRenderingCanvas()!.style.cssText = "visibility:hidden"
                    this.scene.getEngine()._customRequester = this._xrSession
                    this.scene.getEngine()._onBeforeRenderObservable.add((renderInfo)=>{
                        if(!renderInfo.frame){
                            return;
                        }
                        var pose = renderInfo.frame.getDevicePose(frameOfRef);
                        
                        if(pose){
                            //console.log("frame")
                            renderInfo.frame.views.forEach((view:any, i:number)=> {
    
                                var viewport  = this._xrSession.baseLayer.getViewport(renderInfo.frame.views[i])
    
                                Matrix.FromFloat32ArrayToRefScaled(pose.getViewMatrix(renderInfo.frame.views[i]), 0, 1, this._camera.rigCameras[i]._computedViewMatrix)                                    
                                Matrix.FromFloat32ArrayToRefScaled(renderInfo.frame.views[i].projectionMatrix, 0, 1, this._camera.rigCameras[i]._projectionMatrix)
                                if (!this._camera.getScene().useRightHandedSystem) {
                                    [2, 6, 8, 9, 14].forEach((num) => {
                                        this._camera.rigCameras[i]._computedViewMatrix.m[num] *= -1;
                                    });
                                    [8, 9, 10, 11].forEach((num) => {
                                        this._camera.rigCameras[i]._projectionMatrix.m[num] *= -1;
                                    });
                                }
                                // TODO figure out how to set viewport using ratio like other places
                                this._camera.rigCameras[i].viewport.width = viewport.width;
                                this._camera.rigCameras[i].viewport.height = viewport.height;
                                this._camera.rigCameras[i].viewport.x = viewport.x;
                                this._camera.rigCameras[i].viewport.y = viewport.y;
                                
                                this._camera.rigCameras[i]._outputBuffer = this._xrSession.baseLayer.framebuffer;
                                //this.scene._renderForCamera(this._camera.rigCameras[i], undefined)
                            })
                        }
                    })
                    
                    this._enteringXRMode = false;
                    this.inXRMode = true;
                }).catch((e:any)=>{
                    this._enteringXRMode = false;
                    this.inXRMode = false;
                    return Promise.reject(e);
                });
            }
        }
    }
}
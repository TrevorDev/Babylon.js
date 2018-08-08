module BABYLON {
    /**
     * The _Labs namespace will contain classes/functions that are not (!) backwards compatible.
     * The APIs in all labs-related classes and configuration  might change.
     * Once stable, lab features will be moved to the publis API and configuration object.
     */
    export namespace _Labs {
        export class MagicWindowManger {
            private _xrDevice:any;
            private _xrSession:any;
            private _gl:any;
            private _camera:FreeCamera;
            public tappedOb = new BABYLON.Observable<{}>();
            constructor(public scene:BABYLON.Scene){  
                this._camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene); 
                this._camera.minZ = 0; 
                this._camera.rotationQuaternion = new Quaternion()
                this._camera.setCameraRigMode(Camera.RIG_MODE_CUSTOM, { parentCamera: this._camera, rigCameras: [new TargetCamera("left", this._camera.position.clone(), this._camera.getScene())] });
                this._camera.rigCameras[0]._updateViewMatrix = false;
                this._camera.rigCameras[0].freezeProjectionMatrix()
                this._camera.rigCameras[0].minZ = 0;
            }
            init(){
                var xrNavigator:any = navigator;
                if(!xrNavigator.xr){
                    console.log("xr not found");
                    return Promise.reject("xr not found");
                }
                var started = false;
                return xrNavigator.xr.requestDevice()
                .then((device:any)=>{
                    this._xrDevice = device;
                    document.onclick = ()=>{
                        this.tappedOb.notifyObservers({})
                        if(started){
                            // console.log(camera.position)
                            // console.log(camera.rotationQuaternion)
                            return
                        }
                        started = true
                        this.enterXR();
                        
                    }
                })
            }
            enterXR(){
                var outputCanvas = document.createElement('canvas');
                outputCanvas.style.cssText = "position:absolute; top:0px;left:0px;z-index:10;width:100%;height:100%"
                var ctx = outputCanvas.getContext('xrpresent');
                console.log("enterXR")
                this._xrDevice.requestSession({
                    outputContext: ctx,
                    environmentIntegration: true,
                }).then((session:any)=>{
                    this._xrSession = session;
                    document.body.appendChild(outputCanvas);
                    console.log("got sesssion")
                    this._gl = this.scene.getEngine()._gl;
                    return this._gl.setCompatibleXRDevice(this._xrSession.device)
                }).then(()=>{
                    this._xrSession.baseLayer = new XRWebGLLayer(this._xrSession, this._gl);
                    console.log("created XR layer")
                    return this._xrSession.requestFrameOfReference('eye-level')
                }).then((frameOfRef:any)=>{
                    this.scene.activeCamera = this._camera;
                    this.scene.autoClear = false;
                    this.scene.getEngine().getRenderingCanvas()!.style.cssText = "visibility:hidden"
                    this.scene.getEngine()._customRequester = 1//this._xrSession
                    var rendLoop = (time:any, frame:any)=>{
                        var renderInfo = {time: time, frame: frame};
                        if(!renderInfo.frame){
                            return;
                        }
                        var pose = renderInfo.frame.getDevicePose(frameOfRef);
                        
                        if(pose){
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
                                //this._camera.rigCameras[i].getViewMatrix(); // TODO, is this needed? // TODO this causes a huge perf hit when getting clone to a mesh for some reason
                                this._camera.rigCameras[i]._outputBuffer = this._xrSession.baseLayer.framebuffer;
                                //console.log(this._camera.rigCameras[i].getViewMatrix().getTranslation())
                                //this.scene._activeMeshesFrozen=true;
                                this.scene._renderForCamera(this._camera.rigCameras[i], undefined, true)
                            })
                        }
                        setTimeout(() => {
                            this._xrSession.requestAnimationFrame(rendLoop)
                        }, 100);
                    }
                    this._xrSession.requestAnimationFrame(rendLoop)
                });
            }
        }
    }
}
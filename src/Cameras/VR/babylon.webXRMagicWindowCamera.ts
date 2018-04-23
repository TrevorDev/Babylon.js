module BABYLON {
    export class WebXRMagicWindowCameraOptions {
        xrDevice?:any
        constructor(){

        }
    }
    export class WebXRMagicWindowCamera extends FreeCamera {
        // Any mode
        public _xrDevice:any;
        public _xrContext:any = null
        public _xrFrame:any;
        public _xrPoseMatrix = BABYLON.Matrix.Identity();

        // Magic window mode only
        public _xrCanvas:any = null;
        public _xrSession:any = null;
        public _xrFrameOfReference:any = null

        constructor(name: string, private scene: Scene, options:WebXRMagicWindowCameraOptions = new WebXRMagicWindowCameraOptions()){
            super(name, Vector3.Zero(), scene);
            this.rotationQuaternion = new Quaternion();
            
            if(!navigator.xr){
                throw "WebXR not supported";
            }

            if(options.xrDevice){
                this._xrDevice = options.xrDevice;
                this.displayOnLocalScreen()
            }else{
                // TODO device disconnect/connect
                navigator.xr.requestDevice().then((device:any)=>{
                    console.log("device found")
                    this._xrDevice = device;
                    this.displayOnLocalScreen()
                });
            }
        };

        public getXRContext(){
            if(this._xrContext){
                return Promise.resolve(this._xrContext);
            }

            // TODO handle webgl context lost and restored that can happen here sometimes apperently (It looks like engine already handles this with _onContextLost)
            var ctx:any = this.getEngine()._gl;
            return ctx.setCompatibleXRDevice(this._xrDevice).then(()=>{
                console.log("set xr device on gl context")
                this._xrContext = ctx;
                return this._xrContext
            })
        }
        public dispose(){
            this.getEngine()._customRequester = null;
            this._xrCanvas.remove()
        }
        public displayOnLocalScreen(){
            this.setCameraRigMode(Camera.RIG_MODE_CUSTOM, { parentCamera: this, rigCameras: [new TargetCamera("window", this.position.clone(), this.getScene())] });
            this.rigCameras[0]._updateViewMatrix = false;
            this.rigCameras[0].freezeProjectionMatrix()

            var rect = this.getEngine().getRenderingCanvasClientRect()
            this._xrCanvas = document.createElement("canvas");
            this._xrCanvas.style.position = "absolute"
            if(rect){
                this._xrCanvas.style.top = rect.top+"px"
                this._xrCanvas.style.left = rect.left+"px"
                this._xrCanvas.style.width = rect.width+"px"
                this._xrCanvas.style.height = rect.height+"px"
            }

            var magicWindowCtx = this._xrCanvas.getContext("xrpresent");
            
            return this._xrDevice.requestSession({outputContext: magicWindowCtx }).then((session:any)=>{
                this._xrSession = session;
                document.body.appendChild(this._xrCanvas);
                return this.getXRContext()
            }).then(()=>{
                this._xrSession.baseLayer = new XRWebGLLayer(this._xrSession, this._xrContext);
                console.log("magic window started")
                return this._xrSession.requestFrameOfReference('eyeLevel')
            }).then((frameOfRef:any) => {
                this._xrFrameOfReference = frameOfRef
                this.getEngine()._customRequester = this._xrSession
                // TODO handle lifetime of this
                this.getEngine()._onBeforeRenderObservable.add((renderInfo)=>{
                    if(renderInfo.frame){
                        this._xrFrame = renderInfo.frame;
                        let pose = this._xrFrame.getDevicePose(this._xrFrameOfReference);
                        if(pose){
                            BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.poseModelMatrix, 0, 1, this._xrPoseMatrix);
                            this._xrPoseMatrix.invert();

                            this._xrPoseMatrix.getTranslationToRef(this.position);
                            this.rotationQuaternion.fromRotationMatrix(this._xrPoseMatrix);

                            if(this._xrSession && this._xrFrame){
                                this.rigCameras.forEach((cam, i)=>{
                                    var viewport  = this._xrSession.baseLayer.getViewport(this._xrFrame.views[i])
                                    Matrix.FromFloat32ArrayToRefScaled(pose.getViewMatrix(this._xrFrame.views[i]), 0, 1, cam._computedViewMatrix)                                    
                                    Matrix.FromFloat32ArrayToRefScaled(this._xrFrame.views[i].projectionMatrix, 0, 1, cam._projectionMatrix)
                                    if (!this.getScene().useRightHandedSystem) {
                                        [2, 6, 8, 9, 14].forEach((num) => {
                                            cam._computedViewMatrix.m[num] *= -1;
                                        });
                                        [8, 9, 10, 11].forEach((num) => {
                                            cam._projectionMatrix.m[num] *= -1;
                                        });
                                    }
                                    // TODO figure out how to set viewport using ratio like other places
                                    cam.viewport.width = viewport.width// /this._webXRSession.baseLayer.framebufferWidth;
                                    cam.viewport.height = viewport.height// /this._webXRSession.baseLayer.framebufferHeight;
                                    cam.viewport.x = viewport.x // /this._webXRSession.baseLayer.framebufferWidth;
                                    cam.viewport.y = viewport.y// /this._webXRSession.baseLayer.framebufferHeight;
                                    cam.getViewMatrix()
                                    cam._outputBuffer = this._xrSession.baseLayer.framebuffer;
                                })
                            }
                        }
                    }
                })
            })
        }
    }
}
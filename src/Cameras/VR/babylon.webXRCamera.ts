module BABYLON {
    export class WebXRCamera extends FreeCamera {
        // Any mode
        public _webXRDevice:any;
        public _xrContext:any = null
        public _xrFrame:any;
        public _xrPoseMatrix = BABYLON.Matrix.Identity();

        // Exclusive mode only
        public _webXRSession:any;
        public _webXRFrameOfRef:any;

        // Magic window mode only
        public magicWindowCanvas:any = null;
        public magicWindowSession:any = null;
        public magicWindowCanvasCtx:any = null;
        public magicWindowFrameOfReference:any = null

        constructor(name: string, private scene: Scene){
            super(name, Vector3.Zero(), scene);
            this.rotationQuaternion = new Quaternion();
            
            if(!navigator.xr){
                throw "WebXR not supported";
            }
            // TODO device disconnect/connect (It looks like engine already handles this with _onContextLost)
            navigator.xr.requestDevice().then((device:any)=>{
                console.log("device found")
                this._webXRDevice = device;
            });
        };

        public getXRContext(){
            if(this._xrContext){
                return Promise.resolve(this._xrContext);
            }

            // TODO handle webgl context lost and restored that can happen here sometimes apperently
            var ctx:any = this.getEngine()._gl;
            return ctx.setCompatibleXRDevice(this._webXRDevice).then(()=>{
                console.log("set xr device on gl context")
                this._xrContext = ctx;
                return this._xrContext
            })
        }
        
        public displayOnLocalScreen(){
            this.setCameraRigMode(Camera.RIG_MODE_CUSTOM, { parentCamera: this, rigCameras: [new TargetCamera("window", this.position.clone(), this.getScene())] });
            this.rigCameras[0]._updateViewMatrix = false;
            this.rigCameras[0].freezeProjectionMatrix()

            this.magicWindowCanvas = document.createElement("canvas");
            this.magicWindowCanvasCtx = this.magicWindowCanvas.getContext("xrpresent");
            
            return this._webXRDevice.requestSession({outputContext: this.magicWindowCanvasCtx }).then((session:any)=>{
                this.magicWindowSession = session;
                document.body.appendChild(this.magicWindowCanvas);
                return this.getXRContext()
            }).then(()=>{
                this.magicWindowSession.baseLayer = new XRWebGLLayer(this.magicWindowSession, this._xrContext);
                console.log("magic window started")
                return this.magicWindowSession.requestFrameOfReference('eyeLevel')
            }).then((frameOfRef:any) => {
                this.magicWindowFrameOfReference = frameOfRef
                this.getEngine()._customRequester = this.magicWindowSession
                // TODO handle lifetime of this
                this.getEngine()._onBeforeRenderObservable.add((renderInfo)=>{
                    if(renderInfo.frame){
                        this._xrFrame = renderInfo.frame;
                        let pose = this._xrFrame.getDevicePose(this.magicWindowFrameOfReference);
                        if(pose){
                            BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.poseModelMatrix, 0, 1, this._xrPoseMatrix);
                            this._xrPoseMatrix.invert();

                            this._xrPoseMatrix.getTranslationToRef(this.position);
                            this.rotationQuaternion.fromRotationMatrix(this._xrPoseMatrix);

                            if(this.magicWindowSession && this._xrFrame){
                                this.rigCameras.forEach((cam, i)=>{
                                    var viewport  = this.magicWindowSession.baseLayer.getViewport(this._xrFrame.views[i])
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
                                    cam._outputBuffer = this.magicWindowSession.baseLayer.framebuffer;
                                })
                            }
                        }
                    }
                })
            })
        }

        public displayOnDevice(){
            if(!this._webXRDevice){
                Tools.Warn("Cannot display on device. No device found.")
                return;
            }

            // TODO handle webXR scenario with more than 2 views
            // Create cameras for each eye
            this.setCameraRigMode(Camera.RIG_MODE_CUSTOM, { parentCamera: this, rigCameras: [new TargetCamera("left", this.position.clone(), this.getScene()), new TargetCamera("right", this.position.clone(), this.getScene())] });
            this.rigCameras[0]._updateViewMatrix = false;
            this.rigCameras[0].freezeProjectionMatrix()
            this.rigCameras[1]._updateViewMatrix = false;
            this.rigCameras[1].freezeProjectionMatrix()

            this._webXRDevice.requestSession({exclusive: true}).then((session:any)=>{
                this._webXRSession = session
                console.log("found session")
                console.log(this._webXRSession)
                return this.getXRContext()
            }).then((ctx:any)=>{
                console.log("set xr device on gl context")
                this._webXRSession.baseLayer = new XRWebGLLayer(this._webXRSession, this._xrContext);                
                return this._webXRSession.requestFrameOfReference("stage")
            }).then((frameOfref:any)=>{
                console.log("found frame of ref")
                this._webXRFrameOfRef = frameOfref
                this.getEngine()._customRequester = this._webXRSession
                // TODO handle lifetime of this
                this.getEngine()._onBeforeRenderObservable.add((renderInfo)=>{
                    // Clear outputBuffers to avoid writing to the same buffer twice if a frame is null
                    this.rigCameras.forEach((cam, i)=>{
                        cam._outputBuffer = null;
                    });

                    if(renderInfo.frame){
                        this._xrFrame = renderInfo.frame;
                        let pose = this._xrFrame.getDevicePose(this._webXRFrameOfRef);
                        if(pose){
                            BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.poseModelMatrix, 0, 1, this._xrPoseMatrix);
                            this._xrPoseMatrix.invert();

                            this._xrPoseMatrix.getTranslationToRef(this.position);
                            this.rotationQuaternion.fromRotationMatrix(this._xrPoseMatrix);

                            if(this._webXRSession && this._xrFrame){
                                this.rigCameras.forEach((cam, i)=>{
                                    var viewport  = this._webXRSession.baseLayer.getViewport(this._xrFrame.views[i])
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
                                    cam._outputBuffer = this._webXRSession.baseLayer.framebuffer;
                                })
                            }
                        }
                    }
                })
            })
        }
    }
}
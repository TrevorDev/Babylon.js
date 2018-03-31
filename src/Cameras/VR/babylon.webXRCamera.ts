module BABYLON {
    export class WebXRCamera extends FreeCamera {
        public _webXRDevice:any;
        public _webXRSession:any;
        public _xrFrame:any;
        public _webXRFrameOfRef:any;
        public _xrPoseMatrix = BABYLON.Matrix.Identity();

        constructor(name: string, private scene: Scene){
            super(name, Vector3.Zero(), scene)
            this.rotationQuaternion = new Quaternion()
            
            if(navigator.xr){
                navigator.xr.requestDevice().then((device:any)=>{
                    this._webXRDevice = device;
                    console.log("found device")
                    console.log(this._webXRDevice)
                })
            }
        }

        public displayOnDevice(){
            // let mirrorCanvas = document.createElement('canvas');
            // let ctx = mirrorCanvas.getContext('xrpresent');
            // mirrorCanvas.setAttribute('id', 'mirror-canvas');
            // document.body.appendChild(mirrorCanvas);

            this.setCameraRigMode(Camera.RIG_MODE_CUSTOM, { parentCamera: this, rigCameras: [new TargetCamera("left", this.position.clone(), this.getScene()), new TargetCamera("right", this.position.clone(), this.getScene())] });
            this.rigCameras[0]._updateViewMatrix = false;
            this.rigCameras[0].freezeProjectionMatrix()
            this.rigCameras[1]._updateViewMatrix = false;
            this.rigCameras[1].freezeProjectionMatrix()

            this._webXRDevice.requestSession({exclusive: true}).then((session:any)=>{
                this._webXRSession = session
                console.log("found session")
                console.log(this._webXRSession)

                // TODO handle webgl context lost and restored that can happen here sometimes apperently
                var ctx:any = this.getEngine()._gl;
                return ctx.setCompatibleXRDevice(this._webXRDevice)
            }).then(()=>{
                console.log("set xr device on gl context")
                this._webXRSession.baseLayer = new XRWebGLLayer(this._webXRSession, this.getEngine()._gl);                
                return this._webXRSession.requestFrameOfReference("stage")
            }).then((frameOfref:any)=>{
                console.log("found frame of ref")
                this._webXRFrameOfRef = frameOfref
                this.getEngine()._customRequester = this._webXRSession
                // TODO handle lifetime of this
                var first = true;
                this.getEngine()._onBeforeRenderObservable.add((renderInfo)=>{
                    this.rigCameras.forEach((cam, i)=>{
                        cam._outputBuffer = null
                    })


                    if(renderInfo.frame){
                        this._xrFrame = renderInfo.frame;
                        let pose = this._xrFrame.getDevicePose(this._webXRFrameOfRef);
                        if(pose){
                            BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.poseModelMatrix, 0, 1, this._xrPoseMatrix)
                            this._xrPoseMatrix.invert()

                            this._xrPoseMatrix.getTranslationToRef(this.position)
                            this.rotationQuaternion.fromRotationMatrix(this._xrPoseMatrix)
                            //console.log("frame")

                            if(this._webXRSession && this._xrFrame){
                                this.rigCameras.forEach((cam, i)=>{
                                    
                                    var viewport  = this._webXRSession.baseLayer.getViewport(this._xrFrame.views[i])
                                    if(first){
                                        console.log(this._webXRSession.baseLayer.framebuffer)
                                        first = false;
                                    }
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
                                // this.rigCameras[0].viewport.width = 0.5;
                                // this.rigCameras[0].viewport.height = 0.5;
                                // var viewport  = this._webXRSession.baseLayer.getViewport(this._xrFrame.views[0])
                                // var texture = {_framebuffer: this._engine._webXRSession.baseLayer.framebuffer}
                                // this._engine.bindFramebuffer(texture, 0, viewport .width, viewport .height, false);
                
                                // this._engine._gl.bindFramebuffer(this._engine._gl.FRAMEBUFFER, this._engine._webXRSession.baseLayer.framebuffer);
                                // this._engine._gl.clear(this._engine._gl.COLOR_BUFFER_BIT | this._engine._gl.DEPTH_BUFFER_BIT);
                                // this._engine._gl.viewport(viewport.x, viewport.y,
                                //     viewport.width, viewport.height);
                            }
                        }
                    }
                })
            })

            // this.scene.getEngine().initWebXRAsync().then(()=>{
            //     console.log("rdy")
            // })
            // this.scene.onBeforeRenderObservable.add(()=>{
            //     this.getEngine()._xrPoseMatrix.getTranslationToRef(this.position)
            //     this.rotationQuaternion.fromRotationMatrix(this.getEngine()._xrPoseMatrix)
            // })
        }
    }
}
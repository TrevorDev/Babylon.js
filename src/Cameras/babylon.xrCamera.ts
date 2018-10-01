module BABYLON {
    export class XRCameraOptions {
        initialPosition?:Vector3;
        initialPupilDistance?:number;
        initialViewCount?:number;
    }
    export class XRCamera extends FreeCamera {
        constructor(name:string, scene:BABYLON.Scene, options?:XRCameraOptions){
            // Parse options
            if(!options){
                options = {}
            }
            if(!options.initialPosition){
                options.initialPosition = new Vector3();
            }
            if(!options.initialPupilDistance){
                options.initialPupilDistance = 0.1;
            }
            if(!options.initialViewCount){
                options.initialViewCount = 1;
            }

            super(name, options.initialPosition, scene);

            // Initial camera configuration
            this.minZ = 0;
            this.rotationQuaternion = new BABYLON.Quaternion();

            // Create initial camera rigs
            this.cameraRigMode = BABYLON.Camera.RIG_MODE_CUSTOM;    
            for(var i = 0;i<options.initialViewCount;i++){
                this.rigCameras.push(new BABYLON.TargetCamera("view: "+i, this.position.clone(), this.getScene()))
                if(i==0){
                    if(options.initialViewCount == 1){
                    }else{
                        this.rigCameras[i].viewport = new BABYLON.Viewport(0, 0, 0.5, 1.0);
                        this.rigCameras[i].position.x = -options.initialPupilDistance/2;
                    }
                    
                }else{
                    this.rigCameras[i].viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1.0);
                    this.rigCameras[i].position.x = options.initialPupilDistance/2;
                }
                this.rigCameras[i].minZ = 0;
                this.rigCameras[i].parent = this;
            }
        }

        public updateFromFrame(xrFrame:any, xrSessionManager:XRSessionManager){
            if(xrFrame && xrFrame.getDevicePose){
                var pose = xrFrame.getDevicePose(xrSessionManager.frameOfReference);
                if(pose && pose.poseModelMatrix){
                    // Update the parent cameras matrix
                    var matrix = BABYLON.Matrix.Identity()
                    BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.poseModelMatrix,0,1,matrix)
                    if (!this._scene.useRightHandedSystem) {
                        [2, 6, 8, 9, 14].forEach((num) => {
                            matrix.m[num] *= -1;
                        });
                    }
                    matrix.getTranslationToRef(this.position)
                    var rot = matrix.getRotationMatrix()
                    BABYLON.Quaternion.FromRotationMatrixToRef(rot, this.rotationQuaternion)
                    this.computeWorldMatrix()

                    // Update the child matrix and viewport
                    if(xrFrame.views.length != this.rigCameras.length){
                        alert("bad view count")
                    }else{                        
                        xrFrame.views.forEach((view:any, i:number)=>{
                            // TODO: How could we handle multiple headsets connected at the same time in the future?
                            var viewport  = xrSessionManager._xrSession.baseLayer.getViewport(xrFrame.views[i])
    
                            BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.getViewMatrix(xrFrame.views[i]), 0, 1, this.rigCameras[i]._computedViewMatrix)                                    
                            BABYLON.Matrix.FromFloat32ArrayToRefScaled(xrFrame.views[i].projectionMatrix, 0, 1, this.rigCameras[i]._projectionMatrix)
                            if (!this._scene.useRightHandedSystem) {
                                [2, 6, 8, 9, 14].forEach((num) => {
                                    this.rigCameras[i]._computedViewMatrix.m[num] *= -1;
                                });
                                [8, 9, 10, 11].forEach((num) => {
                                    this.rigCameras[i]._projectionMatrix.m[num] *= -1;
                                });
                            }

                            // TODO is the parenting working right? I expect to need to set view matrix of children to this divided by parent
                            // TODO figure out how to set viewport using ratio like other places
                            var width = xrSessionManager._xrSession.baseLayer.framebufferWidth;
                            var height = xrSessionManager._xrSession.baseLayer.framebufferHeight;
                            this.rigCameras[i].viewport.width = viewport.width/width;
                            this.rigCameras[i].viewport.height = viewport.height/height;
                            this.rigCameras[i].viewport.x = viewport.x/width;
                            this.rigCameras[i].viewport.y = viewport.y/height;

                            // Set cameras to render to the sessions render target
                            this.rigCameras[i].customDefaultRenderTarget = xrSessionManager.sessionRenderTargetTexture;
                        })
                    }
                }
            }
        }
    }

    export class XRSessionManagerEnterXROptions {
        outputCanvas?:HTMLCanvasElement
    }

    export class XRSessionManager {
        private _xrNavigator:any;
        private _xrDevice:any;
        public _xrSession:any;
        private _outputContext:any;
        private _scene:Scene;
        public frameOfReference:any;
        public sessionRenderTargetTexture:RenderTargetTexture;
        constructor(){}

        initialize(scene:BABYLON.Scene):Promise<any>{
            this._scene = scene

            // Check if the browser supports webXR
            this._xrNavigator = navigator;
            if(!this._xrNavigator.xr){
                return Promise.reject("webXR not supported by this browser");
            }

            // Request the webXR device
            return this._xrNavigator.xr.requestDevice().then((device:any)=>{
                this._xrDevice = device;
                return (<any>scene.getEngine()._gl).setCompatibleXRDevice(this._xrDevice)
            })
        }

        enterXR(options:XRSessionManagerEnterXROptions):Promise<any>{
            var arMode = true;

            // initialize session
            this._outputContext = options.outputCanvas!.getContext('xrpresent')
            return this._xrDevice.requestSession({immersive: !arMode, environmentIntegration: arMode, outputContext: this._outputContext}).then((session:any)=>{
                this._xrSession = session;
                this._xrSession.baseLayer = new XRWebGLLayer(this._xrSession, this._scene.getEngine()._gl);
                return this._xrSession.requestFrameOfReference('eye-level');
            }).then((frameOfRef:any)=>{
                this.frameOfReference = frameOfRef;

                // Tell the engine's render loop to be driven by the xr session's refresh rate and provide xr pose information
                this._scene.getEngine().customAnimationFrameRequester = this._xrSession

                // Create render target texture from xr's webgl render target
                this.sessionRenderTargetTexture = XRSessionManager.CreateRenderTargetTextureFromSession(this._xrSession, this._scene);
                this._outputContext.width = this.sessionRenderTargetTexture.getRenderWidth();
                this._outputContext.height =this.sessionRenderTargetTexture.getRenderHeight();
            })
        }

        exitXR(){
            this._scene.getEngine().customAnimationFrameRequester = null;
            this._xrSession.end()
            // Restore frame buffer to avoid clear on xr framebuffer after session end
            this._scene.getEngine().restoreDefaultFramebuffer();
            // Need to restart render loop as after calling session.end the last request for new frame will never call callback
            this._scene.getEngine()._renderLoop(0)
        }

        static CreateRenderTargetTextureFromSession(session:any, scene:BABYLON.Scene){
            // Create internal texture
            var internalTexture = new BABYLON.InternalTexture(scene.getEngine(), BABYLON.InternalTexture.DATASOURCE_UNKNOWN, true)
            internalTexture.width = session.baseLayer.framebufferWidth
            internalTexture.height = session.baseLayer.framebufferHeight
            internalTexture._framebuffer = session.baseLayer.framebuffer;

            // Create render target texture from the internal texture
            var renderTargetTexture = new BABYLON.RenderTargetTexture("XR renderTargetTexture", {width: internalTexture.width, height: internalTexture.height},scene)
            renderTargetTexture._texture = internalTexture;

            return renderTargetTexture;
        }
    }
}
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

        public updateFromFrame(xrFrame:any, frameOfRef:any, session:any){
            if(xrFrame && xrFrame.getDevicePose){
                var pose = xrFrame.getDevicePose(frameOfRef);
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
                            var viewport  = session.baseLayer.getViewport(xrFrame.views[i])
    
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
                            var width = session.baseLayer.framebufferWidth
                            var height = session.baseLayer.framebufferHeight
                            this.rigCameras[i].viewport.width = viewport.width/width;
                            this.rigCameras[i].viewport.height = viewport.height/height;
                            this.rigCameras[i].viewport.x = viewport.x/width;
                            this.rigCameras[i].viewport.y = viewport.y/height;
                        })
                    }
                }
                
            }
        }
    }

    export class XRSessionManager {
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

        constructor(){
            
        }
    }
}
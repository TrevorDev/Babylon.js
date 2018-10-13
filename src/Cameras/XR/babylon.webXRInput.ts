module BABYLON {
    export class WebXRController {
        mesh: BABYLON.AbstractMesh
        constructor(scene:Scene){
            this.mesh = new BABYLON.Mesh("", scene)
            var box = Mesh.CreateBox("", 0.1, scene)
            box.scaling.z = 2;
            this.mesh.addChild(box)
        }
    }

    export class WebXRInput implements IDisposable {
        public controllers:Array<WebXRController> = []
        private _tmpMatrix = new BABYLON.Matrix();
        public constructor(helper: WebXRExperienceHelper) {
            helper.sessionManager.onXRFrameObservable.add(()=>{
                if (!helper.sessionManager._currentXRFrame || !helper.sessionManager._currentXRFrame.getDevicePose) {
                    return false;
                }
                var xrFrame = helper.sessionManager._currentXRFrame;
                var inputSources = helper.sessionManager._xrSession.getInputSources()
                inputSources.forEach((input, i)=>{
                    let inputPose = xrFrame.getInputPose(input, helper.sessionManager._frameOfReference);
                    if(inputPose && inputPose.gripMatrix){
                        if(this.controllers.length <= i){
                            this.controllers.push(new WebXRController(helper.container.getScene()));
                        }
                        var controller = this.controllers[i];
                        BABYLON.Matrix.FromFloat32ArrayToRefScaled(inputPose.gripMatrix, 0, 1, this._tmpMatrix);
                        if(!controller.mesh.getScene().useRightHandedSystem){
                            this._tmpMatrix.toggleModelMatrixHandInPlace();
                        }
                        if(!controller.mesh.rotationQuaternion){
                            controller.mesh.rotationQuaternion = new BABYLON.Quaternion();
                        }
                        this._tmpMatrix.decompose(controller.mesh.scaling, controller.mesh.rotationQuaternion, controller.mesh.position);
                    }
                })
            })
        }
        /**
         * Disposes of the object
         */
        public dispose() {
        }
    }
}
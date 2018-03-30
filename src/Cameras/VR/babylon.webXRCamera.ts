module BABYLON {
    export class WebXRCamera extends FreeCamera {
        constructor(name: string, scene: Scene){
            super(name, Vector3.Zero(), scene)
            this.rotationQuaternion = new Quaternion()
            scene.getEngine().initWebXRAsync()
            scene.onBeforeRenderObservable.add(()=>{
                this.getEngine()._xrPoseMatrix.getTranslationToRef(this.position)
                this.rotationQuaternion.fromRotationMatrix(this.getEngine()._xrPoseMatrix)
            })
        }

        public displayOnDevice(){
            let mirrorCanvas = document.createElement('canvas');
            let ctx = mirrorCanvas.getContext('xrpresent');
            mirrorCanvas.setAttribute('id', 'mirror-canvas');
            document.body.appendChild(mirrorCanvas);
        }
    }
}
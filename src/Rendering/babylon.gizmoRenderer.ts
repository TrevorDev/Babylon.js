module BABYLON {
    export class GizmoRenderer {
        gizmoScene:Scene
        constructor(private scene:Scene){
            var engine = scene.getEngine()
            this.gizmoScene = new BABYLON.Scene(engine);
            this.gizmoScene.clearColor = new BABYLON.Color4(0,0,0,0)
            this.gizmoScene.autoClear = false
            var yPosMesh = BABYLON.MeshBuilder.CreateCylinder("yPosMesh", {diameterTop:0, height: 2, tessellation: 96}, this.gizmoScene);
            yPosMesh.position.z = 5
            engine.scenes.pop()
        }
        render(){
            this.gizmoScene.activeCamera = this.scene.activeCamera
            
            this.gizmoScene.render()
        }
        dispose(){

        }
    }
} 
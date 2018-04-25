module BABYLON {
    export class GizmoRenderer {
        private gizmoScene:Scene
        constructor(private existingAppScene:Scene){
            // Create gizmo scene which will be rendered in the foreground and remove it from being referenced by engine to avoid interfering with existing app
            this.gizmoScene = new BABYLON.Scene(existingAppScene.getEngine());
            existingAppScene.getEngine().scenes.pop()
            var frontCamera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.gizmoScene);
            frontCamera.setTarget(BABYLON.Vector3.Zero());

            // Render directly on top of existing scene
            this.gizmoScene.clearColor = new BABYLON.Color4(0,0,0,0)
            this.gizmoScene.autoClear = false
            
            // Gizmo lighting
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.gizmoScene);

            // Drag gizmo logic (TODO move to existing class and use behaviors)
            var greenMat = new BABYLON.StandardMaterial("", this.gizmoScene)
            greenMat.diffuseColor = BABYLON.Color3.Green()
            var yPosMesh = BABYLON.MeshBuilder.CreateCylinder("yPosMesh", {diameterTop:0, height: 2, tessellation: 96}, this.gizmoScene);
            
            yPosMesh.scaling.scaleInPlace(0.1)
            yPosMesh.material = greenMat

            var selectedMesh:any = null

            var plane = BABYLON.Mesh.CreatePlane("", 100, this.gizmoScene, false, BABYLON.Mesh.DOUBLESIDE);
            plane.visibility = 0

            var dragAxis = new BABYLON.Vector3(0,1,0)

            this.gizmoScene.onPointerObservable.add((pointerInfo)=>{
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        // Main scene to enable/disable gizmo
                        var pickResult = existingAppScene.pick(pointerInfo.event.offsetX, pointerInfo.event.offsetY)
                        if(pickResult){
                            if (pickResult.hit && pickResult.pickedMesh) {
                                //console.log(pickResult)
                                selectedMesh = pickResult.pickedMesh
                                //yPosMesh.position.copyFrom(pickResult.pickedMesh.getAbsolutePosition())
                            }
                        }
                        // front scene for gizmo interactions
                        pickResult = this.gizmoScene.pick(pointerInfo.event.offsetX, pointerInfo.event.offsetY)
                        if(pickResult){
                            if (pickResult.hit && pickResult.pickedMesh) {
                                console.log("front")
                            }
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERUP:
                        
                        break;
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                    // front scene for gizmo interactions
                        var pickResult = this.gizmoScene.pick(pointerInfo.event.offsetX, pointerInfo.event.offsetY, (m)=>{return m == plane})
                        if(pickResult){
                            if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedPoint) {
                                //get the closest point on the dragaxis from the selected mesh to the picked point location
                                // https://www.opengl.org/discussion_boards/showthread.php/159717-Closest-point-on-a-Vector-to-a-point
                                var pos = dragAxis.clone().scaleInPlace(BABYLON.Vector3.Dot(pickResult.pickedPoint.subtract(selectedMesh.position), dragAxis))
                                selectedMesh.position.addInPlace(pos)//.y = pickResult.pickedPoint.y
                            }
                        }
                        break;
                }
            })

            existingAppScene.onAfterRenderObservable.add(()=>{
                if(selectedMesh && this.gizmoScene.activeCamera){
                    var camPos = this.gizmoScene.activeCamera.position
                    
                    var direction = selectedMesh.getAbsolutePosition().clone().subtract(camPos).normalize().scaleInPlace(3)
                    var newPose = camPos.add(direction)
                    yPosMesh.position.copyFrom(newPose)
                    
                    
                    // Calculate plane normal in direction of camera but perpendicular to drag axis
                    var pointA = selectedMesh.position // center
                    var pointB = pointA.add(dragAxis) // towards drag axis
                    var pointC = pointA.add(camPos.subtract(pointA).normalize()) // towards camera
                    // Get perpendicular line from direction to camera and drag axis
                    var lineA = pointB.subtract(pointA)
                    var lineB = pointC.subtract(pointA)
                    var perpLine = BABYLON.Vector3.Cross(lineA, lineB)
                    // Get perpendicular line from previous result and drag axis to adjust lineB to be perpendiculat to camera
                    var norm = BABYLON.Vector3.Cross(lineA, perpLine).normalize()

                    plane.position = pointA.clone()
                    plane.lookAt(pointA.add(norm))
                }
            })
        }
        render(){
            this.gizmoScene.activeCamera=this.existingAppScene.activeCamera
            this.gizmoScene.render()
        }
    }
} 
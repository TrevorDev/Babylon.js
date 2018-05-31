module BABYLON {
    /**
     * Bounding box gizmo
     */
    export class BoundingBoxGizmo extends Gizmo {
        private _dragBehavior:PointerDragBehavior;

        private lineBoundingBox:AbstractMesh;
        private rotateSpheresParent:AbstractMesh;
        private scaleBoxesParent:AbstractMesh;
        private _boundingDimensions = new BABYLON.Vector3(1,1,1);

        private _selectNode(selectedMesh:Nullable<Mesh>){
            this.rotateSpheresParent.getChildMeshes().forEach((m,i)=>{
                if(!selectedMesh){
                    m.isVisible = true;
                }else{
                    if(m != selectedMesh){
                        m.isVisible = false;
                    }
                }
            })
            this.scaleBoxesParent.getChildMeshes().forEach((m,i)=>{
                if(!selectedMesh){
                    m.isVisible = true;
                }else{
                    if(m != selectedMesh){
                        m.isVisible = false;
                    }
                }
            })
        }

        /**
         * Creates an BoundingBoxGizmo
         * @param gizmoLayer The utility layer the gizmo will be added to
         * @param dragAxis The axis which the gizmo will be able to drag on
         * @param color The color of the gizmo
         */
        constructor(gizmoLayer:UtilityLayerRenderer, dragAxis:Vector3, color:Color3){
            super(gizmoLayer);

            // Do not update the gizmo's scale so it has a fixed size to the object its attached to
            this._updateScale = false

            // Create Material
            var coloredMaterial = new BABYLON.StandardMaterial("", gizmoLayer.utilityLayerScene);
            coloredMaterial.disableLighting = true;
            coloredMaterial.emissiveColor = color;

            // Build bounding box out of lines
            this.lineBoundingBox = new BABYLON.AbstractMesh("", gizmoLayer.utilityLayerScene)
            this.lineBoundingBox.rotationQuaternion = new BABYLON.Quaternion();
            var lines = []
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(this._boundingDimensions.x,0,0)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,this._boundingDimensions.y,0)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,0,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(this._boundingDimensions.x,0,0), new BABYLON.Vector3(this._boundingDimensions.x,this._boundingDimensions.y,0)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(this._boundingDimensions.x,0,0), new BABYLON.Vector3(this._boundingDimensions.x,0,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,this._boundingDimensions.y,0), new BABYLON.Vector3(this._boundingDimensions.x,this._boundingDimensions.y,0)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,this._boundingDimensions.y,0), new BABYLON.Vector3(0,this._boundingDimensions.y,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,this._boundingDimensions.z), new BABYLON.Vector3(this._boundingDimensions.x,0,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,this._boundingDimensions.z), new BABYLON.Vector3(0,this._boundingDimensions.y,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(this._boundingDimensions.x,this._boundingDimensions.y,this._boundingDimensions.z), new BABYLON.Vector3(0,this._boundingDimensions.y,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(this._boundingDimensions.x,this._boundingDimensions.y,this._boundingDimensions.z), new BABYLON.Vector3(this._boundingDimensions.x,0,this._boundingDimensions.z)]}, gizmoLayer.utilityLayerScene));
            lines.push(BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(this._boundingDimensions.x,this._boundingDimensions.y,this._boundingDimensions.z), new BABYLON.Vector3(this._boundingDimensions.x,this._boundingDimensions.y,0)]}, gizmoLayer.utilityLayerScene));
            lines.forEach((l)=>{
                l.color = color
                l.position.addInPlace(new BABYLON.Vector3(-this._boundingDimensions.x/2,-this._boundingDimensions.y/2,-this._boundingDimensions.z/2))
                l.isPickable=false;
                this.lineBoundingBox.addChild(l)
            })
            this._rootMesh.addChild(this.lineBoundingBox)

            // Create rotation spheres
            this.rotateSpheresParent = new BABYLON.AbstractMesh("", gizmoLayer.utilityLayerScene)
            this.rotateSpheresParent.rotationQuaternion = new Quaternion();
            for(let i=0;i<12;i++){
                let sphere = BABYLON.MeshBuilder.CreateSphere("", {diameter: 0.1}, gizmoLayer.utilityLayerScene)
                sphere.rotationQuaternion = new Quaternion();
                    sphere.material = coloredMaterial
                    var _dragBehavior = new PointerDragBehavior({});
                    _dragBehavior.moveAttached = false;
                    sphere.addBehavior(_dragBehavior);

                    
                    _dragBehavior.onDragObservable.add((event)=>{
                        if(this.attachedMesh){
                            // get the spheres world right (Why is this already in world space :( )
                            console.log(this.rotateSpheresParent.getChildMeshes().indexOf(sphere))
                            var worldRight = sphere.forward//Vector3.TransformCoordinates(Vector3.Right(), sphere.parent!.getWorldMatrix().getRotationMatrix())
                            // project the world right on to the drag plane
                            var toSub = event.dragPlaneNormal.scale(Vector3.Dot(event.dragPlaneNormal, worldRight))
                            var dragAxis = worldRight.subtract(toSub).normalizeToNew()
                            // project drag delta on to the resulting drag axis and rotate based on that
                            var projectDist = Vector3.Dot(dragAxis, event.delta)
                            
                            // Rotate based on axis
                            if(i>=8){
                                this.attachedMesh.rotation.z -= projectDist;
                            }else if(i>=4){
                                this.attachedMesh.rotation.y -= projectDist;
                            }else{
                                this.attachedMesh.rotation.x -= projectDist;
                            }
                        }
                    })

                    // Selection/deselection
                    _dragBehavior.onDragStartObservable.add(()=>{
                        this._selectNode(sphere)
                    })
                    _dragBehavior.onDragEndObservable.add(()=>{
                        this._selectNode(null)
                    })
                
                

                

                this.rotateSpheresParent.addChild(sphere)
            }
            this._rootMesh.addChild(this.rotateSpheresParent)

            // Create scale cubes
            this.scaleBoxesParent = new BABYLON.AbstractMesh("", gizmoLayer.utilityLayerScene)
            this.scaleBoxesParent.rotationQuaternion = new Quaternion()
            for(var i=0;i<2;i++){
                for(var j=0;j<2;j++){
                    for(var k=0;k<2;k++){
                        let box = BABYLON.MeshBuilder.CreateBox("", {size: 0.1}, gizmoLayer.utilityLayerScene)
                        box.material = coloredMaterial

                        var _dragBehavior = new PointerDragBehavior({dragAxis: new BABYLON.Vector3(i==0?-1:1,j==0?-1:1,k==0?-1:1)});
                        _dragBehavior.moveAttached = false;
                        box.addBehavior(_dragBehavior);

                        _dragBehavior.onDragObservable.add((event)=>{
                            if(this.attachedMesh){
                                this.attachedMesh.scaling.addInPlace(event.delta);
                            }
                        })

                        // Selection/deselection
                        _dragBehavior.onDragStartObservable.add(()=>{
                            this._selectNode(box)
                        })
                        _dragBehavior.onDragEndObservable.add(()=>{
                            this._selectNode(null)
                        })

                        this.scaleBoxesParent.addChild(box)
                    }
                }
            }
            this._rootMesh.addChild(this.scaleBoxesParent)

            // Update bounding box positions
            this.gizmoLayer.originalScene.onBeforeRenderObservable.add(()=>{
                if(this.attachedMesh){
                    var boundingInfo = this.attachedMesh.getBoundingInfo().boundingBox;
                    var boundBoxDimensions = boundingInfo.maximum.subtract(boundingInfo.minimum).multiplyInPlace(this.attachedMesh.scaling)
                    this._boundingDimensions.copyFrom(boundBoxDimensions)
                    this.lineBoundingBox.scaling.copyFrom(this._boundingDimensions)
                    if(!this.attachedMesh.rotationQuaternion){
                        this.attachedMesh.rotationQuaternion = new BABYLON.Quaternion();
                    }
                    this.lineBoundingBox.rotationQuaternion!.copyFrom(this.attachedMesh.rotationQuaternion)
                    this.rotateSpheresParent.rotationQuaternion!.copyFrom(this.attachedMesh.rotationQuaternion)
                    this.scaleBoxesParent.rotationQuaternion!.copyFrom(this.attachedMesh.rotationQuaternion)
                    this.updateBoundingBox()
                }
            })
            this.updateBoundingBox()
        }

        private updateBoundingBox(){            
            var rotateSpheres = this.rotateSpheresParent.getChildMeshes();
            for(var i=0;i<3;i++){
                for(var j=0;j<2;j++){
                    for(var k=0;k<2;k++){
                        var index= ((i*4)+(j*2))+k
                        if(i==0){
                            rotateSpheres[index].position.set(this._boundingDimensions.x/2,this._boundingDimensions.y*j,this._boundingDimensions.z*k)
                            rotateSpheres[index].position.addInPlace(new BABYLON.Vector3(-this._boundingDimensions.x/2,-this._boundingDimensions.y/2,-this._boundingDimensions.z/2))
                            rotateSpheres[index].lookAt(Vector3.Cross(Vector3.Right(), rotateSpheres[index].position.normalizeToNew()).normalizeToNew().add(rotateSpheres[index].position))
                        }
                        if(i==1){
                            rotateSpheres[index].position.set(this._boundingDimensions.x*j,this._boundingDimensions.y/2,this._boundingDimensions.z*k)
                            rotateSpheres[index].position.addInPlace(new BABYLON.Vector3(-this._boundingDimensions.x/2,-this._boundingDimensions.y/2,-this._boundingDimensions.z/2))
                            rotateSpheres[index].lookAt(Vector3.Cross(Vector3.Up(), rotateSpheres[index].position.normalizeToNew()).normalizeToNew().add(rotateSpheres[index].position))
                        }
                        if(i==2){
                            rotateSpheres[index].position.set(this._boundingDimensions.x*j,this._boundingDimensions.y*k,this._boundingDimensions.z/2)
                            rotateSpheres[index].position.addInPlace(new BABYLON.Vector3(-this._boundingDimensions.x/2,-this._boundingDimensions.y/2,-this._boundingDimensions.z/2))
                            rotateSpheres[index].lookAt(Vector3.Cross(Vector3.Forward(), rotateSpheres[index].position.normalizeToNew()).normalizeToNew().add(rotateSpheres[index].position))
                        }
                    }
                }
            }

            var scaleBoxes = this.scaleBoxesParent.getChildMeshes()
            for(var i=0;i<2;i++){
                for(var j=0;j<2;j++){
                    for(var k=0;k<2;k++){
                        var index= ((i*4)+(j*2))+k
                        if(scaleBoxes[index]){
                            scaleBoxes[index].position.set(this._boundingDimensions.x*i,this._boundingDimensions.y*j,this._boundingDimensions.z*k)
                            scaleBoxes[index].position.addInPlace(new BABYLON.Vector3(-this._boundingDimensions.x/2,-this._boundingDimensions.y/2,-this._boundingDimensions.z/2))
                        }
                    }
                }
            }
        }

        protected _onInteractionsEnabledChanged(value:boolean){
            this._dragBehavior.enabled = value;
        }
        /**
         * Disposes of the gizmo
         */
        public dispose(){
            this._dragBehavior.detach();
            super.dispose();
        } 
    }
}
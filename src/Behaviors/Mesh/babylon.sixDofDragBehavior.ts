module BABYLON {
    /**
     * A behavior that when attached to a mesh will allow the mesh to be dragged around based on directiona and origin of the pointer's ray
     */
    export class SixDofDragBehavior implements Behavior<Mesh> {
        private static _virtualScene:Scene;
        private _ownerNode:Mesh;
        private _sceneRenderObserver:Nullable<Observer<Scene>> = null;
        private _scene:Scene;
        private _pointerObserver:Nullable<Observer<PointerInfo>>;
        // How much faster the object should move when its further away
        private _sixDofZDragFactor = 5;
        /**
         * If the behavior is currently in a dragging state
         */
        public dragging = false;
        /**
         * The id of the pointer that is currently interacting with the behavior (-1 when no pointer is active)
         */
        public currentDraggingPointerID = -1;


        constructor(){
        }
        
        /**
         *  The name of the behavior
         */
        public get name(): string {
            return "SixDofDrag";
        }

        /**
         *  Initializes the behavior
         */
        public init() {}

        /**
         * Attaches the scale behavior the passed in mesh
         * @param ownerNode The mesh that will be scaled around once attached
         */
        public attach(ownerNode: Mesh): void {
            this._ownerNode = ownerNode;
            this._scene = this._ownerNode.getScene();
            if(!SixDofDragBehavior._virtualScene){
                SixDofDragBehavior._virtualScene = new BABYLON.Scene(this._scene.getEngine());
                this._scene.getEngine().scenes.pop();
            }
        
            var delta = new BABYLON.Vector3(0,0,0);
            var pickedMesh:Nullable<AbstractMesh> = null;
            var lastSixDofOriginPosition = new BABYLON.Vector3(0,0,0);

            // Setup virtual meshes to be used for dragging without dirtying the existing scene
            var virtualOriginMesh = new BABYLON.AbstractMesh("", SixDofDragBehavior._virtualScene)
            virtualOriginMesh.rotationQuaternion = new Quaternion();
            var virtualDragMesh = new BABYLON.AbstractMesh("", SixDofDragBehavior._virtualScene)
            virtualDragMesh.rotationQuaternion = new Quaternion();

            var pickPredicate = (m:AbstractMesh)=>{
                return this._ownerNode == m || m.isDescendantOf(this._ownerNode)
            }
            
            this._pointerObserver = this._scene.onPointerObservable.add((pointerInfo, eventState)=>{                
                if (pointerInfo.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                    if(!this.dragging && pointerInfo.pickInfo && pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh && pointerInfo.pickInfo.ray && pickPredicate(pointerInfo.pickInfo.pickedMesh)){
                        pickedMesh = pointerInfo.pickInfo.pickedMesh
                        lastSixDofOriginPosition.copyFrom(pointerInfo.pickInfo.ray.origin)

                        // Set position and orientation of the controller
                        virtualOriginMesh.position.copyFrom(pointerInfo.pickInfo.ray.origin)
                        virtualOriginMesh.lookAt(pointerInfo.pickInfo.ray.origin.subtract(pointerInfo.pickInfo.ray.direction))

                        // Attach the virtual drag mesh to the virtual origin mesh so it can be dragged
                        virtualOriginMesh.removeChild(virtualDragMesh)
                        virtualDragMesh.position.copyFrom(pickedMesh.absolutePosition)
                        if(!pickedMesh.rotationQuaternion){
                            pickedMesh.rotationQuaternion = new Quaternion();
                        }
                        virtualDragMesh.rotationQuaternion!.copyFrom(pickedMesh.rotationQuaternion)
                        virtualOriginMesh.addChild(virtualDragMesh)

                        // Update state
                        this.dragging = true;
                        this.currentDraggingPointerID = (<PointerEvent>pointerInfo.event).pointerId;
                    }
                }else if(pointerInfo.type == BABYLON.PointerEventTypes.POINTERUP){
                    if(this.currentDraggingPointerID == (<PointerEvent>pointerInfo.event).pointerId){
                        this.dragging = false;
                        this.currentDraggingPointerID = -1;
                        pickedMesh = null;
                        virtualOriginMesh.removeChild(virtualDragMesh);
                    }
                }else if(pointerInfo.type == BABYLON.PointerEventTypes.POINTERMOVE){
                    if(this.currentDraggingPointerID == (<PointerEvent>pointerInfo.event).pointerId && this.dragging && pointerInfo.pickInfo && pointerInfo.pickInfo.ray && pickedMesh){
                        // Calculate controller drag distance in controller space
                        var originDragDifference = pointerInfo.pickInfo.ray.origin.subtract(lastSixDofOriginPosition);
                        lastSixDofOriginPosition.copyFrom(pointerInfo.pickInfo.ray.origin);
                        var localOriginDragDifference = Vector3.TransformCoordinates(originDragDifference, Matrix.Invert(virtualOriginMesh.getWorldMatrix().getRotationMatrix()));
                        
                        virtualOriginMesh.addChild(virtualDragMesh);
                        // Determine how much the controller moved to/away towards the dragged object and use this to move the object further when its further away
                        var zDragDistance = Vector3.Dot(localOriginDragDifference, virtualOriginMesh.position.normalizeToNew());
                        virtualDragMesh.position.z -= virtualDragMesh.position.z < 1 ? zDragDistance : zDragDistance*this._sixDofZDragFactor*virtualDragMesh.position.z;
                        if(virtualDragMesh.position.z < 0){
                            virtualDragMesh.position.z = 0;
                        }
                        
                        // Update the controller position
                        virtualOriginMesh.position.copyFrom(pointerInfo.pickInfo.ray.origin);
                        virtualOriginMesh.lookAt(pointerInfo.pickInfo.ray.origin.subtract(pointerInfo.pickInfo.ray.direction));
                        virtualOriginMesh.removeChild(virtualDragMesh)
                    
                        // Move the virtualObjectsPosition into the picked mesh's space if needed
                        var virtualPositionInPickedMeshSpace = virtualDragMesh.absolutePosition;
                        if(pickedMesh.parent){
                            virtualPositionInPickedMeshSpace = Vector3.TransformCoordinates(virtualPositionInPickedMeshSpace, Matrix.Invert(pickedMesh.parent.getWorldMatrix()));
                        }
                        var dragStart = pickedMesh.absolutePosition.clone();
                        // Slowly move mesh to avoid jitter
                        pickedMesh.position.addInPlace(virtualPositionInPickedMeshSpace.subtract(pickedMesh.position).scale(0.2));
                        pickedMesh.absolutePosition.subtractToRef(dragStart, delta);
                    }
                }
            });

            // On every frame move towards target scaling to avoid jitter caused by vr controllers
            this._sceneRenderObserver = ownerNode.getScene().onBeforeRenderObservable.add(()=>{
                if(this.dragging && pickedMesh){

                }
            });

        }
        /**
         *  Detaches the behavior from the mesh
         */
        public detach(): void {
            this._ownerNode.getScene().onBeforeRenderObservable.remove(this._sceneRenderObserver);
        }
    }
}
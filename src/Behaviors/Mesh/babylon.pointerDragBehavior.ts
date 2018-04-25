module BABYLON {
    export class FarDragAction implements BehaviorAction {
        public get name(): string {
            return "Dragable";
        }

        execute(n: Node, propertyBag: any){
            alert("Action")
        }
    }
    export class PointerDragBehavior implements Behavior<Mesh> {
        
        constructor() {
        }
        
        public get name(): string {
            return "Dragable";
        }

        public dragStartAction:Nullable<BehaviorAction> = null;

        private _attachedNode: Node;  
        private _dragPlaneMode: DragPlaneMode = DragPlaneMode.XZ;   
        private _maxDragU: number = 100;
        private _maxDragV: number = 100;
        // ToDo
        // Add visibility option for the constraint plane 
        // and a material property to set the plane to something that looks like a grid
        // Also: Make the plane and the drag mesh render on top of everything during dragging 

        // Make sure this pointer is captured properly
        private _startCallback = () => this.startCallback();
        private _endCallback = () => this.endCallback();
        private _moveCallback = () => this.moveCallback();
        
        public init() {}

        /**
		* Sets the constraint plane for the dragging 
		*/
		public set dragPlaneMode(dpm: DragPlaneMode) {
            this._dragPlaneMode = dpm;
		}

        /**
		* Gets the constraint plane for the dragging 
		*/
		public get dragPlaneMode(): DragPlaneMode {
            return this._dragPlaneMode;
		}

        /**
		* Sets the maximum drag range in u. That is: X for XY and XZ, and Z for YZ 
		*/
		public set maxDragU(maxu: number) {
            this._maxDragU = maxu;
		}

        /**
		* Sets the maximum drag range in u. That is: X for XY and XZ, and Z for YZ 
		*/
		public get maxDragU(): number {
            return this._maxDragU;
		}

        /**
		* Sets the maximum drag range in u. That is: Y for XY, Z for XZ, and Y for YZ 
		*/
		public set maxDragV(maxv: number) {
            this._maxDragV = maxv;
		}

        /**
		* Sets the maximum drag range in u. That is: Y for XY, Z for XZ, and Y for YZ 
		*/
		public get maxDragV(): number {
            return this._maxDragV;
		}
        
        private pointerObserver:Nullable<Observer<PointerInfo>> = null

        // Default behavior functions

        public attach(ownerNode: Node): void {
            this._attachedNode = ownerNode;
            this.pointerObserver = this._attachedNode.getScene().onPointerObservable.add((pointerInfo)=>{
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        this.startCallback();
                        break;
                    case BABYLON.PointerEventTypes.POINTERUP:
                        this.endCallback()
                        break;
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        this.moveCallback();
                        break;
                }
            })
        }
             
        public detach(): void {
            this._attachedNode.getScene().onPointerObservable.remove(this.pointerObserver)
		}

        private _dragging: boolean = false;
        private _dragMesh: Mesh;
        private _targetPlane: Mesh;

        private startCallback() {
            if (!this._attachedNode)
                return;
           this._dragMesh = this._attachedNode as Mesh;
           if (!this._dragMesh) 
                return;
            var scene = this._attachedNode.getScene();
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult && pickResult.hit) {
                if (pickResult.pickedMesh === this._attachedNode) {
                    this._dragging = true;
                    if(this.dragStartAction){
                        this.dragStartAction.execute(pickResult.pickedMesh, {})
                    }
                    //this._x = scene.pointerX;
                    //this._y = scene.pointerY;
                    // Create the constraint plane
                    this._targetPlane = Mesh.CreatePlane("cPlane", 1, scene, false, BABYLON.Mesh.DOUBLESIDE);
                    this._targetPlane.scaling = new Vector3(this._maxDragU, this._maxDragV, 1);
                    this._targetPlane.position = this._dragMesh.getAbsolutePosition().clone();
                    this._targetPlane.isVisible = false;
                    switch (this._dragPlaneMode)
                    {
                        case DragPlaneMode.XY:
                            // default orientation of the plane
                        break;
                        case DragPlaneMode.XZ:                
                            this._targetPlane.rotation = new Vector3(Math.PI/2, 0, 0);
                        break;
                        case DragPlaneMode.YZ:
                            this._targetPlane.rotation = new Vector3(0, Math.PI/2, 0);
                        break;
                        case DragPlaneMode.View:
                            if (scene.activeCamera)
                                this._targetPlane.lookAt(scene.activeCamera.position);
                        break;
                    }
                }
            }       

        }

        private endCallback() {
            this._dragging = false;
            this._attachedNode.getScene().removeMesh(this._targetPlane);
        }

        private moveCallback() {
            if (this._dragging === false)
                return;
            if (!this._dragMesh) 
                return;
            var scene = this._attachedNode.getScene();
            var pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => { return (mesh===this._targetPlane)} );
            if (pickResult && pickResult.hit) {
                if (pickResult.pickedMesh === this._targetPlane && pickResult.pickedPoint) {
                    var curPose = this._dragMesh.absolutePosition.clone()
                    curPose.y = pickResult.pickedPoint.y
                    this._dragMesh.setAbsolutePosition(curPose);
                }
            }
        }
    }

    export enum DragPlaneMode {
        XY,
        XZ,
        YZ,
        X,
        Y,
        Z,
        View
    }


    export class MeshGizmo {
        mesh: AbstractMesh

        xPosMesh: Mesh
        yPosMesh: Mesh
        zPosMesh: Mesh

        selected: Mesh
        
        constructor(scene:Scene){
            this.mesh = new AbstractMesh("MeshGizmo", scene)
            var greenMat = new BABYLON.StandardMaterial("", scene)
            greenMat.diffuseColor = BABYLON.Color3.Green()
            var redMat = greenMat.clone("")
            redMat.diffuseColor = BABYLON.Color3.Red()
            var blueMat = greenMat.clone("")
            blueMat.diffuseColor = BABYLON.Color3.Blue()

            this.yPosMesh = BABYLON.MeshBuilder.CreateCylinder("yPosMesh", {diameterTop:0, height: 2, tessellation: 96}, scene);
            this.yPosMesh.scaling.scaleInPlace(0.1)
            this.yPosMesh.position.y += 0.5
            this.yPosMesh.material = greenMat
            this.yPosMesh.renderingGroupId = 1;
            this.xPosMesh = BABYLON.MeshBuilder.CreateCylinder("xPosMesh", {diameterTop:0, height: 2, tessellation: 96}, scene);
            this.xPosMesh.scaling.scaleInPlace(0.1)
            this.xPosMesh.rotation.z=-Math.PI/2
            this.xPosMesh.position.x += 0.5
            this.xPosMesh.material = blueMat
            this.xPosMesh.renderingGroupId = 1;
            this.zPosMesh = BABYLON.MeshBuilder.CreateCylinder("zPosMesh", {diameterTop:0, height: 2, tessellation: 96}, scene);
            this.zPosMesh.scaling.scaleInPlace(0.1)
            this.zPosMesh.rotation.x=Math.PI/2
            this.zPosMesh.position.z += 0.5
            this.zPosMesh.material = redMat
            this.zPosMesh.renderingGroupId = 1;

            this.mesh.addChild(this.xPosMesh)
            this.mesh.addChild(this.yPosMesh)
            this.mesh.addChild(this.zPosMesh)

            var b = new BABYLON.PointerDragBehavior()
            b.dragPlaneMode = DragPlaneMode.Y
            this.yPosMesh.addBehavior(b)

            this.mesh.isVisible = false

            this.mesh.position.y = 5

            scene.onPointerObservable.add((info)=>{
                var pickResult = scene.pick(info.event.offsetX, info.event.offsetY, (m)=>{return this.mesh.getChildren().indexOf(m) == -1})
                if(pickResult && info.type == PointerEventTypes.POINTERDOWN){
                    if (pickResult.hit && pickResult.pickedMesh) {
                        this.mesh.position.copyFrom(pickResult.pickedMesh.getAbsolutePosition())
                    }
                }

                // pickResult = scene.pick(info.event.offsetX, info.event.offsetY, (m)=>{return this.mesh.getChildren().indexOf(m) != -1})
                // if(pickResult && info.type == PointerEventTypes.POINTERDOWN){
                //     if (pickResult.hit && pickResult.pickedMesh) {
                //         pickResult.pickedMesh.material = null
                //     }
                // }
            })
            // scene.onPointerDown = (evt, pickResult) => {
            //     // if the click hits the ground object, we change the impact position
            //     if (pickResult.hit && pickResult.pickedMesh) {
            //         this.mesh.position.copyFrom(pickResult.pickedMesh.position)
            //     }
            // };
        }
    }
}
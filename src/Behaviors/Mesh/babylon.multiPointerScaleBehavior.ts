module BABYLON {
    /**
     * A behavior that when attached to a mesh will allow the mesh to be scaled
     */
    export class MultiPointerScaleBehavior implements Behavior<Mesh> {
        private dragBehaviorA:PointerDragBehavior;
        private dragBehaviorB:PointerDragBehavior;
        private startDistance = 0;
        private initialScale = new Vector3(0,0,0);
        private targetScale = new Vector3(0,0,0);
        
        constructor(){
        }
        
        /**
         *  The name of the behavior
         */
        public get name(): string {
            return "MultiPointerScale";
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
            var dragOne = new BABYLON.PointerDragBehavior({});
            dragOne.moveAttached = false;
            var dragTwo = new BABYLON.PointerDragBehavior({});
            dragTwo.moveAttached = false;
            
            var startDistance = 0;
            var initialScale = ownerNode.scaling.clone();
            var targetScale = initialScale.clone();

            var getCurrentDistance = ()=>{
                return dragOne.lastDragPosition.subtract(dragTwo.lastDragPosition).length();
            }

            dragOne.onDragStartObservable.add((e)=>{
                if(dragOne.dragging && dragTwo.dragging){
                    if(dragOne.currentDraggingPointerID == dragTwo.currentDraggingPointerID){
                        dragOne.releaseDrag();
                    }else{
                        initialScale.copyFrom(ownerNode.scaling)
                        startDistance = getCurrentDistance();
                    }
                }
            });
            dragTwo.onDragStartObservable.add((e)=>{
                if(dragOne.dragging && dragTwo.dragging){
                    if(dragOne.currentDraggingPointerID == dragTwo.currentDraggingPointerID){
                        dragTwo.releaseDrag();
                    }else{
                        initialScale.copyFrom(ownerNode.scaling)
                        startDistance = getCurrentDistance();
                    }
                }
            });

            dragOne.onDragObservable.add(()=>{
                if(dragOne.dragging && dragTwo.dragging){
                    var ratio = getCurrentDistance()/startDistance;
                    initialScale.scaleToRef(ratio, targetScale);
                }
            });
            dragTwo.onDragObservable.add(()=>{
                if(dragOne.dragging && dragTwo.dragging){
                    var ratio = getCurrentDistance()/startDistance;
                    initialScale.scaleToRef(ratio, targetScale);
                }
            });

            ownerNode.addBehavior(dragOne)
            ownerNode.addBehavior(dragTwo)

            ownerNode.getScene().onBeforeRenderObservable.add(()=>{
                if(dragOne.dragging && dragTwo.dragging){
                    var change = targetScale.subtract(ownerNode.scaling).scaleInPlace(0.1)
                    if(change.length()>0.1){
                        ownerNode.scaling.addInPlace(change)
                    }
                }
            })

        }
        /**
         *  Detaches the behavior from the mesh
         */
        public detach(): void {
        }
    }
}
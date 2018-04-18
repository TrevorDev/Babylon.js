module BABYLON {
    export class BehaviorActionList {
        
		/**
		* Executes the actions in the list
		*/
		public executeList(n: Node, propertyBag: any) {
            this._actions.forEach(element => {
                element.execute(n, propertyBag);
            });
		}

		constructor() {
            
        }

        private _actions = new Array<BehaviorAction>();

        public addBehaviorAction(action: BehaviorAction) {
            var index = this._actions.indexOf(action);

            if (index !== -1) {
                return;
            }

            this._actions.push(action);
        }

        public removeBehavior(action: BehaviorAction) {
            var index = this._actions.indexOf(action);

            if (index === -1) {
                return;
            } 

            this._actions.splice(index, 1);

            return this;
        }     
        
        public get behaviorActions(): BehaviorAction[] {
            return this._actions;
        }

        public getBehaviorActionByName(name: string): BehaviorAction | null {
            for (var action of this._actions) {
                if (action.name === name) {
                    return action;
                }
            }

            return null;
        }
    }
}
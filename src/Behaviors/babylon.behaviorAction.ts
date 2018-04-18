module BABYLON {
    export interface BehaviorAction {
        name: string;

        execute(n: Node, propertyBag: any) : any;
    }
}
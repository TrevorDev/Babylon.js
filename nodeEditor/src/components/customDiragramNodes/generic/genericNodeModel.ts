import { NodeModel } from "storm-react-diagrams";
import { Nullable } from 'babylonjs/types';
import { NodeMaterialBlock } from 'babylonjs/Materials/Node/nodeMaterialBlock';

export class GenericNodeModel extends NodeModel {
	public block:Nullable<NodeMaterialBlock> = null;
	public headerLabels:Array<{text: string}> = []
	public textureInputs:Array<{text: string, initialValue: string}> = []

	constructor() {
		super("generic");
		//this.addPort(new GenericPortModel("right"));
	}

}
import { LinkModel, PortModel, DefaultLinkModel } from "storm-react-diagrams";
import { Nullable } from 'babylonjs/types';
import { NodeMaterialConnectionPoint } from 'babylonjs/Materials/Node/nodeMaterialBlockConnectionPoint';


export class GenericPortModel extends PortModel {
	position: string | "input" | "output";
	connection: Nullable<NodeMaterialConnectionPoint> = null;
	static idCounter = 0;

	constructor(public label:string, type: string = "input") {
		//(""+GenericPortModel.idCounter)
		super(label, "generic");
		this.position = type;
		GenericPortModel.idCounter++;
	}

	// serialize() {
	// 	return _.merge(super.serialize(), {
	// 		position: this.position
	// 	});
	// }

	// deSerialize(data: any, engine: DiagramEngine) {
	// 	super.deSerialize(data, engine);
	// 	this.position = data.position;
	// }

	link(outPort:GenericPortModel){
		var link = this.createLinkModel()
		link.setSourcePort(this)
		link.setTargetPort(outPort)
		return link;
	}

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}
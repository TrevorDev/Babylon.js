import { LinkModel, PortModel, DefaultLinkModel } from "storm-react-diagrams";
import { Nullable, NodeMaterialConnectionPoint } from 'babylonjs';

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

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}
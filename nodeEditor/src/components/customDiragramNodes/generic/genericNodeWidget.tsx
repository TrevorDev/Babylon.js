import * as React from "react";
import { PortWidget } from "storm-react-diagrams";
import { Nullable } from 'babylonjs/types';
import { GenericNodeModel } from './genericNodeModel';
import { GenericPortModel } from './genericPortModel';

export interface GenericNodeWidgetProps {
	node: Nullable<GenericNodeModel>;
}

export interface GenericNodeWidgetState {}


export class GenericNodeWidget extends React.Component<GenericNodeWidgetProps, GenericNodeWidgetState> {

	constructor(props: GenericNodeWidgetProps) {
		super(props);
		this.state = {}
	}

	render() {
		var headers = new Array<JSX.Element>()
		var inputPorts = new Array<JSX.Element>()
		var outputPorts = new Array<JSX.Element>()
		if(this.props.node){
			// Header labels
			this.props.node.headerLabels.forEach((h, i)=>{
				headers.push(<div style={{fontWeight: "bold", borderBottomStyle: "solid"}} key={i}>{h.text}</div>)
			})

			// Input/Output ports
			for(var key in this.props.node.ports){
				var port = this.props.node.ports[key] as GenericPortModel;
				if(port.position == "input"){
					var control = <div></div>

					var color = "black"
					if(port.connection){
						if(port.connection.isAttribute){
							color = "red"
						}else if(port.connection.isUniform){
							color = "brown"
						}
						else if(port.connection.isVarying){
							color = "purple"
						}
					}
					// if(port.connection && (port.connection.type & NodeMaterialBlockConnectionPointTypes.Vector3OrColor3OrVector4OrColor4)){
					// 	if(!port.connection.value){
					// 		port.connection.value = new Vector4(0,2,0,0)
					// 	}
					// 	control = (
					// 		<div>
					// 			x:{port.connection.value.x} y:{port.connection.value.y} z:{port.connection.value.z} w:{port.connection.value.w}
					// 		</div>
					// 	)
					// }

					inputPorts.push(
						<div key={key}>
							<div style={{display: "inline-block", borderStyle: "solid", marginBottom: "-4px", position: "absolute", left: "-10px", background: "#777777"}}>
								<PortWidget key={key} name={port.name} node={this.props.node} />
							</div>
							<div style={{display: "inline-block", color: color}}>
								{port.label} 
							</div>
							{control}
						</div>
					)
				}else{
					outputPorts.push(
						<div key={key}>
							<div style={{display: "inline-block"}}>
								{port.label}
							</div>
							<div style={{display: "inline-block", borderStyle: "solid", marginBottom: "-4px", position: "absolute", right: "-10px", background: "#777777"}}>
								<PortWidget key={key} name={port.name} node={this.props.node} />
							</div>
						</div>
					)
				}
				
			}
		}

		return (
			<div style={{background: "white", borderStyle: "solid", padding: "10px"}}>
				{headers}
				
				{/* <img src="../Playground/textures/bloc.jpg" width="30px"></img> */}
				{inputPorts}
				{outputPorts}
			</div>
		);
	}
}
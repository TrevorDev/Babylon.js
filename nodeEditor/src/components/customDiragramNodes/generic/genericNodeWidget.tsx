import * as React from "react";
import { PortWidget } from "storm-react-diagrams";
import { Nullable } from 'babylonjs/types';
import { GenericNodeModel } from './genericNodeModel';
import { GenericPortModel } from './genericPortModel';
import { Texture, Tools } from 'babylonjs';
import {TextureLineComponent} from "../../../../../inspector/src/components/actionTabs/lines/textureLineComponent"
import {FileButtonLineComponent} from "../../../../../inspector/src/components/actionTabs/lines/fileButtonLineComponent"

export interface GenericNodeWidgetProps {
	node: Nullable<GenericNodeModel>;
}

export interface GenericNodeWidgetState {}


export class GenericNodeWidget extends React.Component<GenericNodeWidgetProps, GenericNodeWidgetState> {

	constructor(props: GenericNodeWidgetProps) {
		super(props);
		this.state = {}
	}

	// componentDidUpdate() {
	// 	this.updateTexture()
	// }

	// componentDidMount() {
	// 	this.updateTexture()
	// }


	replaceTexture(file: File) {
		if(!this.props.node){
			return;
		}
        const texture = this.props.node.textures[0];
        Tools.ReadFile(file, (data) => {
            var blob = new Blob([data], { type: "octet/stream" });
            var url = URL.createObjectURL(blob);

            if (texture.isCube) {
                let extension: string | undefined = undefined;
                if (file.name.toLowerCase().indexOf(".dds") > 0) {
                    extension = ".dds";
                } else if (file.name.toLowerCase().indexOf(".env") > 0) {
                    extension = ".env";
                }

                (texture as Texture).updateURL(url, extension, () => this.forceUpdate());
            } else {
                (texture as Texture).updateURL(url, null, () => this.forceUpdate());
            }
			(this.refs.textureView as TextureLineComponent).updatePreview()
        }, undefined, true);
    }

	render() {
		var headers = new Array<JSX.Element>()
		var inputPorts = new Array<JSX.Element>()
		var outputPorts = new Array<JSX.Element>()
		var texture = <div></div>
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

			this.props.node.textures.forEach((t)=>{
				texture = (
					<div>
						<TextureLineComponent ref="textureView" width={100} height={100} texture={t} hideChannelSelect={true}/>
						<FileButtonLineComponent label="" onClick={(file) => this.replaceTexture(file)} accept=".jpg, .png, .tga, .dds, .env" />
					</div>
				)
			})
		}

		return (
			<div style={{background: "white", borderStyle: "solid", padding: "10px"}}>
				{headers}
				
				{/* <img src="../Playground/textures/bloc.jpg" width="30px"></img> */}
				{inputPorts}
				{outputPorts}
				{texture}
				
			</div>
		);
	}
}
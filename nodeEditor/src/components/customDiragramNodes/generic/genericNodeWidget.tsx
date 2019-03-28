import * as React from "react";
import { PortWidget } from "storm-react-diagrams";
import { Nullable } from 'babylonjs/types';
import { GenericNodeModel } from './genericNodeModel';
import { GenericPortModel } from './genericPortModel';
import { PostProcess, PassPostProcess, Texture, Constants, PassCubePostProcess, RenderTargetTexture } from 'babylonjs';

export interface GenericNodeWidgetProps {
	node: Nullable<GenericNodeModel>;
}

export interface GenericNodeWidgetState {}


export class GenericNodeWidget extends React.Component<GenericNodeWidgetProps, GenericNodeWidgetState> {

	constructor(props: GenericNodeWidgetProps) {
		super(props);
		this.state = {}
	}

	componentDidUpdate() {
		this.updateTexture()
	}

	componentDidMount() {
		this.updateTexture()
	}
	
	updateTexture(){
		const previewCanvas = this.refs.canvas as HTMLCanvasElement;

		if(this.props.node && previewCanvas){
			var texture = this.props.node.textures[0];
			if(!texture.isReady()){
				texture.onLoadObservable.addOnce(()=>{
					this.updateTexture()
				})
				return;
			}
			var scene = texture.getScene()!;
			var engine = scene.getEngine();
			var size = texture.getSize();
			var ratio = size.width / size.height;
			var width = 100;
			var height = 100;
			
			let passPostProcess: PostProcess;

			if (!texture.isCube) {
				passPostProcess = new PassPostProcess("pass", 1, null, Texture.NEAREST_SAMPLINGMODE, engine, false, Constants.TEXTURETYPE_UNSIGNED_INT);
			} else {
				return
				// var passCubePostProcess = new PassCubePostProcess("pass", 1, null, Texture.NEAREST_SAMPLINGMODE, engine, false, Constants.TEXTURETYPE_UNSIGNED_INT);
				// passCubePostProcess.face = this.state.face;

				// passPostProcess = passCubePostProcess;
			}

			if (!passPostProcess.getEffect().isReady()) {
				// Try again later
				passPostProcess.dispose();

				//setTimeout(() => this.updatePreview(), 250);

				return;
			}

			const previewCanvas = this.refs.canvas as HTMLCanvasElement;

			//this.props.globalState.blockMutationUpdates = true;
			let rtt = new RenderTargetTexture(
				"temp",
				{ width: width, height: height },
				scene, false);

			passPostProcess.onApply = function(effect) {
				effect.setTexture("textureSampler", texture);
			};

			let internalTexture = rtt.getInternalTexture();

			if (internalTexture) {
				scene.postProcessManager.directRender([passPostProcess], internalTexture);

				// Read the contents of the framebuffer
				var numberOfChannelsByLine = width * 4;
				var halfHeight = height / 2;

				//Reading datas from WebGL
				var data = engine.readPixels(0, 0, width, height);

				// if (!texture.isCube) {
				// 	if (!this.state.displayRed || !this.state.displayGreen || !this.state.displayBlue) {
				// 		for (var i = 0; i < width * height * 4; i += 4) {

				// 			if (!this.state.displayRed) {
				// 				data[i] = 0;
				// 			}

				// 			if (!this.state.displayGreen) {
				// 				data[i + 1] = 0;
				// 			}

				// 			if (!this.state.displayBlue) {
				// 				data[i + 2] = 0;
				// 			}

				// 			if (this.state.displayAlpha) {
				// 				var alpha = data[i + 2];
				// 				data[i] = alpha;
				// 				data[i + 1] = alpha;
				// 				data[i + 2] = alpha;
				// 				data[i + 2] = 0;
				// 			}
				// 		}
				// 	}
				// }

				//To flip image on Y axis.
				if ((texture as Texture).invertY || texture.isCube) {
					for (var i = 0; i < halfHeight; i++) {
						for (var j = 0; j < numberOfChannelsByLine; j++) {
							var currentCell = j + i * numberOfChannelsByLine;
							var targetLine = height - i - 1;
							var targetCell = j + targetLine * numberOfChannelsByLine;

							var temp = data[currentCell];
							data[currentCell] = data[targetCell];
							data[targetCell] = temp;
						}
					}
				}

				previewCanvas.width = width;
				previewCanvas.height = height;
				var context = previewCanvas.getContext('2d');

				if (context) {
					// Copy the pixels to the preview canvas
					var imageData = context.createImageData(width, height);
					var castData = imageData.data;
					castData.set(data);
					context.putImageData(imageData, 0, 0);
				}

				// Unbind
				engine.unBindFramebuffer(internalTexture);
			}

			rtt.dispose();
			passPostProcess.dispose();
		}
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

			this.props.node.textures.forEach(()=>{
				texture = (
					<div>
						<canvas width="100" height="100" ref="canvas" className="preview" />
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
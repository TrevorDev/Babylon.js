import {
	DiagramEngine,
	DiagramModel,
	DefaultNodeModel,
	//LinkModel,
	DiagramWidget
} from "storm-react-diagrams";

import * as React from "react";
import { GlobalState } from '../globalState';

import { GenericNodeFactory } from './customDiragramNodes/generic/genericNodeFactory';
import { NodeMaterialBlockConnectionPointTypes } from 'babylonjs/Materials/Node/nodeMaterialBlockConnectionPointTypes';
import { GenericNodeModel } from './customDiragramNodes/generic/genericNodeModel';
import { GenericPortModel } from './customDiragramNodes/generic/genericPortModel';
require("storm-react-diagrams/dist/style.min.css");
//require("storm-react-diagrams/dist/style.min.css");


interface IGraphEditorProps {
    globalState: GlobalState;
}

export class GraphEditor extends React.Component<IGraphEditorProps> {
    engine:DiagramEngine;
    model: DiagramModel;

    nodes = new Array<any>();

    rowPos = new Array<number>()
    
    /**
     * Creates a node and recursivly creates its parent nodes from it's input
     * @param object 
     */
    public createNodeFromObject(object:any, options:{column:number}){
        // Update rows/columns
        if(this.rowPos[options.column] == undefined){
            this.rowPos[options.column] = 0;
        }else{
            this.rowPos[options.column]++;
        }

        // Create new node in the graph
        console.log("creating: "+object.getClassName())
        var outputNode = new GenericNodeModel();
        outputNode.block = object
        this.nodes.push(outputNode)
        outputNode.headerLabels.push({text: object.getClassName()})
        outputNode.setPosition(1500-(300*options.column), 200*this.rowPos[options.column])
        this.model.addAll(outputNode);
        // if(object.getClassName() == VertexOutputBlock.prototype.getClassName()){
        //     outputNode.headerLabels.push({text: "VertexOutputBlock"})
        // }

        // Create output ports
        object._outputs.forEach((connection:any)=>{
            outputNode.addPort(new GenericPortModel(connection.name, "output"))
        })

        // Create input ports and nodes if they don't exist yet
        object._inputs.forEach((connection:any)=>{
            var newPort = new GenericPortModel(connection.name, "input");
            newPort.connection = connection;
            outputNode.addPort(newPort)
            
            if(connection._connectedPoint){
                var connectedNode;
                var existingNodes = this.nodes.filter((n)=>{return n.block == connection._connectedPoint._ownerBlock});
                if(existingNodes.length == 0){
                    connectedNode = this.createNodeFromObject(connection._connectedPoint._ownerBlock, {column: options.column+1});
                }else{
                    connectedNode = existingNodes[0];
                }
                var port = outputNode.getPort(connection.name)//.addLink(connectedNode.ports[connection._connectedPoint.name])
                if(port){
                    var link = port.createLinkModel()
                    if(link){
                        link.setSourcePort(port)
                        link.setTargetPort(connectedNode.ports[connection._connectedPoint.name])
                        this.model.addAll(link)
                    }
                }
            }else if(connection.type == NodeMaterialBlockConnectionPointTypes.Texture){
                var localNode = new GenericNodeModel();
                localNode.headerLabels.push({text: "Texture"})
                var outPort = new GenericPortModel("Texture", "output");
                localNode.addPort(outPort)
                this.model.addAll(localNode);

                var port = outputNode.getPort(connection.name)
                if(port){
                    var link = port.createLinkModel()
                    if(link){
                        link.setSourcePort(port)
                        link.setTargetPort(outPort)
                        this.model.addAll(link)
                    }
                }
            }
        })
        
    
        return outputNode;
    }

    constructor(props: IGraphEditorProps) {
        super(props);
        

        // setup the diagram engine
        this.engine = new DiagramEngine();
        this.engine.installDefaultFactories()
        this.engine.registerNodeFactory(new GenericNodeFactory());

        // setup the diagram model
        this.model = new DiagramModel();

        // Load graph of nodes from the material
        if(this.props.globalState.nodeMaterial){
            var material:any = this.props.globalState.nodeMaterial;
            material._vertexOutputNodes.forEach((n:any)=>{
                this.createNodeFromObject(n, {column: 0});
            })
            material._fragmentOutputNodes.forEach((n:any)=>{
                this.createNodeFromObject(n, {column: 0});
            })
        }

        // load model into engine
        this.engine.setDiagramModel(this.model);

        console.log(this.engine)
    }

    addNode(){
        var node1 = new DefaultNodeModel("Generic", "rgb(0,192,255)");
        node1.addOutPort("Out");
        node1.setPosition(0, 0);
        this.model.addAll(node1)
        this.forceUpdate()
    }

    divStyle = {
        display: "contents"
    }

    render() {
        
        return (
            <div style={this.divStyle}>
                <div style={{width: "100px", background: "#2c3e50"}}>
                    <button style={{width: "100%"}} onClick={()=>{this.addNode()}}> Add texture </button><br/>
                    <button style={{width: "100%"}} onClick={()=>{this.addNode()}}> Add blur </button>
                </div>
                
                <DiagramWidget inverseZoom={true} className="srd-demo-canvas" diagramEngine={this.engine} />
            </div>
        // <div style={this.divStyle}>
        //     <button onClick={this.addNode}> Add node </button>
            
        // </div>
        );

    }
}
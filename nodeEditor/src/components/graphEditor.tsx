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
import { NodeMaterialBlock, Texture } from 'babylonjs';
import { Engine } from 'babylonjs/Engines/engine';
require("storm-react-diagrams/dist/style.min.css");
//require("storm-react-diagrams/dist/style.min.css");

/*
Data vs View
NodeMaterialBlock = GenericNodeModel
NodeMaterialConnectionPoint = GenericPortModel (Connection is a LinkModel, which is a built in react-storm type)

You can only access data from view, view is not accessible from data

Traversing data to create view is done in createNodeFromObject method
*/





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
     * @param nodeMaterialBlock 
     */
    public createNodeFromObject(
        options:{
            column:number,
            nodeMaterialBlock?:NodeMaterialBlock                            
        }
    ){
        // Update rows/columns
        if(this.rowPos[options.column] == undefined){
            this.rowPos[options.column] = 0;
        }else{
            this.rowPos[options.column]++;
        }

        // Create new node in the graph
        var outputNode = new GenericNodeModel();
        this.nodes.push(outputNode)
        outputNode.setPosition(1600-(300*options.column), 200*this.rowPos[options.column])
        this.model.addAll(outputNode);

        if(options.nodeMaterialBlock){
            outputNode.block = options.nodeMaterialBlock
            outputNode.headerLabels.push({text: options.nodeMaterialBlock.getClassName()})

            // Create output ports
            options.nodeMaterialBlock._outputs.forEach((connection:any)=>{
                var outputPort = new GenericPortModel(connection.name, "output");
                outputPort.syncWithNodeMaterialConnectionPoint(connection);
                outputNode.addPort(outputPort)
            })

            // Create input ports and nodes if they exist
            options.nodeMaterialBlock._inputs.forEach((connection)=>{
                var inputPort = new GenericPortModel(connection.name, "input");
                inputPort.connection = connection;
                outputNode.addPort(inputPort)
                
                if(connection._connectedPoint){
                    // Block is not a leaf node, create node for the given block type
                    var connectedNode;
                    var existingNodes = this.nodes.filter((n)=>{return n.block == (connection as any)._connectedPoint._ownerBlock});
                    if(existingNodes.length == 0){
                        connectedNode = this.createNodeFromObject({column: options.column+1, nodeMaterialBlock: connection._connectedPoint._ownerBlock});
                    }else{
                        connectedNode = existingNodes[0];
                    }
           
                    let link = connectedNode.ports[connection._connectedPoint.name].link(inputPort);
                    this.model.addAll(link);
                    
                }else if(connection.type == NodeMaterialBlockConnectionPointTypes.Texture){
                    // Create node for a texture
                    var localNode = this.createNodeFromObject({column: options.column+1})
                    //localNode.headerLabels.push({text: "Texture"})
                    if(connection.value){
                        localNode.texture = connection.value
                    }
                    var outPort = new GenericPortModel("Texture", "output");
                    outPort.getValue = ()=>{
                        return localNode.texture;
                    }
                    localNode.addPort(outPort)
                    let link = outPort.link(inputPort);
                    this.model.addAll(link);
                } else if(connection.type == NodeMaterialBlockConnectionPointTypes.Matrix){
                    // Create node for a Matrix
                    var localNode = this.createNodeFromObject({column: options.column+1})
                    localNode.headerLabels.push({text: "Matrix"})
                    var outPort = new GenericPortModel("Matrix", "output");
                    localNode.addPort(outPort)

                    let link = outPort.link(inputPort);
                    this.model.addAll(link);
                }
            })
        }
        
        
    
        return outputNode;
    }

    componentDidMount(){
        // debugger;
        // this.props.globalState;
        (this.refs["test"] as DiagramWidget).setState({document: this.props.globalState.hostDocument})
    }

    constructor(props: IGraphEditorProps) {
        super(props);
        

        // setup the diagram engine
        this.engine = new DiagramEngine();
        this.engine.installDefaultFactories()
        this.engine.registerNodeFactory(new GenericNodeFactory());

        // setup the diagram model
        this.model = new DiagramModel();

        this.model.addListener({
            linksUpdated: (e)=>{
                if(!e.isCreated){
                    // Link is deleted
                    console.log("link deleted");
                    var link = GenericPortModel.SortInputOutput(e.link.sourcePort as GenericPortModel, e.link.targetPort as GenericPortModel);
                    console.log(link)
                    if(link){
                        if(link.output.connection && link.input.connection){
                            // Disconnect standard nodes
                            console.log("disconnected "+link.output.connection.name+" from "+link.input.connection.name)
                            link.output.connection.disconnectFrom(link.input.connection)
                            link.input.syncWithNodeMaterialConnectionPoint(link.input.connection)
                            link.output.syncWithNodeMaterialConnectionPoint(link.output.connection)
                        }else if(link.input.connection && link.input.connection.value){
                            console.log("value link removed");
                            link.input.connection.value = null;
                        }else{
                            console.log("invalid link error");
                        }   
                    }
                }else{
                    console.log("link created")
                    console.log(e.link.sourcePort)
                }
                e.link.addListener({
                    sourcePortChanged: ()=>{
                        console.log("port change")
                    },
                    targetPortChanged: ()=>{
                        // Link is created with a target port
                        console.log("Link set to target")
                        var link = GenericPortModel.SortInputOutput(e.link.sourcePort as GenericPortModel, e.link.targetPort as GenericPortModel);
                        
                        if(link){
                            if(link.output.connection && link.input.connection){
                               console.log("link standard blocks")
                               link.output.connection.connectTo(link.input.connection)
                            }else if(link.input.connection){
                                console.log("link value to standard block")
                                link.input.connection.value = link.output.getValue();
                                
                            }
                            if(this.props.globalState.nodeMaterial){
                                this.props.globalState.nodeMaterial.build()
                            }
                        }
                    }
                    
                })
                
            },
            nodesUpdated: (e)=>{
                if(e.isCreated){
                    console.log("new node")
                }else{
                    console.log("node deleted")
                }
            }
        })

        // Load graph of nodes from the material
        if(this.props.globalState.nodeMaterial){
            var material:any = this.props.globalState.nodeMaterial;
            material._vertexOutputNodes.forEach((n:any)=>{
                this.createNodeFromObject({column: 0, nodeMaterialBlock: n});
            })
            material._fragmentOutputNodes.forEach((n:any)=>{
                this.createNodeFromObject({column: 0, nodeMaterialBlock: n});
            })
        }

        // load model into engine
        this.engine.setDiagramModel(this.model);

        console.log(this.engine)
    }

    addNode(){
         // Create node for a texture
         var localNode = this.createNodeFromObject({column: 0})
         //localNode.headerLabels.push({text: "Texture"})
        //  if(connection.value){
        //      localNode.texture = connection.value
        //  }
         var outPort = new GenericPortModel("Texture", "output");
         outPort.getValue = ()=>{
             return localNode.texture;
         }
         localNode.addPort(outPort)
         localNode.texture = new Texture(null, Engine.LastCreatedScene)
        //  let link = outPort.link(inputPort);
        //  this.model.addAll(link);


        // var node1 = new DefaultNodeModel("Generic", "rgb(0,192,255)");
        // node1.addOutPort("Out");
        // node1.setPosition(0, 0);
        // this.model.addAll(node1)
        this.forceUpdate()
    }

    divStyle = {
        display: "flex",
        height: "100%",
        background: "#333333",
    }

    render() {
        
        return (
            <div style={this.divStyle}>
                <div style={{width: "100px", background: "#2c3e50"}}>
                    <button style={{width: "100%"}} onClick={()=>{this.addNode()}}> Add texture </button><br/>
                    <button style={{width: "100%"}} onClick={()=>{this.addNode()}}> Add blur </button>
                </div>
                
                <DiagramWidget ref={"test"} inverseZoom={true} className="srd-demo-canvas" diagramEngine={this.engine} maxNumberPointsPerLink={0} />
            </div>
        // <div style={this.divStyle}>
        //     <button onClick={this.addNode}> Add node </button>
            
        // </div>
        );

    }
}
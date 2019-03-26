import {
	DiagramEngine,
	DiagramModel,
	DefaultNodeModel,
	//LinkModel,
	DiagramWidget,
	DefaultLinkModel
} from "storm-react-diagrams";

import * as React from "react";
import { GlobalState } from '../globalState';
import { TextureNodeModel } from './customDiragramNodes/texture/textureNodeModel';
import { TextureNodeFactory } from './customDiragramNodes/texture/textureNodeFactory';
require("storm-react-diagrams/dist/style.min.css");
//require("storm-react-diagrams/dist/style.min.css");


interface IGraphEditorProps {
    globalState: GlobalState;
}

export class GraphEditor extends React.Component<IGraphEditorProps> {
    engine:DiagramEngine;
    model: DiagramModel;
    constructor(props: IGraphEditorProps) {
        super(props);
        

        //1) setup the diagram engine
        this.engine = new DiagramEngine();
        this.engine.installDefaultFactories()
        this.engine.registerNodeFactory(new TextureNodeFactory());

        //2) setup the diagram model
        this.model = new DiagramModel();

        //3-A) create a default node
        // var node1 = new DefaultNodeModel("Texture", "rgb(0,192,255)");
        // let port1 = node1.addOutPort("Out");
        // let port1b = node1.addOutPort("output 2");
        // node1.setPosition(100, 100);

        // //3-B) create another default node
        var node2 = new DefaultNodeModel("Final output", "rgb(192,255,0)");
        node2.addInPort("In");
        node2.setPosition(400, 100);

        // var node3 = new TextureNodeModel();

        // // link the ports
        // let link1 = port1.link(port2);
        // (link1 as DefaultLinkModel).addLabel("Hello World!");

        if(this.props.globalState.nodeMaterial){
            var material = this.props.globalState.nodeMaterial;
            console.log("Converting node material to diagram")
            

        }

        //4) add the models to the root graph
        this.model.addAll(node2);

        //5) load model into engine
        this.engine.setDiagramModel(this.model);

        console.log(this.engine)
    }

    addNode(){
        var node1 = new DefaultNodeModel("Texture", "rgb(0,192,255)");
        let port1 = node1.addOutPort("Out");
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
                
                <DiagramWidget className="srd-demo-canvas" diagramEngine={this.engine} />
            </div>
        // <div style={this.divStyle}>
        //     <button onClick={this.addNode}> Add node </button>
            
        // </div>
        );

    }
}
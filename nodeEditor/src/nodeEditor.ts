import * as React from "react";
import * as ReactDOM from "react-dom";
import { GlobalState } from './globalState';
import { GraphEditor } from './components/graphEditor';
import {NodeMaterial} from "babylonjs"
import {Inspector} from "../../inspector/src"
/**
 * Interface used to specify creation options for the node editor
 */
export interface INodeEditorOptions {
    /**
     * Defines the DOM element that will host the node editor
     */
    hostElement?: HTMLDivElement
    nodeMaterial?: NodeMaterial
}

/**
 * Class used to create a node editor
 */
export class NodeEditor {
    /**
     * Show the node editor
     * @param options defines the options to use to configure the node editor
     */
    public static Show(options: INodeEditorOptions) {
        if(!options.hostElement){
            
            var divElement = document.createElement("div");
            document.body.prepend(divElement)
            divElement.id = "node-editor";
            divElement.style.background = "#474646"
            divElement.style.width = "100%"
            divElement.style.height = "300px"
            divElement.style.display = "flex"
            options.hostElement = divElement
            // debugger;
            // options.hostElement = Inspector._CreatePopup("SCENE EXPLORER", "node-editor")!;
            
        }
        let globalState = new GlobalState();
        globalState.nodeMaterial = options.nodeMaterial

        const graphEditor = React.createElement(GraphEditor, {
            globalState: globalState
        });

        ReactDOM.render(graphEditor, options.hostElement);
    }
}


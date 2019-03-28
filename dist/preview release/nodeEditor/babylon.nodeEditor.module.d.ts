/// <reference types="react" />
declare module "babylonjs-nodeEditor/globalState" {
    import { NodeMaterial } from "babylonjs";
    export class GlobalState {
        nodeMaterial?: NodeMaterial;
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericNodeModel" {
    import { NodeModel } from "storm-react-diagrams";
    import { Nullable } from 'babylonjs/types';
    import { NodeMaterialBlock } from 'babylonjs/Materials/Node/nodeMaterialBlock';
    export class GenericNodeModel extends NodeModel {
        block: Nullable<NodeMaterialBlock>;
        headerLabels: Array<{
            text: string;
        }>;
        textureInputs: Array<{
            text: string;
            initialValue: string;
        }>;
        constructor();
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericPortModel" {
    import { LinkModel, PortModel } from "storm-react-diagrams";
    import { Nullable } from 'babylonjs/types';
    import { NodeMaterialConnectionPoint } from 'babylonjs/Materials/Node/nodeMaterialBlockConnectionPoint';
    export class GenericPortModel extends PortModel {
        label: string;
        position: string | "input" | "output";
        connection: Nullable<NodeMaterialConnectionPoint>;
        static idCounter: number;
        constructor(label: string, type?: string);
        createLinkModel(): LinkModel;
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericNodeWidget" {
    import * as React from "react";
    import { Nullable } from 'babylonjs/types';
    import { GenericNodeModel } from "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericNodeModel";
    export interface GenericNodeWidgetProps {
        node: Nullable<GenericNodeModel>;
    }
    export interface GenericNodeWidgetState {
    }
    export class GenericNodeWidget extends React.Component<GenericNodeWidgetProps, GenericNodeWidgetState> {
        constructor(props: GenericNodeWidgetProps);
        render(): JSX.Element;
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericNodeFactory" {
    import * as SRD from "storm-react-diagrams";
    import { GenericNodeModel } from "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericNodeModel";
    export class GenericNodeFactory extends SRD.AbstractNodeFactory {
        constructor();
        generateReactWidget(diagramEngine: SRD.DiagramEngine, node: GenericNodeModel): JSX.Element;
        getNewInstance(): GenericNodeModel;
    }
}
declare module "babylonjs-nodeEditor/components/graphEditor" {
    import { DiagramEngine, DiagramModel } from "storm-react-diagrams";
    import * as React from "react";
    import { GlobalState } from "babylonjs-nodeEditor/globalState";
    import { GenericNodeModel } from "babylonjs-nodeEditor/components/customDiragramNodes/generic/genericNodeModel";
    interface IGraphEditorProps {
        globalState: GlobalState;
    }
    export class GraphEditor extends React.Component<IGraphEditorProps> {
        engine: DiagramEngine;
        model: DiagramModel;
        nodes: any[];
        rowPos: number[];
        /**
         * Creates a node and recursivly creates its parent nodes from it's input
         * @param object
         */
        createNodeFromObject(object: any, options: {
            column: number;
        }): GenericNodeModel;
        constructor(props: IGraphEditorProps);
        addNode(): void;
        divStyle: {
            display: string;
        };
        render(): JSX.Element;
    }
}
declare module "babylonjs-nodeEditor/nodeEditor" {
    import { NodeMaterial } from "babylonjs";
    /**
     * Interface used to specify creation options for the node editor
     */
    export interface INodeEditorOptions {
        /**
         * Defines the DOM element that will host the node editor
         */
        hostElement?: HTMLDivElement;
        nodeMaterial?: NodeMaterial;
    }
    /**
     * Class used to create a node editor
     */
    export class NodeEditor {
        /**
         * Show the node editor
         * @param options defines the options to use to configure the node editor
         */
        static Show(options: INodeEditorOptions): void;
    }
}
declare module "babylonjs-nodeEditor/index" {
    export * from "babylonjs-nodeEditor/nodeEditor";
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/texture/textureNodeWidget" {
    import * as React from "react";
    export interface TextureNodeWidgetProps {
        node: any;
        size?: number;
    }
    export interface TextureNodeWidgetState {
    }
    export class TextureNodeWidget extends React.Component<TextureNodeWidgetProps, TextureNodeWidgetState> {
        static defaultProps: TextureNodeWidgetProps;
        constructor(props: TextureNodeWidgetProps);
        render(): JSX.Element;
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/texture/texturePortModel" {
    import { LinkModel, PortModel } from "storm-react-diagrams";
    export class TexturePortModel extends PortModel {
        position: string | "top" | "bottom" | "left" | "right";
        constructor(pos?: string);
        createLinkModel(): LinkModel;
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/texture/textureNodeModel" {
    import { NodeModel } from "storm-react-diagrams";
    export class TextureNodeModel extends NodeModel {
        constructor();
    }
}
declare module "babylonjs-nodeEditor/components/customDiragramNodes/texture/textureNodeFactory" {
    import * as SRD from "storm-react-diagrams";
    import { TextureNodeModel } from "babylonjs-nodeEditor/components/customDiragramNodes/texture/textureNodeModel";
    export class TextureNodeFactory extends SRD.AbstractNodeFactory {
        constructor();
        generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element;
        getNewInstance(): TextureNodeModel;
    }
}
declare module "babylonjs-nodeEditor/legacy/legacy" {
    export * from "babylonjs-nodeEditor/index";
}
declare module "babylonjs-nodeEditor" {
    export * from "babylonjs-nodeEditor/legacy/legacy";
}
/// <reference types="react" />
declare module NODEEDITOR {
    export class GlobalState {
        nodeMaterial?: BABYLON.NodeMaterial;
    }
}
declare module NODEEDITOR {
    export class GenericNodeModel extends NodeModel {
        block: BABYLON.Nullable<BABYLON.NodeMaterialBlock>;
        headerLabels: Array<{
            text: string;
        }>;
        textureInputs: Array<{
            text: string;
            initialValue: string;
        }>;
        constructor();
    }
}
declare module NODEEDITOR {
    export class GenericPortModel extends PortModel {
        label: string;
        position: string | "input" | "output";
        connection: BABYLON.Nullable<BABYLON.NodeMaterialConnectionPoint>;
        static idCounter: number;
        constructor(label: string, type?: string);
        createLinkModel(): LinkModel;
    }
}
declare module NODEEDITOR {
    export interface GenericNodeWidgetProps {
        node: BABYLON.Nullable<GenericNodeModel>;
    }
    export interface GenericNodeWidgetState {
    }
    export class GenericNodeWidget extends React.Component<GenericNodeWidgetProps, GenericNodeWidgetState> {
        constructor(props: GenericNodeWidgetProps);
        render(): JSX.Element;
    }
}
declare module NODEEDITOR {
    export class GenericNodeFactory extends SRD.AbstractNodeFactory {
        constructor();
        generateReactWidget(diagramEngine: SRD.DiagramEngine, node: GenericNodeModel): JSX.Element;
        getNewInstance(): GenericNodeModel;
    }
}
declare module NODEEDITOR {
    interface IGraphEditorProps {
        globalState: GlobalState;
    }
    export class GraphEditor extends React.Component<IGraphEditorProps> {
        engine: DiagramEngine;
        model: DiagramModel;
        nodes: any[];
        rowPos: number[];
        /**
         * Creates a node and recursivly creates its parent nodes from it's input
         * @param object
         */
        createNodeFromObject(object: any, options: {
            column: number;
        }): GenericNodeModel;
        constructor(props: IGraphEditorProps);
        addNode(): void;
        divStyle: {
            display: string;
        };
        render(): JSX.Element;
    }
}
declare module NODEEDITOR {
    /**
     * Interface used to specify creation options for the node editor
     */
    export interface INodeEditorOptions {
        /**
         * Defines the DOM element that will host the node editor
         */
        hostElement?: HTMLDivElement;
        nodeMaterial?: BABYLON.NodeMaterial;
    }
    /**
     * Class used to create a node editor
     */
    export class NodeEditor {
        /**
         * Show the node editor
         * @param options defines the options to use to configure the node editor
         */
        static Show(options: INodeEditorOptions): void;
    }
}
declare module NODEEDITOR {
    export interface TextureNodeWidgetProps {
        node: any;
        size?: number;
    }
    export interface TextureNodeWidgetState {
    }
    export class TextureNodeWidget extends React.Component<TextureNodeWidgetProps, TextureNodeWidgetState> {
        static defaultProps: TextureNodeWidgetProps;
        constructor(props: TextureNodeWidgetProps);
        render(): JSX.Element;
    }
}
declare module NODEEDITOR {
    export class TexturePortModel extends PortModel {
        position: string | "top" | "bottom" | "left" | "right";
        constructor(pos?: string);
        createLinkModel(): LinkModel;
    }
}
declare module NODEEDITOR {
    export class TextureNodeModel extends NodeModel {
        constructor();
    }
}
declare module NODEEDITOR {
    export class TextureNodeFactory extends SRD.AbstractNodeFactory {
        constructor();
        generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element;
        getNewInstance(): TextureNodeModel;
    }
}
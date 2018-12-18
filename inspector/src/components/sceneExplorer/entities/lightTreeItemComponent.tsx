import { Light, IExplorerExtensibilityGroup } from "babylonjs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb as faLightbubRegular } from '@fortawesome/free-regular-svg-icons';
import { TreeItemLabelComponent } from "../treeItemLabelComponent";
import { ExtensionsComponent } from "../extensionsComponent";
import { faVectorSquare } from '@fortawesome/free-solid-svg-icons';
import * as React from "react";
import { GlobalState } from "../../globalState";

interface ILightTreeItemComponentProps {
    light: Light,
    extensibilityGroups?: IExplorerExtensibilityGroup[]
    onClick: () => void,
    globalState: GlobalState
}

export class LightTreeItemComponent extends React.Component<ILightTreeItemComponentProps, { isEnabled: boolean, isGizmoEnabled:boolean }> {
    constructor(props: ILightTreeItemComponentProps) {
        super(props);

        const light = this.props.light;

        this.state = { isEnabled: light.isEnabled(), isGizmoEnabled: false };

        // this.props.globalState.onInspectorClosedObservable.addOnce(()=>{
        //     if(light.reservedDataStore && light.reservedDataStore.lightGizmo){
        //         light.reservedDataStore.lightGizmo.dispose();
        //     }
        // })
        
    }

    switchIsEnabled(): void {
        const light = this.props.light;

        light.setEnabled(!light.isEnabled());

        this.setState({ isEnabled: light.isEnabled() });
    }
    toggleGizmo(): void {
        debugger;
        const light = this.props.light;
        if(!light.reservedDataStore){
            light.reservedDataStore = {}
        }else if(light.reservedDataStore.lightGizmo){
            light.reservedDataStore.lightGizmo.dispose();
            light.reservedDataStore.lightGizmo=null;
            this.setState({ isGizmoEnabled: false });
            return;
        }
        light.reservedDataStore.lightGizmo = new BABYLON.LightGizmo();
        light.reservedDataStore.lightGizmo.light = light;
        this.setState({ isGizmoEnabled: true });
    }

    render() {
        const isEnabledElement = this.state.isEnabled ? <FontAwesomeIcon icon={faLightbubRegular} /> : <FontAwesomeIcon icon={faLightbubRegular} className="isNotActive" />;
        const isGizmoEnabled = this.state.isGizmoEnabled ? <FontAwesomeIcon icon={faVectorSquare} /> : <FontAwesomeIcon icon={faVectorSquare} className="isNotActive" />;

        return (
            <div className="lightTools">
                <TreeItemLabelComponent label={this.props.light.name} onClick={() => this.props.onClick()} icon={faLightbulb} color="yellow" />
                <div className="enableGizmo icon" onClick={() => this.toggleGizmo()} title="Turn on/off the light's gizmo">
                    {isGizmoEnabled}
                </div>
                <div className="visibility icon" onClick={() => this.switchIsEnabled()} title="Turn on/off the light">
                    {isEnabledElement}
                </div>
                {
                    <ExtensionsComponent target={this.props.light} extensibilityGroups={this.props.extensibilityGroups} />
                }
            </div>
        )
    }
}
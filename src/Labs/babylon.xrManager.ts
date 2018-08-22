module BABYLON {
    /**
     * The _Labs namespace will contain classes/functions that are not (!) backwards compatible.
     * The APIs in all labs-related classes and configuration  might change.
     * Once stable, lab features will be moved to the publis API and configuration object.
     */
    export namespace _Labs {
        /**
         * Manages the webXR device, session and output canvas.
         */
        export class XRManger {
            private _xrDevice:any;
            private _xrSession:any;
            private _gl:WebGLRenderingContext;
            private _camera:FreeCamera;
            private _outputCanvas:Nullable<HTMLCanvasElement>;
            
            /**
             * This will be true between the time enterXR() is called to the time the call completes.
             */
            private _enteringXRMode = false;

            /**
             * True if a xr device has been initialized and is supported. Only populated after calling init()
             */
            public xrSupported = false;

            /**
             * If the xr presenting is currently active
             */
            public inXRMode = false;
            
            /**
             * Creates a webXR manager, init() must be called to initialize it
             * @param scene the scene that will be rendered by the manager
             */
            constructor(public scene:BABYLON.Scene){  

            }
            /**
             * Initializes the manager, creates the xr device and validates that it is supported
             * @returns a promise with if xr is supported by the browser and an xr device was found
             */
            init():Promise<boolean>{
                return Promise.resolve(false);
            }
            /**
             * Exists XR and stops presenting
             */
            exitXR():Promise<void>{
                return Promise.resolve();
            }
            /**
             * Enters XR mode and starts presenting
             * @param requestSessionOptions options that will be passed to xrDevice.requestSession
             */
            enterXR(requestSessionOptions:any):Promise<void>{
                return Promise.resolve();
            }
        }
    }
}
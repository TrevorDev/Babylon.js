module BABYLON {
    export class DepthOfFieldPostProcess extends PostProcess {
        fStop = 0.0013;
        kernelSize = 3;
        focusDistance = 14;
        focalLength = 15;
        constructor(name: string, depthTexture: RenderTargetTexture, options: number | PostProcessOptions, camera: Nullable<Camera>, samplingMode?: number, engine?: Engine, reusable?: boolean, textureType: number = Engine.TEXTURETYPE_UNSIGNED_INT) {
            super("name", "depthOfField2", ["near", "far", "fStop", "kernelSize", "focusDistance", "focalLength"], ["depthSampler"], options, camera, samplingMode, engine, reusable, null, textureType);
            this.onApplyObservable.add((effect: Effect) => {
                effect.setTexture("depthSampler", depthTexture);

                effect.setFloat('fStop', this.fStop);
                effect.setFloat('kernelSize', this.kernelSize);
                effect.setFloat('focusDistance', this.focusDistance);
                effect.setFloat('focalLength', this.focalLength);

                if (camera) {
                    effect.setFloat('near', camera.minZ);
                    effect.setFloat('far', camera.maxZ);
                }
            })
        }
    }
}
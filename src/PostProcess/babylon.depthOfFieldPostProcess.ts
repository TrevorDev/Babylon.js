module BABYLON {
    export class DepthOfFieldPostProcess extends PostProcess {

        constructor(name: string, depthTexture: RenderTargetTexture, options: number | PostProcessOptions, camera: Nullable<Camera>, samplingMode?: number, engine?: Engine, reusable?: boolean, textureType: number = Engine.TEXTURETYPE_UNSIGNED_INT) {
            super("name", "depthOfFieldNew", ["near", "far"], ["depthSampler"], options, camera, samplingMode, engine, reusable, null, textureType);
            this.onApply = (effect: Effect) => {
                effect.setTexture("depthSampler", depthTexture);
                if (camera) {
                    effect.setFloat('near', camera.minZ);
                    effect.setFloat('far', camera.maxZ);
                }
            };
        }
    }
}
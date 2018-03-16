module BABYLON {
    /**
     * The extract highlights post process sets all pixels to black except pixels above the specified luminance threshold. Used as the first step for a bloom effect.
     */
    export class ExtractHighlightsPostProcess extends PostProcess {
        /**
         * The luminance threshold, pixels below this value will be set to black.
         */
        public threshold = 0.9;
        constructor(name: string, options: number | PostProcessOptions, camera: Nullable<Camera>, samplingMode?: number, engine?: Engine, reusable?: boolean, textureType: number = Engine.TEXTURETYPE_UNSIGNED_INT, blockCompilation = false) {
            super(name, "extractHighlights", ["threshold"], null, options, camera, samplingMode, engine, reusable, null, textureType, undefined, null, blockCompilation);
            this.onApplyObservable.add((effect: Effect) => {
                effect.setFloat('threshold', this.threshold);
            })
        }
    }
} 
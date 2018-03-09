    // samplers
    uniform sampler2D textureSampler; // Original image to be merged with
#ifdef DOF
    uniform sampler2D blurStep0; // Highest blur
    uniform sampler2D circleOfConfusionSampler;

    #if BLUR_LEVEL > 0
    uniform sampler2D blurStep1; // Medium blur
    #endif
    #if BLUR_LEVEL > 1
    uniform sampler2D blurStep2; // Low blur
    #endif
#endif

// #ifdef BLOOM
//     uniform sampler2D bloomBlur;
//     uniform float bloomWeight;
// #endif
// varyings
varying vec2 vUV;

void main(void)
{
    gl_FragColor = texture2D(textureSampler, vUV);
#ifdef DOF
        float coc = texture2D(circleOfConfusionSampler, vUV).r;
    #if BLUR_LEVEL == 0
        vec4 blurred = texture2D(blurStep0, vUV);
        gl_FragColor = mix(gl_FragColor, blurred, coc);
    #endif
    #if BLUR_LEVEL == 1
        vec4 blurredHigh = texture2D(blurStep0, vUV);    
        vec4 blurredLow = texture2D(blurStep1, vUV);
        if(coc < 0.5){
            gl_FragColor = mix(gl_FragColor, blurredLow, coc/0.5);
        }else{
            gl_FragColor = mix(blurredLow, blurredHigh, (coc-0.5)/0.5);
        }
    #endif
    #if BLUR_LEVEL == 2
        vec4 blurredHigh = texture2D(blurStep0, vUV);
        vec4 blurredMedium = texture2D(blurStep1, vUV);
        vec4 blurredLow = texture2D(blurStep2, vUV);
        if(coc < 0.33){
            gl_FragColor = mix(gl_FragColor, blurredLow, coc/0.33);
        }else if(coc < 0.66){
            gl_FragColor = mix(blurredLow, blurredMedium, (coc-0.33)/0.33);
        }else{
            gl_FragColor = mix(blurredMedium, blurredHigh, (coc-0.66)/0.34);
        }
    #endif
#endif
// #ifdef BLOOM
//     gl_FragColor = mix(gl_FragColor, bloomBlur, bloomWeight);
// #endif
}

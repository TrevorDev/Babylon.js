// samplers
uniform sampler2D textureSampler;
uniform sampler2D depthSampler;

// varyings
varying vec2 vUV;

// preconputed uniforms (not effect parameters)
uniform float near;
uniform float far;

void sampleColorWithWeight(inout vec4 color, const in vec2 offset, const in float weight) {
    color += texture2D(textureSampler, offset)*weight;
}

float sampleDistance(const in vec2 offset) {
    float depth = texture2D(depthSampler, offset).r;	// depth value from DepthRenderer: 0 to 1
	return near + (far - near)*depth;		            // actual distance from the lens
}

void main(void)
{
    float focusDistance = 20.0;
    vec4 color = vec4(0.0,0.0,0.0,1.0);
	float distance = sampleDistance(vUV);   // actual distance from the lens
    
    float blurScale = clamp(distance/200.0, 0.0, 1.0);

    vec2 pos = vec2(vUV.x, vUV.y);
    float blurSize = 0.05*blurScale;
    sampleColorWithWeight(color, pos, 0.5);
    pos.y += blurSize;
    sampleColorWithWeight(color, pos, 0.25);
    pos.y -= blurSize*2.0;
    sampleColorWithWeight(color, pos, 0.25);

    gl_FragColor = color;


    // float colVal = distance/10.0;
    // if(distance > focusDistance){
    //     gl_FragColor = vec4(colVal, colVal, colVal, 1.0);
    // }else{
    //     gl_FragColor = color;
    // }
    
    //gl_FragColor = vec4(colVal, colVal, colVal, 1.0);
    
}
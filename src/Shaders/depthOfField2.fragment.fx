// samplers
uniform sampler2D textureSampler;
uniform sampler2D depthSampler;

// varyings
varying vec2 vUV;

// preconputed uniforms (not effect parameters)
uniform float near;
uniform float far;

// uniforms
uniform float fStop; // Max blur
uniform float kernelSize; // Smoothness of blur
uniform float focusDistance; // Distance from lens that should be in focus
uniform float focalLength; // Size of area that is in focus

float sampleDistance(const in vec2 offset) {
    float depth = texture2D(depthSampler, offset).r;	// depth value from DepthRenderer: 0 to 1
	return near + (far - near)*depth;		            // actual distance from the lens
}

void sampleColorWithWeight(inout vec4 color, inout float sumOfWeights, const in float distanceOfCenterSample, const in vec2 offset, const in float weight) {
    // Stop bleeding forground into background with when blurring
    float sampleDistance = sampleDistance(offset);
    float distanceBetween = (distanceOfCenterSample - sampleDistance);
    float factor = clamp(1.0-(distanceBetween/distanceOfCenterSample),0.0,1.0);
    
    
    // Add sample to blur based on weight
    float modifiedWeight = weight*factor;
    sumOfWeights+=modifiedWeight;
    color += texture2D(textureSampler, offset)*modifiedWeight;
}

void main(void)
{
	float distance = sampleDistance(vUV);   // actual distance from the lens
    float distanceFromFocalPlane = (distance-focusDistance);
    float blurScale = clamp(abs(distanceFromFocalPlane/focalLength), 0.0, 1.0);

    float sum = 0.0f;
    vec4 color = vec4(0.0,0.0,0.0,1.0);
    float w = fStop*blurScale;
    float h = fStop*blurScale;

    sampleColorWithWeight(color, sum, distance, vUV, 1.0);

    sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.50*w, 0.24*h), 0.93);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(0.30*w, -0.75*h), 0.90);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(0.36*w, 0.96*h), 0.87);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.08*w, -0.55*h), 0.85);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(1.33*w, -0.37*h), 0.83);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.82*w, 1.31*h), 0.80);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.31*w, -1.67*h), 0.78);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(1.47*w, 1.11*h), 0.76);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.97*w, 0.19*h), 0.74);
	sampleColorWithWeight(color, sum, distance, vUV + vec2(1.42*w, -1.57*h), 0.72);
	if (kernelSize > 1.0) {
		sampleColorWithWeight(color, sum, distance, vUV + vec2(0.01*w, 2.25*h), 0.70);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.62*w, -1.74*h), 0.67);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(2.49*w, 0.20*h), 0.65);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.07*w, 1.61*h), 0.63);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(0.46*w, -2.70*h), 0.61);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(1.55*w, 2.40*h), 0.59);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.88*w, -0.75*h), 0.56);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(2.73*w, -1.44*h), 0.54);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.08*w, 3.02*h), 0.52);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.28*w, -3.05*h), 0.49);
	}
	if (kernelSize > 2.0) {
		sampleColorWithWeight(color, sum, distance, vUV + vec2(3.11*w, 1.43*h), 0.46);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-3.36*w, 1.08*h), 0.44);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(1.80*w, -3.16*h), 0.41);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(0.83*w, 3.65*h), 0.38);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-3.16*w, -2.19*h), 0.34);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(3.92*w, -0.53*h), 0.31);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.59*w, 3.12*h), 0.26);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.20*w, -4.15*h), 0.22);
		sampleColorWithWeight(color, sum, distance, vUV + vec2(3.02*w, 3.00*h), 0.15);
	}

    color /= sum;
    color.a = 1.0;
    gl_FragColor = color;
}
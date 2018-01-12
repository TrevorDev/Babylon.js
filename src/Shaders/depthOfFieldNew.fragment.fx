// const vec3 constants[] = vec3[] (
//     vec3(0.0, 0.0, 1.0),
//     vec3(-0.50, 0.24, 0.93),
// 	vec3(0.30, -0.75, 0.90),
// 	vec3(0.36, 0.96, 0.87),
// 	vec3(-1.08, -0.55, 0.85),
// 	vec3(1.33, -0.37, 0.83),
// 	vec3(-0.82, 1.31, 0.80),
// 	vec3(-0.31, -1.67, 0.78),
// 	vec3(1.47, 1.11, 0.76),
// 	vec3(-1.97, 0.19, 0.74),
// 	vec3(1.42, -1.57, 0.72),
// 	if (kernelSize > 1.0) {
// 		vec3(0.01, 2.25, 0.70),
// 		vec3(-1.62, -1.74, 0.67),
// 		vec3(2.49, 0.20, 0.65),
// 		vec3(-2.07, 1.61, 0.63),
// 		vec3(0.46, -2.70, 0.61),
// 		vec3(1.55, 2.40, 0.59),
// 		vec3(-2.88, -0.75, 0.56),
// 		vec3(2.73, -1.44, 0.54),
// 		vec3(-1.08, 3.02, 0.52),
// 		vec3(-1.28, -3.05, 0.49),
// 	}
// 	if (kernelSize > 2.0) {
// 		vec3(3.11, 1.43, 0.46),
// 		vec3(-3.36, 1.08, 0.44),
// 		vec3(1.80, -3.16, 0.41),
// 		vec3(0.83, 3.65, 0.38),
// 		vec3(-3.16, -2.19, 0.34),
// 		vec3(3.92, -0.53, 0.31),
// 		vec3(-2.59, 3.12, 0.26),
// 		vec3(-0.20, -4.15, 0.22),
// 		vec3(3.02, 3.00, 0.15)
// 	}
// );

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

    if(kernelSize > 3.0){
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.84*w, 0.43*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.48*w, -1.29*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.61*w, 1.51*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.55*w, -0.74*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.71*w, -0.52*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.94*w, 1.59*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.40*w, -1.87*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.62*w, 1.16*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.09*w, 0.25*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.46*w, -1.71*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.08*w, 2.42*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.85*w, -1.89*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(2.89*w, 0.16*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.29*w, 1.88*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.40*w, -2.81*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.54*w, 2.26*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.60*w, -0.61*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(2.31*w, -1.30*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.83*w, 2.53*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.12*w, -2.48*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(2.60*w, 1.11*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.82*w, 0.99*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.50*w, -2.81*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.85*w, 3.33*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.94*w, -1.92*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(3.27*w, -0.53*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.95*w, 2.48*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.23*w, -3.04*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(2.17*w, 2.05*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.97*w, -0.04*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(2.25*w, -2.00*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.31*w, 3.08*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.94*w, -2.59*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(3.37*w, 0.64*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-3.13*w, 1.93*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.03*w, -3.65*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.60*w, 3.17*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-3.14*w, -1.19*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(3.00*w, -1.19*h), 1.0);
    }else{
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.2758621*w*3.0,3.0*0.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.1719972*w*3.0,3.0*0.21567768*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.061385095*w*3.0,3.0*0.26894566*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.24854316*w*3.0,3.0*0.1196921*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.24854316*w*3.0,3.0*-0.11969208*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.061384983*w*3.0,3.0*-0.2689457*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.17199717*w*3.0,3.0*-0.21567771*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.51724136*w*3.0,3.0*0.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.46601835*w*3.0,3.0*0.22442262*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.32249472*w*3.0,3.0*0.40439558*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.11509705*w*3.0,3.0*0.50427306*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.11509704*w*3.0,3.0*0.50427306*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.3224948*w*3.0,3.0*0.40439552*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.46601835*w*3.0,3.0*0.22442265*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.51724136*w*3.0,3.0*0.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.46601835*w*3.0,3.0*-0.22442262*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.32249463*w*3.0,3.0*-0.40439564*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.11509683*w*3.0,3.0*-0.5042731*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.11509732*w*3.0,3.0*-0.504273*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.32249466*w*3.0,3.0*-0.40439564*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.46601835*w*3.0,3.0*-0.22442262*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.7586207*w*3.0,3.0*0.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.7249173*w*3.0,3.0*0.22360738*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.6268018*w*3.0,3.0*0.4273463*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.47299224*w*3.0,3.0*0.59311354*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.27715522*w*3.0,3.0*0.7061801*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.056691725*w*3.0,3.0*0.75649947*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.168809*w*3.0,3.0*0.7396005*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.3793104*w*3.0,3.0*0.65698475*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.55610836*w*3.0,3.0*0.51599306*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.6834936*w*3.0,3.0*0.32915324*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.7501475*w*3.0,3.0*0.113066405*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.7501475*w*3.0,3.0*-0.11306671*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.6834936*w*3.0,3.0*-0.32915318*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.5561083*w*3.0,3.0*-0.5159932*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.37931028*w*3.0,3.0*-0.6569848*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.16880904*w*3.0,3.0*-0.7396005*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.056691945*w*3.0,3.0*-0.7564994*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.2771556*w*3.0,3.0*-0.7061799*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.47299215*w*3.0,3.0*-0.59311366*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.62680185*w*3.0,3.0*-0.4273462*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.72491735*w*3.0,3.0*-0.22360711*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(1.0*w*3.0,3.0*0.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.9749279*w*3.0,3.0*0.22252093*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.90096885*w*3.0,3.0*0.43388376*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.7818315*w*3.0,3.0*0.6234898*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.6234898*w*3.0,3.0*0.7818315*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.43388364*w*3.0,3.0*0.9009689*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.22252098*w*3.0,3.0*0.9749279*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0,1.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.22252095*w*3.0,3.0*0.9749279*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.43388385*w*3.0,3.0*0.90096885*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.62349*w*3.0,3.0*0.7818314*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.7818317*w*3.0,3.0*0.62348956*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.90096885*w*3.0,3.0*0.43388382*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.9749279*w*3.0,3.0*0.22252093*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.0*w*3.0,3.0*0.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.9749279*w*3.0,3.0*-0.22252087*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.90096885*w*3.0,3.0*-0.43388376*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.7818314*w*3.0,3.0*-0.6234899*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.6234896*w*3.0,3.0*-0.7818316*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.43388346*w*3.0,3.0*-0.900969*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.22252055*w*3.0,3.0*-0.974928*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0,-1.0*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.2225215*w*3.0,3.0*-0.9749278*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.4338835*w*3.0,3.0*-0.90096897*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.6234897*w*3.0,3.0*-0.7818316*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.78183144*w*3.0,3.0*-0.62348986*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.90096885*w*3.0,3.0*-0.43388376*h), 1.0);
        sampleColorWithWeight(color, sum, distance, vUV + vec2(0.9749279*w*3.0,3.0*-0.22252086*h), 1.0);
    }
    

    


    // sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.50*w, 0.24*h), 0.93);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(0.30*w, -0.75*h), 0.90);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(0.36*w, 0.96*h), 0.87);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.08*w, -0.55*h), 0.85);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(1.33*w, -0.37*h), 0.83);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.82*w, 1.31*h), 0.80);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.31*w, -1.67*h), 0.78);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(1.47*w, 1.11*h), 0.76);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.97*w, 0.19*h), 0.74);
	// sampleColorWithWeight(color, sum, distance, vUV + vec2(1.42*w, -1.57*h), 0.72);
	// if (kernelSize > 1.0) {
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(0.01*w, 2.25*h), 0.70);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.62*w, -1.74*h), 0.67);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(2.49*w, 0.20*h), 0.65);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.07*w, 1.61*h), 0.63);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(0.46*w, -2.70*h), 0.61);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(1.55*w, 2.40*h), 0.59);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.88*w, -0.75*h), 0.56);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(2.73*w, -1.44*h), 0.54);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.08*w, 3.02*h), 0.52);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-1.28*w, -3.05*h), 0.49);
	// }

	// if (kernelSize > 2.0) {
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(3.11*w, 1.43*h), 0.46);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-3.36*w, 1.08*h), 0.44);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(1.80*w, -3.16*h), 0.41);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(0.83*w, 3.65*h), 0.38);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-3.16*w, -2.19*h), 0.34);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(3.92*w, -0.53*h), 0.31);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-2.59*w, 3.12*h), 0.26);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(-0.20*w, -4.15*h), 0.22);
	// 	sampleColorWithWeight(color, sum, distance, vUV + vec2(3.02*w, 3.00*h), 0.15);
	// }

    color /= sum;
    color.a = 1.0;
    gl_FragColor = color;
}
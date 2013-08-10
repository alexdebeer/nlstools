var createConfig = function (){
	var config = {
			particle : {
				radius : 500
			},
			surface : {
				beta: [1, 0, 0, 0], //Betas: ccc,aac,aca,caa
				phi : 0
			},
			geometry : {
				beta : 15
			},
			beams :{
				visible : 800,
				ir: 3447
			}
	};
	return config;
};

/** Performs calculation of PPP to PSS for multiple angles and performs callback on passed function */
function calculate(awave, config, callback) {
	toSurface(config);
	var func = createCalculationFunc(config);
	
	var header = ["X","PPP","SSP","SPS","PSS"];
	var data = awave.map(func);
	var result = new Array();
	result.push(header);
	for (var i=0; i< data.length; i++){
		result.push(data[i]);
	}
	callback(result);
	
};

/** Creates a functor for the calculation on one angle */
var createCalculationFunc = function(config){
	var thefunc = function(x){		
		var arr = new Array();
		arr.push(x);
		var otherarr = calculateEfield(x*Math.PI/180, config);
		for(var i=0; i<4; i++){
			arr[i+1] = otherarr[i];

		}
		return(arr);
	};
	return thefunc;
}

var calculateEfield = function(x,config){
	var lambdavis = config.beams.visible;
	var lambdair = config.beams.ir;
	var lambdasf = 1/(1/lambdavis+1/lambdair);
	qval = qq(x, lambdasf);
	betarad = config.geometry.beta*Math.PI/180;
	
	alpha = Math.asin( 1/(1 + lambdavis/lambdair) * Math.sin(betarad));
	
	
	var outp = M3(M2(M1(config.surface.beta) , qval, config.particle.radius), x, betarad, alpha);
	
	for (var i=0; i<4;i++){
		var temp = outp[i];
		
			temp = temp*temp;
		
		outp[i]=temp;
	}
	
	return(outp);
};

/**
 * Generic transformation function:
 * 
 *	/ v \   / A       \ / u \
 * 	| v | = | B C     | | u |
 *  | v |   | B   C   | | u |
 *  \ v /   \ B     C / \ u /
 * 
 */
var transform = function(vector, A, B, C){
	var outp  = [A*vector[0], 
	            B*vector[0] + C*vector[1],
    			B*vector[0] + C*vector[2],
    			B*vector[0] + C*vector[3]
	];
	return outp;
};

var transformByEl = function(vector, A, B, C){
	var outp  = [A*vector[0], 
	            B[0]*vector[0] + C[0]*vector[1],
    			B[1]*vector[0] + C[1]*vector[2],
    			B[2]*vector[0] + C[2]*vector[3]
	];
	return outp;
};

/**
 * Generic transformation function, for inverted operation:
 * 
 *	/ v \   / A B B B \ / u \
 * 	| v | = |   C     | | u |
 *  | v |   |     C   | | u |
 *  \ v /   \       C / \ u /
 * 
 */
var invTransform = function(vector, A, B, C){
	var outp  = [A*vector[0] + B*vector[1] + B*vector[2] + B*vector[3], 
	            C*vector[1],
    			C*vector[2],
    			C*vector[3]
	];
	return outp;
};

/**
 * Performs the first matrix multiplication
 */
var M1 = function(vector){
	return invTransform(vector, 1, -1, 1); 
};
var invM1 = function(vector){
	return Transform(vector, 1, 1, 1); 
};

var F1 = function(q, r)  {
	var qr = q*r;
	out  = 2*Math.PI*(Math.sin(qr)/qr/qr - Math.cos(qr)/qr);
	return(out);
};

var F2 = function(q, r)  {
	var qr = q*r;
	out  = 4*Math.PI*(
			3*Math.sin(qr)/qr/qr/qr/qr 
			- 3*Math.cos(qr)/qr/qr/qr 
			- Math.sin(qr)/qr/qr
			);
	return(out);
};

var M2 = function(vector, q,r) {
	var F1val = F1(q,r);
	var F2val = F2(q,r);
	var outp = transform(vector, 2*F1val-5*F2val, 0, F2val);
	return(outp);
};

var M3 = function(vector, theta, alpha, beta) {
	var A = Math.cos(theta/2)*Math.cos(theta/2-alpha)*Math.cos(theta/2-alpha+beta);
	var B1 = Math.cos(theta-alpha+beta)*Math.cos(theta/2-alpha);
	var B2 = Math.cos(theta-alpha)*Math.cos(theta/2-alpha+beta);
	var B3 = Math.cos(beta)*Math.cos(theta/2);
	var C1 = Math.cos(theta/2-alpha);
	var C2 = Math.cos(theta/2-alpha+beta);
	var C3 = Math.cos(theta/2);
	return (transformByEl(vector, A, [B1,B2,B3],[C1,C2,C3]));
};



var qq = function(theta, lambda) {
	return 2*Math.PI/lambda*2*Math.sin(Math.abs(theta/2));
}



var toSurface = function(config){
	
	var beta = M1(config.surface);
	var D = Math.cos(config.surface.phi); D = D*D; //cos squared
	
	
	var chi = transform(beta, 5*D-3, 1-D, 1); //TODO: correct formula
	config.chi = chi;
};


function DataHandler(){
}
DataHandler.prototype = {
	pressureInt: function(forceInternal, numUpdates, SA){
		
	},
	pressureExt: function(mass, SA){
		return pConst*mass*g/SA;
	},
	temp: function(spcName){
		return this.KEAvg(spcName)*tConst;
	},
	velocities: function(spcName){
		var spc = spcs[spcName];
		var numDots = spc.length
		var velocities = new Array(numDots);
		
		for (var dotIdx=0; dotIdx<numDots; dotIdx++){
			var dot = spc[dotIdx];
			velocities[dotIdx] = dot.speed();
		}
		return velocities;
	},
	velocityAvg: function(spcName){
		vList = this.velocities(spcName);
		var sum=0;
		for(var dotIdx=0; dotIdx<vList.length; dotIdx++){
			sum+=vList[dotIdx];
		}
		return sum/vList.length;
	},
	KEAvg: function(spcName){
		var sumKE=0;
		if(spcName){
			var dots = spcs[spcName];
			for(var dotIdx=0; dotIdx<dots.length; dotIdx++){
				sumKE+=dots[dotIdx].KE();
			}
			return sumKE/dots.length;
		}
		var numDots = 0;
		for(spcName in spcs){
			var dots = spcs[spcName];
			numDots+=dots.length;
			for(var dotIdx=0; dotIdx<dots.length; dotIdx++){
				sumKE+=dots[dotIdx].KE();
			}
		}
		return sumKE/numDots;
	},
	volume: function(){
		return walls.totalArea()*vConst;
	},
}
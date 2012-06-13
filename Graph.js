function Graph(x, y, width, height, xLabel, yLabel, pointColor, flashColor){
	this.width = width;
	this.height = height;
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/width;
	this.yStart = 1-this.borderSpacing/height;
	this.xEnd = .95;
	this.yEnd = .05
	this.gridSpacing = 40;
	this.hashMarkLen = 10;
	this.numXGridLines = Math.ceil(this.width*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing);
	this.numYGridLines = Math.ceil(this.height*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing);
	this.axisVals = [];
	this.pts = [];
	this.data = {x:[], y:[]};
	this.xRange = {min:0, max:0};
	this.yRange = {min:0, max:0};
	this.xAxisRange = {min:0, max:0};
	this.yAxisRange = {min:0, max:0};
	this.xStepSize;
	this.yStepSize;
	this.gridCol = "#484848";
	this.textCol = "white";
	this.pointCol = pointColor;
	this.flash = {col:flashColor, size: 1.5};
	this.graphBoundCol = "white";
	this.rectSideLen = 8;
	this.axisLabelFontSize = 15;
	this.axisValFontSize = 11;
	this.graph = Raphael(x, y, this.width, this.height);
	this.drawBGRect()
	this.drawBounds()
	this.drawGrid();
	this.drawLabels(xLabel, yLabel);
}
Graph.prototype = {
	drawBGRect: function(){
		this.bgRect = this.graph.rect(0,0,this.width,this.height,10);
		this.bgRect.attr("fill","#05111a");
	},
	drawBounds: function(){
		var ptOrigin = P(this.xStart*this.width, this.yStart*this.height);
		var ptYAxis = P(this.xStart*this.width, this.yEnd*this.height);
		var ptXAxis = P(this.xEnd*this.width, this.yStart*this.height);
		//var path = "M"+String(ptOrigin.x)+","+String(ptOrigin.y)+"L"+String(ptXAxis.x)+","+String(ptXAxis.y)+"L"+String(ptXAxis.x)+","+String(ptYAxis.y)+"L"+String(ptYAxis.x)+","+String(ptYAxis.y)+"L"+String(ptOrigin.x)+","+String(ptOrigin.y);
		var path = [P(ptOrigin.x, ptOrigin.y), P(ptXAxis.x,ptXAxis.y), P(ptXAxis.x, ptYAxis.y), P(ptYAxis.x, ptYAxis.y), P(ptOrigin.x,ptOrigin.y)]
		this.graphBounds = this.graph.path(makePath(path));
		this.graphBounds.attr("stroke",this.graphBoundCol);
	},
	removeBounds: function(){
		this.graphBounds.remove();
	},
	drawGrid: function(){
		this.xGrid = [];
		this.yGrid = [];
		for (var xGridIdx=0; xGridIdx<this.numXGridLines; xGridIdx++){
			var xPos = String(this.xStart*this.width + this.gridSpacing*xGridIdx);
			var yEnd = String(this.yEnd*this.height);
			var yAxis = String(this.yStart*this.height + this.hashMarkLen);
			this.xGrid.push(this.graph.path(makePath([P(xPos,yAxis),P(xPos,yEnd)])));
			this.xGrid[this.xGrid.length-1].attr("stroke",this.gridCol);
		}
		for (var yGridIdx=0; yGridIdx<this.numYGridLines; yGridIdx++){
			var yPos = String(this.yStart*this.height - this.gridSpacing*yGridIdx);
			var xEnd = String(this.xEnd*this.width);
			var xAxis = String(this.xStart*this.width - this.hashMarkLen);
			this.yGrid.push(this.graph.path(makePath([P(xAxis, yPos), P(xEnd, yPos)])));
			this.yGrid[this.yGrid.length-1].attr("stroke",this.gridCol);
		}
		
	},
	removeGrid: function(){
		for (var gridIdx=0; gridIdx<this.xGrid.length; gridIdx++){
			this.xGrid[gridIdx].remove();
		}
		for (var gridIdx=0; gridIdx<this.yGrid.length; gridIdx++){
			this.yGrid[gridIdx].remove();
		}
		this.xGrid = null;
		this.yGrid = null;
	},
	drawLabels: function(xLabel, yLabel){
		var xLabelPos = P(this.width*(this.xStart+this.xEnd)/2, Math.min(this.height*this.yStart+50, this.height-20))
		var yLabelPos = P(Math.max(this.width*this.xStart-50, 20),this.height*(this.yStart+this.yEnd)/2)
		this.xLabel = this.graph.text(xLabelPos.x, xLabelPos.y, xLabel);
		this.yLabel = this.graph.text(yLabelPos.x, yLabelPos.y, yLabel);
		this.yLabel.rotate(-90);
		this.xLabel.attr("fill",this.textCol);
		this.yLabel.attr("fill",this.textCol);
		this.xLabel.attr("font-size",this.axisLabelFontSize);	
		this.yLabel.attr("font-size",this.axisLabelFontSize);	
	},
	addPt: function(x, y){
		this.data.x.push(x);
		this.data.y.push(y);
		var mustRedraw = new Boolean();
		mustRedraw = false;
		if(x>this.xRange.max || x<this.xRange.min){
			this.xRange = this.range(this.data.x);
			mustRedraw = true;
		}
		if(y>this.yRange.max || y<this.yRange.min){
			this.yRange = this.range(this.data.y);
			mustRedraw = true;
		}
		if(mustRedraw){
			this.getAxisBounds();
			this.drawAxisVals();
			this.drawPts();		
		} else{
			var xPt = this.data.x[this.data.x.length-1]
			var yPt = this.data.y[this.data.y.length-1]
			this.drawPt(xPt, yPt);
		}
		this.flashLast();
	},
	plotData: function(xVals, yVals){
		if (xVals.length==yVals.length && xVals.length>1){
			this.data.x = xVals;
			this.data.y = yVals;
			this.xRange = this.range(this.data.x);
			this.yRange = this.range(this.data.y);
			this.getAxisBounds();
			this.drawAxisVals();
			this.drawPts();
		} else if (xVals.length!=yVals.length){
			console.log("xVals has ", xVals.length, "entries");
			console.log("yVals has ", yVals.length, "entries");
			console.log("UH-OH");
		};
	},
	getAxisBounds: function(){		
		var rangeX = this.xRange.max-this.xRange.min;
		if(rangeX!=0){
			var unroundStepX = rangeX/(this.numXGridLines-1);
			var expStepX = Math.pow(10, Math.floor(log10(unroundStepX)))
			this.xStepSize = Math.ceil(unroundStepX/expStepX)*expStepX;
			this.xAxisRange.min = Math.floor(this.xRange.min/this.xStepSize)*this.xStepSize;
			this.xAxisRange.max = this.xAxisRange.min + this.numXGridLines*this.xStepSize;
		}else{
			this.xAxisRange.min = Math.floor(this.xRange.min);
			this.xStepSize = .2;
			this.xAxisRange.max = this.xAxisRange.min + this.xStepSize*this.numXGridLines;	
		}
		
		var rangeY = Math.abs(this.yRange.max-this.yRange.min);
		if(rangeY!=0){
			var unroundStepY = rangeY/(this.numYGridLines-1);
			var expStepY = Math.pow(10, Math.floor(log10(unroundStepY)))
			this.yStepSize = Math.ceil(unroundStepY/expStepY)*expStepY;
			this.yAxisRange.min = Math.floor(this.yRange.min/this.yStepSize)*this.yStepSize;
			this.yAxisRange.max = this.yAxisRange.min + this.numYGridLines*this.yStepSize;
		}else{
			this.yAxisRange.min = Math.floor(this.yRange.min);
			this.yStepSize = .2;
			this.yAxisRange.max = this.yAxisRange.min + this.yStepSize*this.numYGridLines;	
			
		}
	},
	drawAxisVals: function(){
		this.removeAxisVals();
		for (var xGridIdx=0; xGridIdx<this.numXGridLines; xGridIdx++){
			var xPos = this.xStart*this.width + this.gridSpacing*xGridIdx;
			var yPos = this.yStart*this.height + this.hashMarkLen + 10;
			var val = String(round(this.xAxisRange.min + this.xStepSize*xGridIdx, 1));
			this.axisVals.push(this.graph.text(xPos, yPos, val));
			var last = this.axisVals[this.axisVals.length-1]
			last.attr("fill", this.textCol);
			last.attr("font-size", this.axisValFontSize);
		}
		for (var yGridIdx=0; yGridIdx<this.numYGridLines; yGridIdx++){
			var yPos = this.yStart*this.height - this.gridSpacing*yGridIdx;
			var xPos = this.xStart*this.width - this.hashMarkLen - 10;
			var val = String(round(this.yAxisRange.min + this.yStepSize*yGridIdx,1));
			this.axisVals.push(this.graph.text(xPos, yPos, val));
			var last = this.axisVals[this.axisVals.length-1]
			last.attr("fill", this.textCol);
			last.attr("font-size", this.axisValFontSize);
			last.rotate(-90);
		}		
		
	},
	removeAxisVals: function(){
		for (var valIdx=0; valIdx<this.axisVals.length; valIdx++){
			val = this.axisVals[valIdx];
			val.remove();
		}
		this.axisVals = [];
	},
	drawPts: function(){
		this.removePts();
		for (var ptIdx=0; ptIdx<this.data.x.length; ptIdx++){
			var xVal = this.data.x[ptIdx];
			var yVal = this.data.y[ptIdx];
			this.drawPt(xVal, yVal);
		}
	},
	drawPt: function(xVal, yVal){
		var xRange = this.xAxisRange.max-this.xAxisRange.min;
		var yRange = this.yAxisRange.max-this.yAxisRange.min;
		var xPt = Math.abs(this.xEnd-this.xStart)*this.width*(xVal-this.xAxisRange.min)/xRange + this.xStart*this.width;
		var yPt = this.height - (1-this.yStart)*this.height - Math.abs(this.yEnd-this.yStart)*this.height*(yVal-this.yAxisRange.min)/yRange;
		var halfSideLen = this.rectSideLen/2;
		this.pts.push(this.graph.rect(xPt-halfSideLen, yPt-halfSideLen, this.rectSideLen, this.rectSideLen,1));
		var last = this.pts[this.pts.length-1]
		last.attr("fill",this.pointCol);
		var trans = 'r45,'+xPt+','+yPt;
		last.transform(trans);
	},
	flashLast: function(){
		var pt = this.pts[this.pts.length-1];
		var height = pt.attrs.height;
		var width = pt.attrs.width;
		var changeDim = (this.flash.size-1)*height/2;
		var x = pt.attrs.x;
		var y = pt.attrs.y;
		pt.attr({x:x-changeDim, y:y-changeDim, height:this.flash.size*height, width:this.flash.size*width, fill:this.flash.col})
		var anim = this.animToNorm(x, y, width, height)
		pt.animate(anim);
		pt.attr({x:x, y:y, width:width, height:height, fill:this.pointCol});
	},
	animToNorm: function(x, y, width, height){
		return Raphael.animation({x:x, y:y, width:width, height:height, fill:this.pointCol}, .15e3);
	},
	removePts: function(){
		for (var ptIdx=0; ptIdx<this.pts.length; ptIdx++){
			var pt = this.pts[ptIdx];
			pt.remove();
		}
		this.pts = [];
	},
	range: function(list){
		var min = Number.MAX_VALUE;
		var max = -Number.MAX_VALUE;
		for (var listIdx=0; listIdx<list.length; listIdx++){
			var listVal = list[listIdx]
			min = Math.min(min, listVal);
			max = Math.max(max, listVal);
		}
		return {min:min, max:max};
	},
	remove: function(){
		this.removePts();
		this.removeAxisVals();
		this.xLabel.remove();
		this.yLabel.remove();
		this.removeGrid();
		this.removeBounds();
		this.bgRect.remove();
		this.graph.remove();
	},

}


function PieSlice(vp) {
	
	var path = vp.path().attr({fill: 'white'})
	var innerRadius = 0;
	var outerRadius = 100;
	var minDiffRadius = 100; // TODO 10 original, 100 nur für test
	var diffRadius = 100;
	var startDegree = -20;
	var degree = 40;
	var childMinDegree = 20; 
	var childAutoDegree = 40;
	var childSpacingDegree = 2;
	var vp = vp;
	var children = new Array();
	var parent = false;
	var open = false;
    var color = "white";
    
    /* animation mode, + = show, - = hide*/
    var mode = '+';
	
	this.init = function()
	{	
	  /* add click event listener to path */
	  var pie = this;
	  path.click(function () {
	    pie.onClick();
	  });	  
	};
	
	this.setStartDegree = function(value)
	{
	  startDegree = value;
	};
   
	this.setDegree =  function(value)
	{
	  degree = value;
	};	
	
	this.setChildAutoDegree = function(value)
	{
	  childAutoDegree = value;
	};	
	
	this.setInnerRadius = function(value)
	{
	  innerRadius = value;
	};

	this.setOuterRadius = function(value)
	{
	  outerRadius = value;
	};	
    
	this.setParent = function(value)
	{
	  parent = value;
	};
	
	this.setColor = function(value)
	{
	  path.attr({fill: value})
	};
	
	this.isOpen = function()
	{
	  return open;
	};
	
	this.hide = function()	
	{
	  path.hide();
	};

	this.show = function()	
	{
	  path.show();
	};	
	
	this.add = function(pie)	
	{
	  children.push(pie);
	  pie.setParent(this);
	  pie.setInnerRadius(outerRadius+5)
	  pie.setOuterRadius(outerRadius+diffRadius+5)
	};
	
	this.activate = function()
	{
	  this.drawCenter();
	  this.showClosedChilden();
    };
	
    this.drawCenter = function()
    {
      var c = vp.circle(0, 0, outerRadius).attr({fill: "#fff"});
      
      var pie = this;
      c.click(function () {
        pie.onClick();
      });
    }
    
    this.showClosedChilden = function()    
    {      
      minStartDegree = startDegree + ( childAutoDegree / 2 - childMinDegree + childSpacingDegree);      	    	
      var sumDegree = children.length * (childMinDegree + childSpacingDegree);
  	  var sDegree = minStartDegree - (sumDegree / 2) + (childMinDegree / 2) + (childSpacingDegree / 2);	    	

      // +5 is for the spacing between the elements
  	  for (var i in children)
  	  {  		  
  		children[i].setStartDegree(sDegree);
  	    children[i].setDegree(childMinDegree);
  	    children[i].setOuterRadius(outerRadius + 5 + minDiffRadius);
  	    children[i].draw();
  	    
  	    sDegree = sDegree + childMinDegree + childSpacingDegree;
  	  }
    }
    
    this.hideClosedChildren = function()
    {
      for (var i in children)
        children[i].hide();
    };
    
    
	this.openChildren = function() 
	{		      
	  mode = "+";
	  this.drawChildrenAnimationDegree(childMinDegree, childAutoDegree);
	  this.drawChildrenAnimationRadius(minDiffRadius, diffRadius);
	};		
	
	this.closeChildren = function() 
	{		      
  	  for (var i in children)	  
  	  {
	    children[i].hideClosedChildren();
	    if (children[i].isOpen())
	      children[i].closeChildren();
  	  }
  	  
  	  mode = "-";
	  this.drawChildrenAnimationDegree(childAutoDegree, childMinDegree);
	  this.drawChildrenAnimationRadius(diffRadius, minDiffRadius);
	};		
	
	
	
	this.drawChildrenAnimationDegree = function(cDegree, maxDegree)
	{
		/*
	  if (mode == '+')
      {
		  
	    var sumDegree = children.length * (cDegree + (childSpacingDegree-1));
	    var sDegree = startDegree - (sumDegree / 2) + (cDegree / 2) + (childSpacingDegree / 2);
	  /*  
      } else {
      */
    	minStartDegree = startDegree + ( childAutoDegree / 2 - childMinDegree + childSpacingDegree);
    	var sumDegree = children.length * (cDegree + childSpacingDegree);
  	    var sDegree = minStartDegree - (sumDegree / 2) + (cDegree / 2) + (childSpacingDegree / 2);	    		  
	  //}
	  
	  	  
	  for (var i in children)
	  {
		children[i].setStartDegree(sDegree);
		children[i].setDegree(cDegree);
	    children[i].draw()
	   
	    sDegree = sDegree + cDegree + childSpacingDegree;
	  }

	  var thisC = this;
	  if (mode == '+' && cDegree < maxDegree)	  		
        setTimeout(function () { thisC.drawChildrenAnimationDegree(cDegree+2, maxDegree, mode); }, 100);
	  else if (mode == '+')	  
		for (var i in children)	  
		  children[i].showClosedChilden();	  
	  else if (mode == '-' && cDegree > maxDegree)
		setTimeout(function () { thisC.drawChildrenAnimationDegree(cDegree-2, maxDegree, mode); }, 100);
	  
	};
	
	this.drawChildrenAnimationRadius = function(cRadius, maxRadius)
	{
	  for (var i in children)
	  {
		children[i].setOuterRadius(outerRadius + 5 + cRadius);
		children[i].draw()
	  }		
	
	  var thisC = this;
      if (mode == '+' && cRadius < maxRadius)
	    setTimeout(function () { thisC.drawChildrenAnimationRadius(cRadius+10, maxRadius, mode); }, 100);
      else if (mode == '-' && cRadius > maxRadius)
  	    setTimeout(function () { thisC.drawChildrenAnimationRadius(cRadius-5, maxRadius, mode); }, 100);
	}
	
	
    this.draw = function()
    {
      this.show();
      this.updatePath(startDegree, startDegree+degree);
    };
	
	this.onClick = function ()
	{
	  if (!open)
	    this.openChildren();
	  else
	  	this.closeChildren();	  
	  open = !open
	};
    
	this.updatePath = function(a1, a2)
	{
      a1 = (a1 % 360) * Math.PI / 180;
	  a2 = (a2 % 360) * Math.PI / 180;
		  
	  var isx = innerRadius * Math.cos(a1);
	  var isy = innerRadius * Math.sin(a1);
	  var iex =  innerRadius * Math.cos(a2);
	  var iey =  innerRadius * Math.sin(a2);	  

	  var osx = outerRadius * Math.cos(a1);
	  var osy = outerRadius * Math.sin(a1);
	  var oex =  outerRadius * Math.cos(a2);
	  var oey =  outerRadius * Math.sin(a2);	  
		  		  
	  var p = [["M", iex, iey],  
	           ["A", innerRadius, innerRadius, 0, 0, 0, isx, isy],
	           ["L", osx, osy], 
	           ["A", outerRadius, outerRadius, 0, 0, 1, oex, oey],
	           ["z"]];
	  path.attr({path: p, stroke: "#fff"});
	};
    
	this.init();
}

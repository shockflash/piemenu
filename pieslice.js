

function PieSlice(vp) {
	
	var childMinDegree = 6; 
	var childAutoDegree = 40;
	var degree = 50;
	var childSpacingDegree = 2;	
	var diffRadius = 120;
	var minDiffRadius = 10;
	
	var path = vp.path().attr({fill: 'white', stroke: "none", cursor: 'pointer'})
	var innerRadius = 0;
	var outerRadius = 120;
	 	
	var startDegree = 0;
	var centerDegree = 0; // center of the current degree 	
	var vp = vp; // raphael viewpoint
	var children = new Array(); // child
	var parent = false;
	var open = false; // 
    var color = false; // color of the pie element      
    var mode = '+'; // animation mode, + = show, - = hide
	
	this.init = function()
	{	
	  /* add click event listener to path */
	  var pie = this;
	  path.click(function () {
	    pie.onClick();
	  });	  
	};
	
	this.setStartDegree = function(value) { startDegree = value; };
   
	this.setDegree =  function(value) { degree = value; };	
		
	this.setInnerRadius = function(value) { innerRadius = value; };

	this.setOuterRadius = function(value) { outerRadius = value; };	
    
	this.setParent = function(value) { parent = value; };
	
	this.setColor = function(value) { color = value; path.attr({fill: value}) };
	
	this.isOpen = function() { return open; };
	
	this.hide = function() { path.hide(); };

	this.show = function() { path.show(); };
	
	this.toFront = function() { path.toFront() };
	
	this.add = function(pie)	
	{
	  children.push(pie);
	  pie.setParent(this);
	  pie.setInnerRadius(outerRadius)
	  pie.setOuterRadius(outerRadius+diffRadius+5)
	};
	
	this.activate = function()
	{
	  if (!color)
	    this.setColor("white");		
		
	  this.drawCenter();
	  this.showClosedChilden();
    };
	
    this.drawCenter = function()
    {
      var c = vp.circle(0, 0, outerRadius).attr({fill: color, cursor: 'pointer'});     
      var pie = this;
      c.click(function () { pie.onClick(); });
      
      //vp.text(0, 0, "Click me");
      vp.print(200, 200, "Click me", vp.getFont("Verdana"), 30).attr({fill: "#fff"});
      
      var txt = vp.print(10, 50, "print", vp.getFont("Museo"), 30).attr({fill: "#fff"});
    }
    
    this.showClosedChilden = function()    
    {  
      centerDegree = 0;
      if (parent)
        centerDegree = startDegree + (childAutoDegree / 2);    	
      var sumDegree = children.length * (childMinDegree + (childSpacingDegree-1));                 
      var sDegree = (centerDegree - ( sumDegree / 2 ));

      // +5 is for the spacing between the elements
  	  for (var i in children)
  	  {  		  
  		children[i].setStartDegree(sDegree);
  	    children[i].setDegree(childMinDegree);
  	    children[i].setOuterRadius(outerRadius + childSpacingDegree + minDiffRadius);
  	    children[i].draw();
  	    children[i].show();  	    
  	    sDegree = sDegree + childMinDegree + childSpacingDegree;
  	  }
    }
    
    this.hideClosedChildren = function()
    {
      for (var i in children)
        children[i].hide();
    };
    
    
    this.closeNeighbours = function(caller)
    {    	
      for (var i in children)
        if (children[i].isOpen() && children[i] != caller)
          children[i].closeChildren(); 	
    };
    
	this.openChildren = function() 
	{		      
	  open = true;	
		
	  if (parent)
	    parent.closeNeighbours(this)
	  
	  mode = "+";
	  this.drawChildrenAnimationDegree(childMinDegree, childAutoDegree);
	  this.drawChildrenAnimationRadius(minDiffRadius, diffRadius);
	};		
	
	this.closeChildren = function() 
	{		      
      open = false;
		
  	  for (var i in children)	  
  	  {
	    children[i].hideClosedChildren();
	    if (children[i].isOpen())
	      children[i].closeChildren();
	    
	    // if our own parent is already closed, we directly hide our children
		if (parent && !parent.isOpen())
		  children[i].hide();	    
  	  }
  	  
  	  mode = "-";
	  this.drawChildrenAnimationDegree(childAutoDegree, childMinDegree);
	  this.drawChildrenAnimationRadius(diffRadius, minDiffRadius);
	};		
	
	this.drawChildrenAnimationDegree = function(cDegree, maxDegree)
	{	  
	  centerDegree = 0;
	  if (parent)
	    centerDegree = startDegree + (childAutoDegree / 2);    	
	  var sumDegree = children.length * (cDegree + (childSpacingDegree-0.4));                 
	  var sDegree = (centerDegree - ( sumDegree / 2 ));		
		
	  for (var i in children)
	  {
		children[i].setStartDegree(sDegree);
		children[i].setDegree(cDegree);
	    children[i].draw()	   
	    sDegree = sDegree + cDegree + childSpacingDegree;
	  }

	  var thisC = this;
	  if (mode == '+' && cDegree < maxDegree)	  		
        setTimeout(function () { thisC.drawChildrenAnimationDegree(cDegree+2, maxDegree, mode); }, 10);
	  else if (mode == '+')	{
		for (var i in children)	  
		{
		  children[i].toFront();
		  children[i].showClosedChilden();
	    }  
	  } else if (mode == '-' && cDegree > maxDegree)
		setTimeout(function () { thisC.drawChildrenAnimationDegree(cDegree-2, maxDegree, mode); }, 10);
	  
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
	    setTimeout(function () { thisC.drawChildrenAnimationRadius(cRadius+10, maxRadius, mode); }, 10);
      else if (mode == '-' && cRadius > maxRadius)
  	    setTimeout(function () { thisC.drawChildrenAnimationRadius(cRadius-5, maxRadius, mode); }, 10);
	}
	
	
    this.draw = function()
    {
      if (!color)
        this.setColor(Raphael.getColor());
    	
      this.updatePath(startDegree, startDegree + degree);
    };
	
	this.onClick = function ()
	{	
	  if (!open)
	    this.openChildren();
	  else
	  	this.closeChildren();	  
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
	  path.attr({path: p});
	};
    
	/* calls the constructor */
	this.init();
}

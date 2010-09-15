
/**
 * Baseclass of the PieSlice Flashport. 
 * You need the raphael library to use it: http://raphaeljs.com/
 * 
 * Usage example:
 * 
 * Javascript:
 *  var r = Raphael("holder");
 *  r.canvas.setAttribute('viewBox', '-400 -400 800 800');
 *  var cake = new PieSlice(r);
 *  var pie1 = new PieSlice(r);  
 *  cake.add(pie1);
 *  var pie2 = new PieSlice(r);  
 *  cake.add(pie2);
 *  cake.activate();
 *  
 * HTML:
 *  <div id="holder"></div>
 */
function PieSlice(vp) {
	
	/* some sort of constants. */
	var childMinDegree = 6; 
	var childAutoDegree = 40;
	var degree = 50;
	var childSpacingDegree = 2;	
	var diffRadius = 120;
	var minDiffRadius = 10;
	
	/* The svg/raphael path element that is used to draw the pie */
	var path = vp.path().attr({fill: 'white', stroke: "none", cursor: 'pointer'})
	
	/* Every pie element has an inner and outer radius, that are connected by
	 * lines to finish the pie. The inner radius is near the center, the outer
	 * radius of away of the center. */
	var innerRadius = 0; 
	var outerRadius = 120;   
	 	
	var startDegree = 0; // start-degree of the pie element in its circle around the center
	var centerDegree = 0; // center of the current degree 	
	var vp = vp; // raphael viewpoint
	var children = new Array(); // child
	var parent = false; // parent pie, the center-pie has no parent
	var open = false; // true if the pie is open (was clicked) 
    var color = false; // color of the pie element      
    var mode = '+'; // animation mode, + = show, - = hide
	
    /**
     * "constructor", called at the end of the class 
     */
	this.init = function()
	{	
	  /* add click event listener to path */
	  var pie = this;
	  path.click(function () {
	    pie.onClick();
	  });	  
	};
	
	/**
	 * getter and setter 
	 */
	this.setStartDegree = function(value) { startDegree = value; };   
	this.setDegree =  function(value) { degree = value; };			
	this.setInnerRadius = function(value) { innerRadius = value; };
	this.setOuterRadius = function(value) { outerRadius = value; };	    
	this.setParent = function(value) { parent = value; };	
	this.setColor = function(value) { color = value; path.attr({fill: value}) };	
	this.isOpen = function() { return open; };
	
	/**
	 * some indirect calls to path-methods
	 */
	this.hide = function() { path.hide(); };
	this.show = function() { path.show(); };	
	this.toFront = function() { path.toFront() };
	
	/**
	 * Add a new sub-pie to this pie.
	 * We manage the subpies in an array. We also give the new subpie the
	 * inner and outer radius values. The inner radius never change after this. 
	 */
	this.add = function(pie)	
	{
	  children.push(pie);
	  pie.setParent(this);
	  pie.setInnerRadius(outerRadius)
	  pie.setOuterRadius(outerRadius+diffRadius+5)
	};
	
	/**
	 * Activate the center (first) pie element. Activate the first closed child
	 * elements. 
	 */
	this.activate = function()
	{
	  if (!color)
	    this.setColor("white");		
		
	  this.drawCenter();
	  this.showClosedChilden();
    };
	
    /**
     * Special method to create the center circle. The original PieSlice used
     * a 360° pie here, but this doesn't seem to work in svg, so we create a real
     * circle instead. This means that the original pie-path is not used in the
     * center pie.
     */
    this.drawCenter = function()
    {
      var c = vp.circle(0, 0, outerRadius).attr({fill: color, cursor: 'pointer'});     
      var pie = this;
      c.click(function () { pie.onClick(); });
      
      var t = vp.text(0, 0, "Click me").attr({font: '50px Helvetica, Arial', opacity: 0.5, cursor: 'pointer'});
      t.click(function () { pie.onClick(); });
    }
    
    /**
     * Every opened pie, that have subpies added to it, shows them as small
     * mini-pies at its border. This is done here  
     */
    this.showClosedChilden = function()    
    {  
      centerDegree = 0;
      if (parent)
        centerDegree = startDegree + (childAutoDegree / 2);    	
      var sumDegree = children.length * (childMinDegree + (childSpacingDegree-1));                 
      var sDegree = (centerDegree - ( sumDegree / 2 ));

      /* +5 is for the spacing between the elements */
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
    
    /**
     * Hide the not-open pie elements directly via hide. This prevent many
     * odd animations when a parent element is closed. 
     */
    this.hideClosedChildren = function()
    {
      for (var i in children)
        children[i].hide();
    };
    
    /**
     * Called to close currently open pies, that are subpies of a pie, that is
     * no longer the selected pie. 
     * Short: Close every pie that is not the currently clicked pie. 
     */
    this.closeNeighbours = function(caller)
    {    	
      for (var i in children)
        if (children[i].isOpen() && children[i] != caller)
          children[i].closeChildren(); 	
    };
    
    /**
     * Opens all child element of a pie in a nice animation. 
     */
	this.openChildren = function() 
	{		      
	  open = true;	
      
	  /* If this element has a parent, we ask it to close other pie that are
	   * not "ours" */
	  if (parent)
	    parent.closeNeighbours(this)
	  
	  mode = "+";
	  this.drawChildrenAnimationDegree(childMinDegree, childAutoDegree);
	  this.drawChildrenAnimationRadius(minDiffRadius, diffRadius);
	};		
	
	/** 
	 * Close the children of this pie. This is done in a nice animation.
	 */
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
	
	/**
	 * Controls the animation of the open/closing of the children pies of this
	 * pie, related to the position/width in the graphic. 
	 * The same method is used for opening and closing, this is controlled
	 * by the "mode" variable of the instance. 
	 */
	this.drawChildrenAnimationDegree = function(cDegree, maxDegree)
	{
	  /* The center pie element has no outer degree, so we set it fix to 0.
	   * For the real pies, we calculate the middle of the pie */
	  centerDegree = 0;
	  if (parent)
	    centerDegree = startDegree + (childAutoDegree / 2);    	
	  
	  /* the complete radius that is needed by all child elements */
	  var sumDegree = children.length * (cDegree + (childSpacingDegree-0.4));
	  
	  /* from the center point of this pie, minus the half of the width of all
	   * child elements, we now where to set the first sub-pie.  */
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
	
	/**
	 * Controls the animation of the open/closing of the children pies of this
	 * pie, related to the height in the graphic. 
	 * The same method is used for opening and closing, this is controlled
	 * by the "mode" variable of the instance. 
	 */
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
	
	/**
	 * Is called when a redraw of the pie is needed 
	 */
    this.draw = function()
    {
      if (!color)
        this.setColor(Raphael.getColor());
    	
      this.updatePath(startDegree, startDegree + degree);
    };
	
    /**
     * Handles the on-click event to open/close the pie
     */
	this.onClick = function ()
	{	
	  if (!open)
	    this.openChildren();
	  else
	  	this.closeChildren();	  
	};
    
	/**
	 * Do the dirty job of updating the svg path object. The math isn't very
	 * complex, big part of the job is to calculate the edges of the pie, which
	 * are connected by lines and arcs.
	 */
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
		  		  
	  var p = [["M", iex, iey], // move-to
	           ["A", innerRadius, innerRadius, 0, 0, 0, isx, isy], // arc
	           ["L", osx, osy],  // line
	           ["A", outerRadius, outerRadius, 0, 0, 1, oex, oey], // arc
	           ["z"]]; // close the pie, is like a line from end or arc to the startpoint
	  path.attr({path: p});
	};
    
	/* calls the constructor */
	this.init();
}

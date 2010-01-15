// vi:ts=4:sw=4

//////////////////////////////////////////////////////////////////////
/* SimpleBinaryTree documentation: {{{
 *
 * SimpleBinaryTree object represents one binary tree, with no smart
 * algorithm to keep it balanced.
 *
 * After creating a SimpleBinaryTree object, it is needed to attach it
 * to some DOM element. Use attachToElement() method for this. All
 * children of the element will be removed before this tree is attached.
 * The tree can be acessed by .relatedObject property from DOM element.
 * The DOM element is available through .container property.
 *
 * It is also needed to set a TreeConfig object. The object must be
 * manually created. Use .setconfig() (the setter) to set it.
 *
 * The only methods available to modify the tree are search(), insert(),
 * remove() and removeNode().
 *
 * After any change is made to tree, update_positions() method must be
 * called to update position of all tree nodes and their related DOM
 * elements. This allows the user to make a lot of changes to the tree
 * and update only once, after all changes were made.
 *
 *
 * SimpleBinaryTree object
 *  -constructor:
 *     new SimpleBinaryTree()
 *  -methods:
 *     toString()
 *     attachToElement(elem)	// Attaches this node to 'elem' DOM element. Pass null to detach from current element.
 *     update_positions()		// Runs recalculate_subtree_width() and recalculate_positions() on root node.
 *
 *     search(key)
 *     insert(key)
 *     remove(key)
 *     removeNode(node)
 *
 *     traverse(order,callback,...) // Traverse the (sub)tree
 *  -properties:
 *     _config_			// Pointer to a TreeConfig object
 *
 *     rootNode				// Pointer to root node.
 *     container			// DOM element to which the tree is attached.
 *     lines_container		// DOM element to contain the lines.
 *  -properties with getter and setter:
 *     config			// Pointer to a TreeConfig object
 * }}} */
// {{{
function SimpleBinaryTree() {
	this.rootNode=null;
	this.container=null;
	this.lines_container=null;
	this._config_=null;
}

SimpleBinaryTree.prototype.toString = function() { return '[object SimpleBinaryTree]'; };

SimpleBinaryTree.prototype.getconfig = function() { return this._config_; }
SimpleBinaryTree.prototype.setconfig = function(configObj) { this._config_=configObj; }


// Pass null to detach from any attached element.
// Note this WILL NOT modify current nodes in tree.
// This method should only be called when the tree is empty.
// This will remove all elements from 'elem'.
SimpleBinaryTree.prototype.attachToElement = function(elem) {
	if( this.container ) {
		delete this.container.relatedObject;
		if( this.lines_container ) {
			this.container.removeChild(this.lines_container);
		}
	}
	if( elem ) {
		if( elem.relatedObject ) {
			alert("Error condition found inside "+this+".attachToElement("+elem+"): elem.relatedObject is not null/false/undefined. Maybe attaching this object to an element already attached by another object!");
		}
		this.container=elem;
		elem.relatedObject=this;
		removeChildNodes(elem);
		this.lines_container=document.createElement("div");
		this.lines_container.setAttribute("class","linehackcontainer");
		elem.appendChild(this.lines_container);
	}
};

SimpleBinaryTree.prototype.update_positions = function() {
	if( this.rootNode ) {
		this.rootNode.recalculate_subtree_width(1);
		this.rootNode.recalculate_positions(0,0);
	}
};

// Warning: code written at 12 am. Maybe it is not written the best way it can.
SimpleBinaryTree.prototype.update_lines = function() {

	function new_line(x1,y1,x2,y2) {
		var outer, inner;
		var minx, maxx, leftborder, rightborder;
		var line_width=2;  // This will be read from somewhere else, like treeconfig object.

		if( y1>y2 ) {  // Swap them!
			var t;
			t=y1;
			y1=y2;
			y2=t;
			t=x1;
			x1=x2;
			x2=t;
		}

		if( x1==x2 ) {
			append_debug(this+'.update_lines(): Code for x1==x2 is not written yet!\n');
		}
		else if( y1==y2 ) {
			append_debug(this+'.update_lines(): Code for y1==y2 is not written yet!\n');
		}

		outer=document.createElement("div");
		outer.setAttribute("class","linehack");
		inner=document.createElement("div");
		inner.setAttribute("class","linehack");
		outer.appendChild(inner);

		minx=(x1<x2?x1:x2);
		maxx=(x1>x2?x1:x2);

		rightborder=(x1-x2>0?x1-x2:0);
		leftborder=(x2-x1>0?x2-x1:0);

/*
		// As linhas seguintes eu sei que funcionam (exceto para delta_x ou delta_y muito pequenos)
		outer.setAttribute("style","top: "+y1+"px; left: "+minx+"px; border-width: "+(y2-y1)+"px "+rightborder+"px 0 "+leftborder+"px;");
//		inner.setAttribute("style","bottom: -"+line_width+"px; "+(rightborder>0?"left: ":"right: ")+line_width+"px; border-width: inherit;");
		inner.setAttribute("style","bottom: 0; "+(rightborder>0?"left":"right")+": "+line_width+"px; border-width: "+(y2-y1-line_width>0?y2-y1-line_width:0)+"px "+(rightborder-line_width>0?rightborder-line_width:0)+"px 0 "+(leftborder-line_width>0?leftborder-line_width:0)+"px;");
*/

		inner.setAttribute("style","bottom: 0; "+(rightborder>0?"left":"right")+": "+line_width+"px; border-width: "+(y2-y1)+"px "+rightborder+"px 0 "+leftborder+"px;");
		if( rightborder>0 ) rightborder+=line_width;
		if( leftborder>0 ) leftborder+=line_width;
		outer.setAttribute("style","top: "+y1+"px; left: "+minx+"px; border-width: "+(y2-y1+line_width)+"px "+rightborder+"px 0 "+leftborder+"px;");

		return outer;
	}

	var t;
	t=new_line(1,1, 61,61);
	this.lines_container.appendChild(t);

	t=new_line(121,1, 61,61);
	this.lines_container.appendChild(t);

	t=new_line(121,121, 61,61);
	this.lines_container.appendChild(t);

	t=new_line(1,121, 61,61);
	this.lines_container.appendChild(t);

	t=new_line(140,5, 142,65);
	this.lines_container.appendChild(t);

	// Well it works. It can draw lines good enough for me (or for this application).
	// Lines almost vertical or almost horizontal (small delta_x or delta_y) will be a bit ugly.
	// line_width must not be very big.

	// These lines must not cross, or one will be on top of other!
	// (if really need to cross them, must split in smaller parts)
};

// Will return two values:
//  - node  (the last node visited, or the node found; will be null if the tree is empty)
//  - found (boolean, true if the key/node was found)
SimpleBinaryTree.prototype.search = function(key) {
	if( !this.rootNode )
		return {node: null , found: false};
	var e=this.rootNode;
	while( e && e.getkey()!=key ) {
		if( key<e.getkey() )
			if( e.getleft_child() ) e=e.getleft_child();
			else break;
		else
			if( e.getright_child() ) e=e.getright_child();
			else break;
	}
	if( e.getkey()==key )
		return {node: e , found: true};
	else
		return {node: e , found: false};
};

// Returns false on error.
SimpleBinaryTree.prototype.insert = function(key) {
	if( !this.rootNode ) {
		this.rootNode=new TreeNode(key,this.getconfig(),this.container);
		return true;
	}
	else {
		var t=this.search(key);
		if( t.found )
			return false;
		else {
			var node=new TreeNode(key,this.getconfig(),this.container);
			t=t.node;
			// t.node cannot be null here.
			if( key < t.getkey() )
				t.setleft_child(node);
			else
				t.setright_child(node);
			return true;
		}
	}
};


//This function returns the same value of removeNode()
SimpleBinaryTree.prototype.remove = function(key) {
	var t=this.search(key);
	if( t.found )
		return this.removeNode(t.node);
};


//This function does not return any value. 
SimpleBinaryTree.prototype.removeNode = function(node) {
	var left=node.getleft_child();
	var right=node.getright_child();
	var parent=node.getparent();  //This will fail if node is the root node

	if( !left && !right) {  // Leaf node
		if( node==this.rootNode )
			this.rootNode=null;
		node.unlink_dom_node();
		node.unlink_from_parent();
		return;
	}

	var child;
	if( left && !right ) {
		child=left;
	}
	else if( !left && right ) {
		child=right;
	}
	if(child) {
		if( node==this.rootNode )  // if( !parent )
			this.rootNode=child;
		else if( parent.getleft_child()==node )
			parent.setleft_child(child);
		else
			parent.setright_child(child);
		node.unlink_dom_node();
	}

	if( left && right ) {
		var tmp=node.find_next_node();  // I don't check if it will fail, because it cannot fail.
		node.setkey( tmp.getkey() );
		this.removeNode(tmp);
	}
};


SimpleBinaryTree.prototype.traverse = function() {
	if( this.rootNode )
		this.rootNode.traverse.apply(this.rootNode,arguments);
};


// }}}
// End of SimpleBinaryTree object

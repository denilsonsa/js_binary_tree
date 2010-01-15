// vi:ts=4:sw=4
/* Documentation:
 *
 * TreeNode object
 *  -constructor:
 *     new TreeNode(key,parentNode)
 *  -methods:
 *     toString()
 *     unlink_child(child)	// Unlinks 'child' from this this node. Only this node is changed; 'child.parent' is not changed.
 *     unlink_dom_node()	// Unlinks the DOM node of this object (just remove it from its parent).
 *     recalculate_subtree_width(deep)  // Recalculates subtree width. If "deep", then do not use cached values.
 *     recalculate_positions(parent_x,parent_y)  // Recalculates the (x,y) position for the entire subtree.
 *  -properties:
 *     _key_			// Internal key
 *     _x_				// Internal x position
 *     _y_				// Internal y position
 *     _parent_			// Pointer to parent TreeNode
 *     _left_child_		// Pointer to left-child TreeNode
 *     _right_child_	// Pointer to right-child TreeNode
 *
 *     node_width		// Node width, measured in px
 *     node_height		// Node height, measured in px
 *     subtree_width	// Width of subtree with this node as root
 *
 *     elementNode		// DOM element Node.
 *     _text_			// The TextNode containing the node text
 *  -properties with getter and setter:
 *  (I really wanted to use real getter/setter, but only Gecko supports it,
 *  and other browsers don't seem to want to implement it)
 *     key				// The key
 *     x				// The x position
 *     y				// The y position
 *     left_child
 *     right_child
 *     parent
 *
 * TreeNode.elementNode.childNodes contains:
 *  -The text at position 0
 */

function TreeNode(key,parentNode) {
	this._key_=key;
	this._x_=0;
	this._y_=0;
	this.node_width=32+2*3+2*3;  // This must be width+padding+border+margin
	this.node_height=16+2*3+2*3;  // This must be width+padding+border+margin
	this.subtree_width=0;

	this._parent_=null;
	this._left_child_=null;
	this._right_child_=null;

	this.elementNode=document.createElement("div");
	this.elementNode.relatedObject=this;
	this.elementNode.setAttribute("class","treenode");

	this._text_=document.createTextNode(this._key_)
	this.elementNode.appendChild(this._text_);

	if(parentNode)
		parentNode.appendChild(this.elementNode);
}

TreeNode.prototype.toString = function() { return '[object TreeNode: '+this.key+" ("+this.x+","+this.y+")"+']'; };

TreeNode.prototype.getkey = function() { return this._key_; };
TreeNode.prototype.setkey = function(key) { this._key_=key; this._text_.nodeValue=key; return key; };

TreeNode.prototype.getx = function() { return this._x_; };
TreeNode.prototype.setx = function(x) { this._x_=x; this.elementNode.style.left=x+'px'; return x; };

TreeNode.prototype.gety = function() { return this._y_; };
TreeNode.prototype.sety = function(y) { this._y_=y; this.elementNode.style.top=y+'px'; return y; };

TreeNode.prototype.unlink_dom_node = function() { if(this.elementNode.parentNode) this.elementNode.parentNode.removeChild(this.elementNode); };

TreeNode.prototype.unlink_child = function(child) {
	if(child == this._left_child_)
		this._left_child_=null;
	else if(child == this._right_child_)
		this._right_child_=null;
};

TreeNode.prototype.getparent = function() { return this._parent_; };
TreeNode.prototype.setparent = function(p) { append_debug('Warning! TreeNode.parent being assigned!\n'); this._parent_.unlink_child(this); this._parent_=p; return this._parent_; };

TreeNode.prototype.getleft_child = function() { return this._left_child_; };
TreeNode.prototype.setleft_child = function(child) {
	if(this._left_child_) {  // Must unlink old child
		this._left_child_._parent_=null;
	}
	if(child._parent_) {  // Trying to unlink old parent link
		child._parent_.unlink_child(child);
	}
	this._left_child_=child;
	child._parent_=this;
	return this._left_child_;
};

TreeNode.prototype.getright_child = function() { return this._right_child_; };
TreeNode.prototype.setright_child = function(child) {
	if(this._right_child_) {  // Must unlink old child
		this._right_child_._parent_=null;
	}
	if(child._parent_) {  // Trying to unlink old parent link
		child._parent_.unlink_child(child);
	}
	this._right_child_=child;
	child._parent_=this;
	return this._right_child_;
};



TreeNode.prototype.recalculate_subtree_width = function(deep) {
	this.subtree_width=this.node_width;
	var children=[ this.getleft_child(), this.getright_child() ];
	for(var i=0, e; i<children.length; i++)
		if(e=children[i])
			if(deep || e.subtree_width==0)
				this.subtree_width += e.recalculate_subtree_width();
			else
				this.subtree_width += e.subtree_width;

	return this.subtree_width;
};


// This must be called on root node, with 0 as parameter.
// recalculate_subtree_width() must be called before this function.
TreeNode.prototype.recalculate_positions = function(parent_x, parent_y) {
	var left=this.getleft_child();
	var right=this.getright_child();

	var left_size=0;
	if( left )
		left_size=left.subtree_width;

	this.setx(parent_x+left_size);
	this.sety(parent_y);
	if( left )
		left.recalculate_positions(parent_x, parent_y+this.node_height);
	if( right )
		right.recalculate_positions(parent_x+left_size+this.node_width, parent_y+this.node_height);
};


var rootNode;
var a,b,c;

function on_load() {
	var holder=document.getElementById('holder');

	a=new TreeNode('a',holder);
	a.setx(200);

	b=new TreeNode('b',holder);
	b.setx(150);
	b.sety(30);

	c=new TreeNode('c',holder);
	c.setx(250);
	c.sety(40);

	a.setleft_child(b);
	a.setright_child(c);

	rootNode=a;
}


window.addEventListener('load',on_load,false);



/* Handy function */
function removeChildNodes(node)
{
	while(node.hasChildNodes())
		node.removeChild(node.firstChild);
}


/* DEBUG CODE BELOW */
function clear_debug()
{
	removeChildNodes(document.getElementById("debug"));
}
function append_debug(s)
{
	document.getElementById("debug").appendChild(document.createTextNode(s));
}

function eval_func()
{
	var expr=prompt("Enter expression to be evaluated:","");
	append_debug(eval(expr)+'\n');
}

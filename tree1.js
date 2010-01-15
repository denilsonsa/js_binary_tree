/* Documentation:
 *
 * TreeNode object
 *  -constructor:
 *     new TreeNode(key,parentNode)
 *  -methods:
 *     toString()
 *     unlink_child(child)	// Unlinks 'child' from this this node. Only this node is changed; 'child.parent' is not changed.
 *     unlink_dom_node()	// Unlinks the DOM node of this object (just remove it from its parent).
 *  -properties:
 *     _key_			// Internal key
 *     _x_				// Internal x position
 *     _y_				// Internal y position
 *     _parent_			// Pointer to parent TreeNode
 *     _left_child_		// Pointer to left-child TreeNode
 *     _right_child_	// Pointer to right-child TreeNode
 *     node_width
 *     internode_width
 *     subtree_width
 *     elementNode		// DOM element Node.
 *     _text_			// The TextNode containing the node text
 *  -properties with getter and setter:
 *     key				// The key
 *     x				// The x position
 *     y				// The y position
 *     left_child
 *     right_child
 *     parent
 *
 * TreeNode.elementNode.childNodes contains:
 *  -The text at position 0
 *  -All children at following positions
 */

function TreeNode(key,parentNode) {
	this._key_=key;
	this._x_=0;
	this._y_=0;
	this.node_width=32;
	this.internode_width=16;
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

TreeNode.prototype.key getter = function() { return this._key_; };
TreeNode.prototype.key setter = function(key) { this._key_=key; _text_.nodeValue=key; return key; };

TreeNode.prototype.x getter = function() { return this._x_; };
TreeNode.prototype.x setter = function(x) { this._x_=x; this.elementNode.style.left=x+'px'; return x; };

TreeNode.prototype.y getter = function() { return this._y_; };
TreeNode.prototype.y setter = function(y) { this._y_=y; this.elementNode.style.top=y+'px'; return y; };

TreeNode.prototype.unlink_dom_node = function() { if(this.elementNode.parentNode) this.elementNode.parentNode.removeChild(this.elementNode); };

TreeNode.prototype.unlink_child = function(child) {
	if(child == this._left_child_)
		this._left_child_=null;
	else if(child == this._right_child_)
		this._right_child_=null;
//	this.elementNode.removeChild(child.elementNode);
};

TreeNode.prototype.parent getter = function() { return this._parent_; };
TreeNode.prototype.parent setter = function(p) { append_debug('Warning! TreeNode.parent being assigned!\n'); this._parent_.unlink_child(this); this._parent_=p; return this._parent_; };

TreeNode.prototype.left_child getter = function() { return this._left_child_; };
TreeNode.prototype.left_child setter = function(child) {
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

TreeNode.prototype.right_child getter = function() { return this._right_child_; };
TreeNode.prototype.right_child setter = function(child) {
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



TreeNode.prototype.recalculate_subtree_width = function() {
	this.subtree_width=0;
	for(var i=1, e; e=this.elementNode.childNodes[i]; i++)
		this.subtree_width += e.relatedObject.recalculate_subtree_width() + (i==1 ? 0 : this.internode_width);
	if(this.subtree_width==0)
		this.subtree_width=this.node_width;
	return this.subtree_width;
};


// THIS DOES NOT WORK
TreeNode.prototype.recalculate_offsets = function() {
	var e;
	e=this.elementNode.childNodes[1];
	if(e) {
		e=e.relatedObject;
		this.x=e.subtree_width;
	}
	else this.x=0;

	for(var i=1, e; e=this.elementNode.childNodes[i]; i++)
		e.relatedObject.recalculate_offsets();
};


var a,b,c;

function on_load() {
	var holder=document.getElementById('holder');

	a=new TreeNode('a',holder);
	a.x=200;

	b=new TreeNode('b',holder);
	b.x=150;
	b.y=30;

	c=new TreeNode('c',holder);
	c.x=250;
	c.y=40;
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

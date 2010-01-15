// vi:ts=4:sw=4

//////////////////////////////////////////////////////////////////////
/* TreeNode documentation:  {{{
 *
 * TreeNode object represents one node from tree. When created, it will
 * create a DOM object equivalent to <div class="treenode">, which will be
 * appended to parentNode passed by constructor (if not null or undefined).
 * This DOM object is available through .elementNode property. The TreeNode
 * object is availble at .relatedObject property from DOM element.
 *
 * "Private" properties are named like _name_. They should not be set or
 * read outside this object. There are getter/setter methods which will
 * manage these private properties correctly.
 *
 * Getter/setter methods are implemented as getname() and setname(). I
 * would like to use real getter/setter, but only Gecko supports that.
 *
 * The configObj, passed on constructor, is mandatory. Without it, some
 * methods won't work.
 *
 * This object is written for binary trees. It is needed to modify some
 * parts of it to port it to other tree types.
 *
 *
 * TreeNode object
 *  -constructor:
 *     new TreeNode(key,configObj,parentNode)
 *  -methods:
 *     toString()
 *     _unlink_child_(child)	// Unlinks 'child' from this this node. Only this node is changed; 'child.parent' is not changed.
 *     unlink_from_parent()		// Unlinks this node from its parent.
 *     unlink_dom_node()		// Unlinks the DOM node of this object (just remove it from its parent).
 *     find_next_node(node)		// Find the node next to 'node' (i.e., the leftmost node in right subtree).
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
 *     config			// Pointer to a TreeConfig object
 *     subtree_width	// Width of subtree with this node as root
 *
 *     elementNode		// DOM element Node.
 *     _text_			// The TextNode containing the node text
 *  -properties with getter and setter:
 *     key				// The key
 *     x				// The x position
 *     y				// The y position
 *     parent			// This should not be set "manually", because it will break the tree.
 *     left_child
 *     right_child
 *
 * TreeNode.elementNode.childNodes contains:
 *  -The text at position 0
 *
 * NOT TODO list:
 * - Implement recalculate_subtree_width_upward and recalculate_positions_upwards, which should only update
 *   ancestral nodes. This would be much faster than recalculating downward (which requires traversing the
 *   whole tree).
 *   * This does not need to be implemented, since it is needed to update the entire tree sometimes, so,
 *     there is no way to improve it better than O(n).
 * }}} */
// {{{
function TreeNode(key,configObj,parentNode) {
	this._key_=key;
	this._x_=0;
	this._y_=0;

	this.config=configObj;
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

TreeNode.prototype.toString = function() { return '[object TreeNode: '+this.getkey()+ /*" ("+this.getx()+","+this.gety()+")"+*/']'; };

TreeNode.prototype.getkey = function() { return this._key_; };
TreeNode.prototype.setkey = function(key) { this._key_=key; this._text_.nodeValue=key; };

TreeNode.prototype.getx = function() { return this._x_; };
TreeNode.prototype.setx = function(x) { this._x_=x; this.elementNode.style.left=x+'px'; };

TreeNode.prototype.gety = function() { return this._y_; };
TreeNode.prototype.sety = function(y) { this._y_=y; this.elementNode.style.top=y+'px'; };

TreeNode.prototype.unlink_dom_node = function() { if(this.elementNode.parentNode) this.elementNode.parentNode.removeChild(this.elementNode); };

TreeNode.prototype._unlink_child_ = function(child) {
	if(child == this._left_child_)
		this._left_child_=null;
	else if(child == this._right_child_)
		this._right_child_=null;
};

TreeNode.prototype.unlink_from_parent = function() {
	if(this._parent_)
		this._parent_._unlink_child_(this);
};

TreeNode.prototype.getparent = function() { return this._parent_; };
TreeNode.prototype.setparent = function(p) { append_debug('Warning! TreeNode.parent being assigned!\n'); this._parent_._unlink_child_(this); this._parent_=p; };

TreeNode.prototype.getleft_child = function() { return this._left_child_; };
TreeNode.prototype.setleft_child = function(child) {
	if(this._left_child_) {  // Must unlink old child
		this._left_child_._parent_=null;
	}
	if(child) {
		child.unlink_from_parent();
		child._parent_=this;
	}
	this._left_child_=child;
};

TreeNode.prototype.getright_child = function() { return this._right_child_; };
TreeNode.prototype.setright_child = function(child) {
	if(this._right_child_) {  // Must unlink old child
		this._right_child_._parent_=null;
	}
	if(child) {
		child.unlink_from_parent();
		child._parent_=this;
	}
	this._right_child_=child;
};

TreeNode.prototype.find_next_node = function() {
	var t=this.getright_child();
	while( t && t.getleft_child() ) {
		t=t.getleft_child();
	}
	return t;
};



TreeNode.prototype.recalculate_subtree_width = function(deep) {
	if(!this.config) return 0;

	if(this.config.debug_recalculate_subtree_width)
		append_debug(this+'.recalculate_subtree_width('+deep+') >>\n');

	var children=[ this.getleft_child(), this.getright_child() ];
	var subtrees=0;
	this.subtree_width=0;
	for(var i=0, e; i<children.length; i++)
		if(e=children[i]) {
			subtrees++;
			if(deep || e.subtree_width==0)
				this.subtree_width += e.recalculate_subtree_width(deep);
			else
				this.subtree_width += e.subtree_width;
		}

	if(subtrees==0)
		this.subtree_width=this.config.node_width;
	else if(subtrees==1)
		this.subtree_width+=(this.config.inter_tree_space+this.config.node_width)/2;
	else
		this.subtree_width+=this.config.inter_tree_space;

	if(this.config.debug_recalculate_subtree_width)
		append_debug(this+'.recalculate_subtree_width('+deep+') << '+this.subtree_width+'\n');
	return this.subtree_width;
};


// This must be called on root node, with 0,0 as parameter.
// recalculate_subtree_width() must be called before this function.
TreeNode.prototype.recalculate_positions = function(parent_x, parent_y) {
	if(!this.config) return;

	var left=this.getleft_child();
	var right=this.getright_child();

	var left_size=0;
	if(left) left_size=left.subtree_width;

	var right_size=0;
	if(right) right_size=right.subtree_width;

	if(left)
		this.setx(parent_x+left_size +(this.config.inter_tree_space-this.config.node_width)/2);
	else
		this.setx(parent_x);
	this.sety(parent_y);

	if(left)
		left.recalculate_positions(parent_x, parent_y+this.config.node_height);
	if(right)
		right.recalculate_positions(parent_x+left_size+this.config.inter_tree_space, parent_y+this.config.node_height);
	if(left && right && this.config.center_parent)
		this.setx( (left.getx()+right.getx())/2 );

	if(this.config.debug_recalculate_positions)
		append_debug(this+'.recalculate_positions('+parent_x+','+parent_y+') >> x='+this.getx()+' y='+this.gety()+'\n');
};

// }}}
// End of TreeNode object

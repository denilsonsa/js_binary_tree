// vi:ts=4:sw=4


/* TODO:
 *
 * - Implement some interface to change configuration values.
 * - Implement "lines" to connect nodes. Should be easy, but will be a hack.
 * - Implement animation (smooth moving of current nodes when the tree
 *   structure changes).
 * - Implement pre/post/in-order traversals (implement in TreeNode object,
 *   with a callback function passed as parameter; also implement in
 *   SimpleBinaryTree object, with a code like this: {if(this.rootNode) this.rootNode.prefix(...)} ).
 * - Implement a "detach_tree()" method which should detach (or reattach)
 *   the tree and all nodes.
 * - Modify the SimpleBinaryTree.setconfig() to update config on all tree nodes.
 * - Clean up the interface code. It is too messy and hardcoded now.
 * - Make "Reset" button be disabled when no change was made to config form.
 */

/* ChangeLog:
 *
 * 2006-05-03: Finished first full-functional version.
 * 2006-05-07: Added more documentation.
 *             Implemented TreeConfig object. Only draw_lines functionality is missing.
 *             Some alpha version of config interface was written.
 * 2006-05-08: Small change to interface, basic support for .linehackcontainer added.
 */
var document_last_change="2006-05-08";



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
TreeNode.prototype.setkey = function(key) { this._key_=key; this._text_.nodeValue=key; return key; };

TreeNode.prototype.getx = function() { return this._x_; };
TreeNode.prototype.setx = function(x) { this._x_=x; this.elementNode.style.left=x+'px'; return x; };

TreeNode.prototype.gety = function() { return this._y_; };
TreeNode.prototype.sety = function(y) { this._y_=y; this.elementNode.style.top=y+'px'; return y; };

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
TreeNode.prototype.setparent = function(p) { append_debug('Warning! TreeNode.parent being assigned!\n'); this._parent_._unlink_child_(this); this._parent_=p; return this._parent_; };

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
	return this._left_child_;
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
	return this._right_child_;
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

SimpleBinaryTree.prototype.setconfig = function(configObj) {
	this._config_=configObj;
	return this._config_;
}


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


// }}}
// End of SimpleBinaryTree object



//////////////////////////////////////////////////////////////////////
/* TreeConfig documentation: {{{
 *
 * TreeConfig object holds general configuration values for a tree.
 *
 * TreeConfig object
 *  -constructor:
 *     new TreeConfig()
 *  -properties:
 *     node_width			// This must be width+padding+border+margin
 *     node_height			// This must be height+padding+border+margin
 *     inter_tree_space		// Space between two sibling trees
 *     draw_lines			// Should lines connecting nodes be drawn?
 *     center_parent		// Should the parent node be centered, related to children?
 *
 *     debug_recalculate_subtree_width
 *     debug_recalculate_positions
 *  -methods:
 *     toString()
 * }}} */
// {{{
function TreeConfig() {
	this.node_width       = 32 + 2*3 + 2*3;
	this.node_height      = 16 + 2*3 + 2*3;
	this.inter_tree_space = this.node_width/2;
	this.draw_lines       = false;
	this.center_parent    = false;
	this.debug_recalculate_subtree_width =false;
	this.debug_recalculate_positions     =false;
}

TreeConfig.prototype.toString = function() { return '[object TreeConfig: '+this.node_width+','+this.node_height+','+this.inter_tree_space+','+(this.draw_lines?'T':'F')+','+(this.center_parent?'T':'F')+']'; };

// }}}
// End of TreeConfig object



//////////////////////////////////////////////////////////////////////
var tree,config;

function on_load() {
	var holder=document.getElementById('holder');
	config=new TreeConfig();

	tree=new SimpleBinaryTree();
	tree.attachToElement(holder);
	tree.setconfig(config);

	return;
}


window.addEventListener('load',on_load,false);




function insert_values() {
	auto_clear_debug();
	var e=document.getElementById('inserttext');
	if( !e ) return;
	var a=e.value.split(/[ ,;]+/);
	for(var i=0; i<a.length; i++)
		append_debug( 'insert('+parseInt(a[i])+'): '+tree.insert(parseInt(a[i])) +'\n');
	tree.update_positions();
}

function search_values() {
	auto_clear_debug();
	var e=document.getElementById('searchtext');
	if( !e ) return;
	var a=e.value.split(/[ ,;]+/);
	var t;
	for(var i=0; i<a.length; i++) {
		t=tree.search(parseInt(a[i]));
		append_debug( 'search('+parseInt(a[i])+'): '+ t.found + ' ' + t.node +'\n');
	}
	tree.update_positions();
}

function remove_values() {
	auto_clear_debug();
	var e=document.getElementById('removetext');
	if( !e ) return;
	var a=e.value.split(/[ ,;]+/);
	for(var i=0; i<a.length; i++)
		tree.remove(parseInt(a[i]));
	tree.update_positions();
}

function redraw_func() {
	tree.update_positions();
}



function show_help() {
	auto_clear_debug();
	append_debug(
"Simple Binary Tree\n"+
"------ ------ ----\n"+
"\n"+
"Written by Denilson F. de Sá (CrazyTerabyte)\n"+
"Last change at "+document_last_change+"\n"+
"\n"+
"Written in JavaScript + DOM. Should work on any standard-compliant browser\n"+
"that supports both technologies. Tested on Opera 8.52, 9.0 preview and Firefox\n"+
"1.5.0.2. Opera 8.52 does not show scrollbars when tree becomes too big.\n"+
"No, it does not work on MSIE. No, I won't make it work on MSIE. Ask Microsoft\n"+
"to make MSIE understand web standards.\n"+
"\n"+
"It took me about two days to write everything.\n"+
"\n"+
"This page implements a Binary Tree. It has the following operations: insert,\n"+
"search and remove. This binary tree keeps all nodes sorted (by key). Since\n"+
"this is a simple binary tree, it does not try to keep the tree balanced.\n"+
"\n"+
"The input boxes allow multiple keys to be entered at same time, just separate\n"+
"them by space, comma or semicolon. Only integer keys are supported (this\n"+
"limitation is written outside the binary tree code, which can support numbers,\n"+
"both integer and floating-point, and strings). When multiple keys are entered,\n"+
"it will be treated as executing the operation once for each key.\n"+
"");
}



//////////////////////////////////////////////////////////////////////
// Config interface functions
function configpanel_add_event_listeners() {
	document.getElementById("configpaneltoggle"        ).addEventListener("click" ,configpanel_toggle_visibility,false);
	document.getElementById("config"                   ).addEventListener("submit",configpanel_apply,false);
	document.getElementById("config_reset"             ).addEventListener("click" ,configpanel_fill_form,false);
	document.getElementById("config_close"             ).addEventListener("click" ,configpanel_hide,false);
	document.getElementById("config_auto_apply_changes").addEventListener("click" ,function(){ alert("Not implemented yet!"); this.checked=false; },false);

	configpanel_fill_form();
}
window.addEventListener('load',configpanel_add_event_listeners,false);

function configpanel_hide(e) {
	document.getElementById("config").setAttribute("class","hidden");
}
function configpanel_show(e) {
	document.getElementById("config").setAttribute("class","");
}
function configpanel_toggle_visibility(e) {
	var panel=document.getElementById("config");
	// I could also use:
	//var panel=this.parentNode;
	if(panel.getAttribute("class")=="hidden")
		panel.setAttribute("class","");
	else
		panel.setAttribute("class","hidden");
}

function configpanel_fill_form(e) {
	var texts=[ "node_width","node_height","inter_tree_space" ];
	var booleans=[ "draw_lines","center_parent","debug_recalculate_subtree_width","debug_recalculate_positions" ];
	for(var i=0; i<texts.length; i++)
		document.getElementById( "config_"+texts[i] ).value = config[texts[i]];
	for(var i=0; i<booleans.length; i++)
		document.getElementById( "config_"+booleans[i] ).checked = config[booleans[i]];
}
function configpanel_apply(e) {
	var numbers=[ "node_width","node_height","inter_tree_space" ];
	var booleans=[ "draw_lines","center_parent","debug_recalculate_subtree_width","debug_recalculate_positions" ];
	for(var i=0,t; i<numbers.length; i++) {
		t = parseInt(document.getElementById( "config_"+numbers[i] ).value);
		if( isNaN(t) )
			document.getElementById( "config_"+numbers[i] ).value = config[numbers[i]];
		else
			config[numbers[i]] = t;
	}
	for(var i=0; i<booleans.length; i++)
		config[booleans[i]] = document.getElementById( "config_"+booleans[i] ).checked;
	tree.update_positions();
}



//////////////////////////////////////////////////////////////////////
// Handy function
function removeChildNodes(node)
{
	while(node.hasChildNodes())
		node.removeChild(node.firstChild);
}



//////////////////////////////////////////////////////////////////////
// DEBUG CODE BELOW
function auto_clear_debug() {
	if( document.getElementById("autoclear").checked ) clear_debug();
}
function clear_debug() {
	removeChildNodes(document.getElementById("debug"));
}
function append_debug(s) {
	document.getElementById("debug").appendChild(document.createTextNode(s));
}

var last_eval_cmd='';
function eval_func() {
	auto_clear_debug();
	last_eval_cmd=prompt("Enter expression to be evaluated:",last_eval_cmd);
	append_debug(eval(last_eval_cmd)+'\n');
}

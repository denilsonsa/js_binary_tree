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
 *             Splitted JavaScript code into different files, one for each class/object.
 * 2006-05-09: ConfigPanel object half-implemented. Now the code is much cleaner and easier to maintain.
 * 2006-05-10: Now the input boxes are validated, and NaN will be ignored.
 *             ConfigPanel object is almost finished.
 */
var document_last_change="2006-05-10";


//////////////////////////////////////////////////////////////////////
var tree,config,configpanel;

function on_load() {
	config=new TreeConfig();

	tree=new SimpleBinaryTree();
	tree.attachToElement(document.getElementById("holder"));
	tree.setconfig(config);

	var configform=document.getElementById("configform");
	configpanel=new ConfigPanel();
	configpanel.treeconfig=config;
	configpanel.setform(configform);
	configpanel.reset_form();

	configpanel.apply_callback=function(){tree.update_positions();};

	document.getElementById("configpaneltoggle").addEventListener("click" ,configpanel_toggle_visibility,false);
	document.getElementById("configpanelclose" ).addEventListener("click" ,configpanel_hide,false);
}



// See the end of "More than basic events" section at
// http://www.howtocreate.co.uk/tutorials/javascript/domevents
// to understand why I need to try to add event listeners on both window and document objects.

if( window.addEventListener )        window.addEventListener('load',on_load,false);
else if( document.addEventListener ) document.addEventListener('load',on_load,false);




function configpanel_hide() {
	document.getElementById("config").setAttribute("class","hidden");
}
function configpanel_show() {
	document.getElementById("config").setAttribute("class","");
}
function configpanel_toggle_visibility() {
	var panel=document.getElementById("config");
	if(panel.getAttribute("class")=="hidden")
		panel.setAttribute("class","");
	else
		panel.setAttribute("class","hidden");
}





function insert_values() {
	auto_clear_debug();
	var e=document.getElementById('inserttext');
	if( !e ) return;
	var a=e.value.split(/[ ,;]+/);
	for(var i=0; i<a.length; i++)
		if( !isNaN(parseInt(a[i])) )
			append_debug( 'insert('+parseInt(a[i])+'): '+tree.insert(parseInt(a[i])) +'\n');
	tree.update_positions();
}

function search_values() {
	auto_clear_debug();
	var e=document.getElementById('searchtext');
	if( !e ) return;
	var a=e.value.split(/[ ,;]+/);
	var t;
	for(var i=0; i<a.length; i++)
		if( !isNaN(parseInt(a[i])) ) {
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
		if( !isNaN(parseInt(a[i])) )
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

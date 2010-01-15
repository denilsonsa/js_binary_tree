// vi:ts=4:sw=4

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

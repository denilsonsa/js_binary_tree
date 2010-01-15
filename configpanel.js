// vi:ts=4:sw=4

// Brainstorm:
//
// Done:
// - ConfigPanel.config_obj = some TreeConfig obj.
// - .form must be a property with getter/setter, and there must be a "relatedObject" property inside form element.
//
// Done, but must be changed:
// - ConfigPanel._form_       = <form> element
// - ConfigPanel.setform() -> set this._form_ and calls above methods
// - ConfigPanel.getform() -> getter (I think it is easier to NOT use getter/setter for this.form)
//
// TODO:
// - ConfigPanel.addEventListeners() -> will add event listeners to this._form_ and its children
// - ConfigPanel.removeEventListeners() -> will remove event listeners from this._form_ and its children
// - The "reset" button should be of type "reset", and .reset_form() must be called at form.onReset.
// - Update documentation about .form getter/setter.
// - Add a notice about need of adding a second "submit" event listener, to call "tree.update_positions()".
//   Or add a callback function as property (like this.on_submit_callback). (this second option is better, one of the reasons is the "auto-apply" feature)
//
// Useful notes:
// - Text elements have these events: blur, focus, <change>, select.
// - Checkbox and Radio elements have these events: blur, focus, <click>.
// - Form elements have these events: <reset>, <submit>.

//////////////////////////////////////////////////////////////////////
/* ConfigPanel documentation: {{{
 *
 * The ConfigPanel object links one HTML form with one TreeConfig object.
 *
 * The constructor does nothing special. So, after creating this object,
 * .treeconfig property must be set to a valid TreeConfig object, and
 * .set_form() method must be called to attach the ConfigPanel object to
 * a form element.
 *
 * Note .set_form() is not a setter (or it would be called setform(), by
 * convention used in this set of scripts), but a convenience method that
 * remove listeners from old form (if exists), sets .form property and
 * add listeners to new one. The .form property is still public, without
 * getter/setter.
 *
 * Note also that .set_form() will not call .reset_form(), so it will not
 * fill form with current config values.
 *
 * The form elements will be accessed using DOM0 syntax:
 *   this.form.elem_name  or  this.form["elem_name"]
 *
 *
 * ConfigPanel object:
 *  -constructor:
 *     new ConfigPanel()
 *  -properties:
 *     treeconfig		// Points to the TreeConfig object attached to this panel
 *     _form_			// Points to form element attached to this panel.
 *  -properties with getter and setter:
 *     form				// Points to form element attached to this panel.
 *  -static properties:
 *     integer_fields	// List (array) of names of integer config values. Correspondent form elements must be of type "text".
 *     boolean_fields	// List (array) of names of boolean config values. Correspondent form elements must be of type "checkbox".
 *  -methods:
 *     toString()
 *     reset_form()			// Fills form with values from treeconfig
 *
 *     addEventListeners()	// Add event listeners to current form's fields.
 *     removeEventListeners()	// Remove event listeners to current form's fields.
 * }}} */
// {{{
function ConfigPanel() {
	this.treeconfig=null;
	this._form_=null;
}

ConfigPanel.prototype.toString = function() { return '[object ConfigPanel]'; };

ConfigPanel.prototype.integer_fields = [ "node_width","node_height","inter_tree_space" ];
ConfigPanel.prototype.boolean_fields = [ "draw_lines","center_parent","debug_recalculate_subtree_width","debug_recalculate_positions" ];


ConfigPanel.prototype.reset_form = function() {
	if( !this._form_ || !this.treeconfig ) return;
	var e;
	for(var i=0; i<this.integer_fields.length; i++)
		if( e=this._form_[this.integer_fields[i]] )	// If the element exists
			e.value = this.treeconfig[this.integer_fields[i]];
	for(var i=0; i<this.boolean_fields.length; i++)
		if( e=this._form_[this.boolean_fields[i]] )	// If the element exists
			e.checked = this.treeconfig[this.boolean_fields[i]];
};

ConfigPanel.prototype.apply_changes = function() {
	if( !this._form_ || !this.treeconfig ) return;
	var e;
	for(var i=0; i<this.integer_fields.length; i++)
		if( e=this._form_[this.integer_fields[i]] )	// If the element exists
			this.treeconfig[this.integer_fields[i]] = parseInt(e.value) ;
	for(var i=0; i<this.boolean_fields.length; i++)
		if( e=this._form_[this.boolean_fields[i]] )	// If the element exists
			this.treeconfig[this.boolean_fields[i]] = e.checked;
};


ConfigPanel.prototype.addEventListeners = function() {
	append_debug(this+'.addEventListeners() called. This should add event listeners to form\'s fields. Only form submit and reset events were added, all others are missing yet.\n');
	this._form_.addEventListener("submit",function(){this.relatedObject.apply_changes()},false);
	this._form_.addEventListener("reset" ,function(){this.relatedObject.reset_form()},false);
};
ConfigPanel.prototype.removeEventListeners = function() {
	append_debug(this+'.removeEventListeners() called. This should remove event listeners to form\'s fields. Yet to be implemented.\n');
};


ConfigPanel.prototype.getform = function() { return this._form_; };

ConfigPanel.prototype.setform = function( newform ) {
	if( this._form_ ) {
		delete this._form_.relatedObject;
		this.removeEventListeners();
	}
	if( newform ) {
		if( newform.relatedObject ) {
			alert("Error condition found inside "+this+".setform("+newform+"): newform.relatedObject is not null/false/undefined. Maybe attaching this object to a form already attached by another object!");
		}
		this._form_=newform;
		newform.relatedObject=this;
		this.addEventListeners();
	}
};

// }}}

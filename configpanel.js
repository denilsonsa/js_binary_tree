// vi:ts=4:sw=4

//////////////////////////////////////////////////////////////////////
/* ConfigPanel documentation: {{{
 *
 * The ConfigPanel object links one HTML form with one TreeConfig object.
 *
 * The constructor does nothing special. So, after creating this object,
 * .treeconfig property must be set to a valid TreeConfig object, and
 * .setform() method must be called to attach the ConfigPanel object to
 * a form element. Note that .setform() will not fill the form with
 * current .treeconfig values. You must call .reset_form() to do it.
 *
 * The ConfigPanel will keep the TreeConfig object synched to HTML form,
 * but won't touch any trees that use the TreeConfig object. For this
 * reason, you can set .apply_callback to (a pointer to) a function that
 * can update the tree display.
 *
 *
 * Implementation notes:
 *
 * The form elements will be accessed using DOM0 syntax:
 *   this.form.elem_name  or  this.form["elem_name"]
 *
 * The "configpanel_auto_apply" name is hardcoded for now.
 *
 * Useful notes:
 * - Text elements have these events: blur, focus, <change>, select.
 * - Checkbox and Radio elements have these events: blur, focus, <click>.
 * - Form elements have these events: <reset>, <submit>.
 *
 *
 * ConfigPanel object:
 *  -constructor:
 *     new ConfigPanel()
 *  -properties:
 *     treeconfig		// Points to the TreeConfig object attached to this panel.
 *     _form_			// Points to form element attached to this panel.
 *     apply_callback	// Points to a function to be called whenever any change is applied.
 *     auto_apply		// Boolean, should changes be applied as soon as they are detected? (if false, changes are only applied on submit)
 *  -properties with getter and setter:
 *     form				// Points to form element attached to this panel.
 *  -static properties:
 *     integer_fields	// List (array) of names of integer config values. Correspondent form elements must be of type "text".
 *     boolean_fields	// List (array) of names of boolean config values. Correspondent form elements must be of type "checkbox".
 *  -methods:
 *     toString()
 *     reset_form()				// Fills form with values from treeconfig.
 *     apply_changes()			// Update treeconfig from form values.
 *
 *     addEventListeners()		// Add event listeners to current form's fields.
 *     removeEventListeners()	// Remove event listeners to current form's fields.
 *
 *     // The following methods are added as listeners to form and form fields elements.
 *     // Even though they are methods of this object, they must NOT be called from this object.
 *     // They assume "this" points to "listened" object.
 *     // They are methods just to not leave them as global functions.
 *     listener_form_submit(ev)
 *     listener_form_reset(ev)
 *     listener_field_has_changed(ev)
 * }}} */
// {{{
function ConfigPanel() {
	this.treeconfig=null;
	this._form_=null;
	this.apply_callback=null;
	this.auto_apply=false;
}

ConfigPanel.prototype.toString = function() { return '[object ConfigPanel]'; };

ConfigPanel.integer_fields =ConfigPanel.prototype.integer_fields = [ "node_width","node_height","inter_tree_space","line_width" ];
ConfigPanel.boolean_fields =ConfigPanel.prototype.boolean_fields = [ "draw_lines","center_parent","debug_recalculate_subtree_width","debug_recalculate_positions" ];



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
			if( !isNaN(parseInt(e.value)) )
				this.treeconfig[this.integer_fields[i]] = parseInt(e.value) ;
	for(var i=0; i<this.boolean_fields.length; i++)
		if( e=this._form_[this.boolean_fields[i]] )	// If the element exists
			this.treeconfig[this.boolean_fields[i]] = e.checked;
	if( this.apply_callback )
		this.apply_callback();
};



ConfigPanel.prototype.listener_form_submit = function(ev) {
	ev.preventDefault();
	if( this.relatedObject )
		this.relatedObject.apply_changes();
};

ConfigPanel.prototype.listener_form_reset = function(ev) {
	ev.preventDefault();
	if( this.relatedObject )
		this.relatedObject.reset_form();
};

ConfigPanel.prototype.listener_field_has_changed = function(ev) {
	if( !this.name ) return;
	if( !this.type ) return;
	if( !this.form ) return;
	if( !this.form.relatedObject ) return;

	var configpanel=this.form.relatedObject;

	if( this.name == "configpanel_auto_apply" ) {
		configpanel.auto_apply=this.checked;
		if( configpanel.auto_apply )
			configpanel.apply_changes();
	}
	else if( configpanel.auto_apply ) {
		var i;
		if( this.type.toLowerCase()=="checkbox" ) {
			// Find if the property exists
			for(i=0; i<configpanel.boolean_fields.length; i++)
				if( configpanel.boolean_fields[i]==this.name )
					break;
			if( i<configpanel.boolean_fields.length ) {
				configpanel.treeconfig[this.name]=this.checked;
				if( configpanel.apply_callback )
					configpanel.apply_callback();
			}
		}
		else if( this.type.toLowerCase()=="text" ) {
			// Find if the property exists
			for(i=0; i<configpanel.integer_fields.length; i++)
				if( configpanel.integer_fields[i]==this.name )
					break;
			if( i<configpanel.integer_fields.length )
				if( !isNaN(parseInt(this.value)) ) {
					configpanel.treeconfig[this.name]=parseInt(this.value);
					if( configpanel.apply_callback )
						configpanel.apply_callback();
				}
		}
	}
};



ConfigPanel.prototype.addEventListeners = function() {
	if( !this._form_ ) return;
	this._form_.addEventListener("submit",this.listener_form_submit,false);
	this._form_.addEventListener("reset" ,this.listener_form_reset,false);

	var e;
	for(var i=0; i<this.integer_fields.length; i++)
		if( e=this._form_[this.integer_fields[i]] ) {
			e.addEventListener("change",this.listener_field_has_changed,false);
			e.addEventListener("keyup",this.listener_field_has_changed,false);
		}
	for(var i=0; i<this.boolean_fields.length; i++)
		if( e=this._form_[this.boolean_fields[i]] )
			e.addEventListener("click",this.listener_field_has_changed,false);  // This will not work well if the click event is called BEFORE this.checked has changed.
	if( e=this._form_["configpanel_auto_apply"] )
		e.addEventListener("click",this.listener_field_has_changed,false);
};
ConfigPanel.prototype.removeEventListeners = function() {
	if( !this._form_ ) return;
	this._form_.removeEventListener("submit",this.listener_form_submit,false);
	this._form_.removeEventListener("reset" ,this.listener_form_reset,false);

	var e;
	for(var i=0; i<this.integer_fields.length; i++)
		if( e=this._form_[this.integer_fields[i]] ) {
			e.removeEventListener("change",this.listener_field_has_changed,false);
			e.removeEventListener("keyup",this.listener_field_has_changed,false);
		}
	for(var i=0; i<this.boolean_fields.length; i++)
		if( e=this._form_[this.boolean_fields[i]] )
			e.removeEventListener("click",this.listener_field_has_changed,false);
	if( e=this._form_["configpanel_auto_apply"] )
		e.removeEventListener("click",this.listener_field_has_changed,false);
};



ConfigPanel.prototype.getform = function() { return this._form_; };

ConfigPanel.prototype.setform = function( newform ) {
	if( this._form_ ) {
		this.removeEventListeners();
		delete this._form_.relatedObject;
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
// End of ConfigPanel object

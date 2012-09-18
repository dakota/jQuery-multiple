/**
 * Requires handlebars.js
 *
 * # Usage:
 *     $(selector).multiple(options);
 *
 * # Element:
 *     <div data-multiple="template-id" data-counter="counter-identifier" data-options="json-encoded options"></div>
 *     <script id="template-id" type="text/x-handlebars-template"></script>
 *
 * Options:
 *	* addLinkText: Text to show on the add button
 *	* removeLinkText: Text to show on remove button
 *	* addLinkClass: Class to use for add link
 *	* removeLinkClass: Class to use for remove link
 *	* maximum: Maximum entries allowed. Zero for no limit.
 *	* minimum: Minimum number of entries allowed. Default is one
 */
(function($){
	var
		templates = {},
		undoHistory = {};

	function checkRemoveLinks($parent, options) {
		var
			$items = $parent.children('.listItem'),
			numberItems = $items.length;

		if(numberItems > options.minimum) {
			$items.children('.removeWrapper').show();
		}

		if(numberItems <= options.minimum) {
			$items.children('.removeWrapper').hide();
		}
	}

	function addRemoveLink($element, options) {
		var
			removeLink = $('<a href="#" class="removeLink '+options.removeLinkClass + '">'+options.removeLinkText+'</a>');

		if($element.children('.removeLink').length !== 0) {
			return;
		}

		if($element.children('.removeWrapper').length !== 0) {
			$element.children('.removeWrapper').empty().append(removeLink);
			return;
		}

		$element.prepend($('<div class="removeWrapper"></div>').append(removeLink));
	}

	$.fn.multiple = function(options) {
		var defaults = $.extend({
			'addLinkText': 'Add',
			'removeLinkText': 'Remove',
			'addLinkClass': 'button',
			'removeLinkClass': 'button',
			'maximum': 0,
			'minimum': 1,
			'wrappingElement': 'div',
			'addDiv': null,
			'hasUndo': true,
			'undoLinkClass': 'button',
			'undoLinkText': 'Undo last remove',
			'templateVars': {}
		}, options);

		if(this.length > 0) {
			return this.each(function() {
				var
					$this = $(this).addClass('multiple'),
					options = $.extend({}, defaults, $this.data('options')),
					templateId = $this.data('multiple'),
					counterName = $this.data('counter'),
					addLink = $('<a href="#" class="addLink '+options.addLinkClass + '">'+options.addLinkText+'</a>'),
					undoLink = $('<a href="#" class="undoLink '+options.undoLinkClass + '">'+options.undoLinkText+'</a>').hide(),
					addDiv = null,
					counter = 0,
					undoHistory = [],
					template = Handlebars.compile($('#' + templateId).html()),
					$existingItems = $this.children('.listItem');

				options.counterName = counterName;

				if(options.addDiv === null) {
					addDiv = $('<div class="addWrapper"></div>')
								.append(addLink)
								.append('&nbsp;')
								.append(undoLink)
								.insertAfter($this);
				}
				else {
					addDiv = $(options.addDiv)
								.empty()
								.append(addLink)
								.append('&nbsp;')
								.append(undoLink);
				}
					
				$existingItems.each(function() {
					var
						$this = $(this);
					addRemoveLink($this, options);
				});

				counter = $existingItems.length;

				addLink.on('click', function(e) {
					var numberItems = $this.children('.listItem').length;
					e.preventDefault();
					e.stopImmediatePropagation();

					if(options.maximum > 0 && numberItems >= options.maximum) {
						return;
					}

					var	templateVars = $.extend({}, options.templateVars);
					templateVars[counterName] = counter;

					var row = template(templateVars);

					if(row.search('class="listItem"') === -1) {
						row = $('<'+options.wrappingElement + ' class="listItem">'+row+'</'+options.wrappingElement + '>');
					}
					else {
						row = $(row);
					}

					addRemoveLink(row, options);

					row
						.hide()
						.appendTo($this)
						.slideDown('fast');

					checkRemoveLinks($this, options);

					if(options.maximum > 0 && (numberItems+1) >= options.maximum) {
						addDiv.slideUp('fast');
					}
					
					$this.trigger('addItem', {
						row: row,
						counterName: counterName,
						counter: counter
					});

					counter++;
				});

				undoLink.on('click', function(e) {
					e.preventDefault();
					var row = undoHistory
						.pop()
						.hide()
						.appendTo($this)
						.slideDown('fast');

					if(undoHistory[counter].length === 0) {
						undoLink.fadeOut('fast');
					}

					checkRemoveLinks($this, options);

					$this.trigger('addItem', row);
				});
			
				$this.on('click', 'a.removeLink', function(e) {
					e.preventDefault();

					if($this.children('.listItem').length <= options.minimum) {
						return;
					}

					addDiv.slideDown('fast');

					$(this).closest('.listItem').slideUp('fast', function() {
						undoHistory.push($(this).remove());
						undoLink.fadeIn('fast');

						checkRemoveLinks($this, options);

						$this.trigger('removeItem');
					});
				});

				if($this.children('.listItem').length < options.minimum || options.minimum === 0) {
					var i = 0;
					do {
						addLink.click();
						i++;
					} while(i < options.minimum);
				}

				checkRemoveLinks($this, options);
			});
		}
		else {
			return this;
		}
	};
})(jQuery);
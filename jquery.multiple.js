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
		counters = {},
		templates = {};

	function checkRemoveLinks($parent, options) {
		var numberItems = $parent.find('.listItem').length;

		if(numberItems > options.minimum) {
			$parent.find('a.removeLink').show();
		}

		if(numberItems <= options.minimum) {
			$parent.find('a.removeLink').hide();
		}
	}

	function addRemoveLink($element, options) {
		var
			removeLink = $('<a href="#" class="removeLink '+options.removeLinkClass + '">'+options.removeLinkText+'</a>');

		if($element.find('.removeLink').length !== 0) {
			return;
		}

		if($element.find('.removeWrapper').length !== 0) {
			$element.find('.removeWrapper').empty().append(removeLink);
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
			'addDiv': null
		}, options);

		if(this.length > 0) {
			return this.each(function() {
				var
					$this = $(this).addClass('multiple'),
					templateId = $this.data('multiple'),
					counter = $this.data('counter'),
					options = $.extend({}, defaults, $this.data('options')),
					addLink = $('<a href="#" class="addLink '+options.addLinkClass + '">'+options.addLinkText+'</a>'),
					addDiv = null;

				if(options.addDiv === null) {
					addDiv = $('<div class="addWrapper"></div>')
								.append(addLink)
								.insertAfter($this);
				}
				else {
					addDiv = $(options.addDiv).empty().append(addLink);
				}
					
				if(typeof counters[counter] == 'undefined') {
					items = $('.listItem:data(counter='+counter+')');

					items.each(function() {
						var 
							$this = $(this);
						addRemoveLink($this, options);
					});

					counters[counter] = items.length;
				}

				if(typeof templates[templateId] == 'undefined') {
					templates[templateId] = Handlebars.compile($('#' + templateId).html());
				}


				addLink.on('click', function(e) {
					var numberItems = $this.find('.listItem').length;
					e.preventDefault();
					e.stopImmediatePropagation();

					if(options.maximum > 0 && numberItems >= options.maximum) {
						return;
					}

					var row = templates[templateId](counters);

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

					counters[counter]++;

					checkRemoveLinks($this, options);

					if(options.maximum > 0 && (numberItems+1) >= options.maximum) {
						addDiv.slideUp('fast');
					}
					
					$this.trigger('addItem', row);
				});
			
				$this.on('click', 'a.removeLink', function(e) {
					e.preventDefault();

					if($this.find('.listItem').length <= options.minimum) {
						return;
					}

					addDiv.slideDown('fast');

					$(this).closest('.listItem').slideUp('fast', function() {
						$(this).remove();

						checkRemoveLinks($this, options);

						$this.trigger('removeItem');
					});
				});

				if($this.find('.listItem').length < options.minimum || options.minimum === 0) {
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
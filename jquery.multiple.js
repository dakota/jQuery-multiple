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
		var numberItems = $parent.find('div.listItem').length;

		if(numberItems > options.minimum) {
			$parent.find('a.removeLink').show();
		}

		if(numberItems <= options.minimum) {
			$parent.find('a.removeLink').hide();
		}
	}

	$.fn.multiple = function() {
		var defaults = {
			'addLinkText': 'Add',
			'removeLinkText': 'Remove',
			'addLinkClass': 'button',
			'removeLinkClass': 'button',
			'maximum': 0,
			'minimum': 1
		};

		if(this.length > 0) {
			return this.each(function() {
				var
					$this = $(this),
					templateId = $this.data('multiple'),
					counter = $this.data('counter'),
					options = $.extend({}, defaults, $this.data('options')),
					addLink = $('<a href="#" class="addLink '+options.addLinkClass + '">'+options.addLinkText+'</a>'),
					addDiv = addLink.wrap('<div class="addWrapper"></div>').closest('.addWrapper');
					
				if(typeof counters[counter] == 'undefined') {
					items = $('.listItem:data(counter='+counter+')');

					items.each(function() {
						if($(this).find('.removeLink').length === 0) {
							$(this).prepend('<div class="removeWrapper"><a href="#" class="removeLink '+options.removeLinkClass + '">'+options.removeLinkText+'</a></div>');
						}
					});

					counters[counter] = items.length;
				}

				if(typeof templates[templateId] == 'undefined') {
					templates[templateId] = Handlebars.compile($('#' + templateId).html());
				}

				addDiv.appendTo($this);

				addLink.on('click', function(e) {
					var numberItems = $this.find('div.listItem').length;
					e.preventDefault();
					e.stopImmediatePropagation();

					if(options.maximum > 0 && numberItems >= options.maximum) {
						return;
					}

					var row = templates[templateId](counters);

					if(!row.search('class="listItem"')) {
						row = $('<div class="listItem">'+row+'</div>');
					}
					else {
						row = $(row);
					}

					if(row.find('.removeLink').length === 0) {
						row.prepend('<div class="removeWrapper"><a href="#" class="removeLink '+options.removeLinkClass + '">'+options.removeLinkText+'</a></div>');
					}

					row
						.hide()
						.insertBefore(addDiv)
						.slideDown('fast');

					if(typeof $.fn.showHide == 'function') {
						$('[data-selector]', row).showHide();
					}
					$('[data-multiple]', row).multiple();

					counters[counter]++;

					checkRemoveLinks($this, options);

					if(options.maximum > 0 && (numberItems+1) >= options.maximum) {
						addDiv.slideUp('fast');
					}
				});
			
				$this.on('click', 'a.removeLink', function(e) {
					e.preventDefault();

					if($this.find('div.listItem').length <= options.minimum) {
						return;
					}

					addDiv.slideDown('fast');

					$(this).closest('div.listItem').slideUp('fast', function() {
						$(this).remove();

						checkRemoveLinks($this, options);
					});
				});

				if($this.find('div.listItem').length < options.minimum || options.minimum === 0) {
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
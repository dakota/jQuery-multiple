/**
 * Requires handlebars.js
 *
 * Usage:
 * $(selector).multiple(options);
 *
 * Element:
 * <div data-multiple="template-id" data-counter="counter-identifier"></div>
 * <script id="template-id" type="text/x-handlebars-template"></script>
 * 
 * Options:
 *	* addLinkText: Text to show on the add button
 *	* removeLinkText: Text to show on remove button
 *	* addLinkClass: Class to use for add link
 *	* removeLinkClass: Class to use for remove link
 */
(function($){
	var counters = {},
			templates = {};

	$.fn.multiple = function() {
		var defaults = {
			'addLinkText': 'Add',
			'removeLinkText': 'Remove',
			'addLinkClass': 'button',
			'removeLinkClass': 'button'
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
					e.preventDefault();
					e.stopImmediatePropagation();

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
				});
			
			$this.on('click', 'a.removeLink', function(e) {
					e.preventDefault();

					if($this.find('div.listItem').length == 1) {
						return;
					}

					$(this).closest('div.listItem').slideUp('fast', function() {
						$(this).remove();
					});
				});

				if($this.children('div.listItem').length === 0) {
					addLink.click();
				}
			});
		}
		else {
			return this;
		}
	};
})(jQuery);

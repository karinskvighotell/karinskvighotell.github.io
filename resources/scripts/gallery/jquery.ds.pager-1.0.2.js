/*global jQuery */
/*jslint browser:true, eqeqeq:true, onevar:true, undef:true, nomen:true */
(function ($) {
$.fn.dsPager = function (opts) 
{
    /**
     * Fix for IE9 if console.log/debug is used
     */
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function () { };
    if (!window.console.debug) window.console.debug = function () { };
	
	var parent = this,
		defaults = {
			pageContainer : $("#ds-pager"),     // [required] The page link container, made visible if more than one page
			previous : $("#ds-previous-page"),  // [required] "previous" element
			next : $("#ds-next-page"),          // [required] "next" element
			first : $("#ds-first-page"),        // [required] "first" element
			last : $("#ds-last-page"),          // [required] "last" element
			pageNumber : $("#ds-page-number"),  // [required] "page number" element, this element is cloned to create pages as necessary
			rows : parent.find("> tbody > tr"), // [optional] The "rows" to manipulate when switching pages
			visiblePages : 5,                   // [optional] Number of pages to show
			rowsPerPage : 5,                    // [optional] Rows per page
			itemsPerRow : 1,                    // [optional] Items per row
			moreClass : "more",                 // [optional] CSS class for "..." elements
			disabledClass : "disabled",         // [optional] CSS class added for disabled elements (next/previous)
			activeClass : "active",             // [optional] CSS class added for "active" page link
			fadeSpeed : "normal",               // [optional] Fade speed between page transitions
			batchSize : 1                       // [optional] Number of table rows per image row
		},
		
		options = $.extend(defaults, opts),
        ie6, rows, totalItems, totalPages, currentPage, disabledClass, activeClass,
		idPrefix, moreBefore, moreAfter, pageNumbers;

	// Show/hide appropriate rows
	function render ()
	{
		var minRow = currentPage * options.rowsPerPage * options.batchSize,
			maxRow = (currentPage + 1) * options.rowsPerPage * options.batchSize,
			visiblePages = options.visiblePages || Number.MAX_VALUE,
			availablePages = pageNumbers.size(),
			minPage = Math.max(0, Math.min(currentPage - Math.floor(visiblePages / 2), availablePages - visiblePages)),
			maxPage = Math.min(availablePages, minPage + visiblePages);



		// Show/hide rows as necessary
		rows.hide().slice(minRow, maxRow).show();

		// Set page link "active" class
		pageNumbers.removeClass(activeClass).eq(currentPage).addClass(activeClass); 

		// Show hide page links as necessary
		pageNumbers.hide().slice(minPage, maxPage).show();
		if (minPage === 0)
		{
			moreBefore.hide();
		}
		else
		{
			moreBefore.show();
		}
		if (maxPage === availablePages)
		{
			moreAfter.hide();
		}
		else
		{
			moreAfter.show();
		}
		
		// Set "next" / "last" class according to current page number
		if (currentPage === (totalPages - 1)) 
		{
			options.next.addClass(disabledClass);
			options.last.addClass(disabledClass);
		} 
		else 
		{
			options.next.removeClass(disabledClass);
			options.last.removeClass(disabledClass);
		}
				
		// Set "previous" / "first" class according to current page number
		if (currentPage === 0) 
		{
			options.previous.addClass(disabledClass);
			options.first.addClass(disabledClass);
		} 
		else 
		{
			options.previous.removeClass(disabledClass);
			options.first.removeClass(disabledClass);
		}
	}
		
	function go (page)
	{
		var speed = currentPage === null ? 0 : options.fadeSpeed;
		if (page >= 0 && page < totalPages && page !== currentPage && totalPages > 1)
		{
			currentPage = page;
			//parent.fixIEBackground();
			parent.animate({
					opacity : 0
				}, speed, "linear", function ()
				{
					render();
					if (ie6)
					{
						$("body").hide().show();
					}
					parent.animate({
						opacity : 1
					}, speed, "linear");
				}
			);
		}
	}
	
	function step (image)
	{
		var page = Math.floor(image / (options.rowsPerPage * options.itemsPerRow));
		go(page);
	}

	function initialize ()
	{
	    // Look for pager-settings in CSS content
	    if ($("#pager-settings").length)
		{
			var visiblePages = $("#pager-settings #visible-pages").css("width");
			var vPages = parseInt(visiblePages.replace(/[^\d\.]/g, ''));
			if (vPages) {
				options.visiblePages = vPages;
				console.debug("vPages: " + options.visiblePages);
			}
			var rowsPerPage = $("#pager-settings #rows-per-page").css("width");
			var nrRows = parseInt(rowsPerPage.replace(/[^\d\.]/g, ''));
			if (nrRows) {
				options.rowsPerPage = nrRows;
				console.debug("nrRows: " + options.rowsPerPage);
			}
		}

        // Initialize all internal variables
	    ie6 = ($.browser.msie && $.browser.version < "7");
	    rows = options.rows;
	    totalItems = rows.length;
	    totalPages = options.rowsPerPage ? Math.ceil((totalItems / (options.rowsPerPage * options.batchSize))) : 1;
	    currentPage = null;
	    disabledClass = options.disabledClass;
	    activeClass = options.activeClass;
	    idPrefix = options.pageNumber.attr("id") || "pager";
	    moreBefore = options.pageNumber.clone().text("...").removeAttr("href").removeAttr("id").addClass(options.moreClass);
	    moreAfter = moreBefore.clone();
	    
		var i, clone;
		if (totalPages <= 1)
		{
			rows.show();
			return;
		}

	    // Add event handler for first page number
		options.pageNumber.click(
			function ()
			{
				var page = parseInt(this.id.replace(idPrefix, ""));
				go(page);
				return false;
			}
		);

		// Event handlers for next/previous/first/last
		options.previous.click(
			function ()
			{
				go(currentPage - 1);
				return false;
			}
		);
		options.next.click(
			function ()
			{
				go(currentPage + 1);
				return false;
			}
		);
		options.first.click(
			function ()
			{
				go(0);
				return false;
			}
		);
		options.last.click(
			function ()
			{
				go(totalPages - 1);
				return false;
			}
		);
	
		// Add additional page numbers
		for (i = totalPages - 1; i >= 0; i--)
		{
			clone = options.pageNumber.clone(true);
			clone.attr("id", idPrefix + i);
			clone.html(i + 1);
			clone.insertAfter(options.pageNumber);
		}
		pageNumbers = options.pageNumber.parent().find("*[id^=" + idPrefix + "]").not(options.pageNumber);
		moreBefore.insertBefore(pageNumbers.slice(0, 1));
		moreAfter.insertAfter(pageNumbers.slice(pageNumbers.size() - 1, pageNumbers.size()));
		options.pageNumber.hide();
		options.pageContainer.show();
		go(0);
	}
	
	initialize();
	return step;
};
})(jQuery);

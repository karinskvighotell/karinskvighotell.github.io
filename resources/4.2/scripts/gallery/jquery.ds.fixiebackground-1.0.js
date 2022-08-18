(function($) {

	function parentBackgroundColor (element) {
		var current, color, background;
		for (current = element; current.length; current = current.parent())
		{
			color = current.css("background-color");
			if (color && color != "transparent")
			{
				return color;
			}
		}
		return "#ffffff";
	}

	$.fn.fixIEBackground = function () {
		if ($.browser.msie && $.browser.version < "7")
		{
			return this.each(function () {
				var obj = $(this),
					color = parentBackgroundColor(obj);
				obj.css("background-color", color);
			});
		}
		return this;
	}

})(jQuery);
(function($) {

	function doTransition (prev, next, prevTarget, nextTarget, prevEasing, nextEasing, prevSpeed, nextSpeed, synchronous)
	{
		var nextIn = function () {
			next.show().animate(nextTarget, nextSpeed, nextEasing, function () {
				// Remove opacity, workaround for an IE bug:
				// http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/4df69380-c1ef-4fb6-8e7b-f133131b4abe
				next.css({opacity: ""});
			});
		};
		prev.animate(prevTarget, prevSpeed, prevEasing, function() {
			if (!synchronous)
			{
				nextIn();
			}
			prev.remove();
		});
		if (synchronous)
		{
			nextIn();
		}
	}

	var transitions = {
		fade : function (prev, next, container, forward) {
			var width = container.width();

			next.css({
				zIndex : 1,
				opacity : 0
			});
			prev.css({
				zIndex : 2,
				opacity : 1
			});
			doTransition(prev, next,
				{
					opacity : 0
				},
				{
					opacity : 1
				},
				"linear",
				"linear",
				"normal",
				"normal",
				true);
		},
		blindX : function (prev, next, container, forward) {
			var width = container.width();

			container.css({
				overflow : "hidden"
			});
			next.css({
				left : width
			});
			doTransition(prev, next,
				{
					left : width
				},
				{
					left : 0
				},
				"swing",
				"swing",
				"normal",
				"normal",
				false);
		},
		blindY : function (prev, next, container, forward) {
			var height = container.height();

			container.css({
				overflow : "hidden"
			});
			next.css({
				top : height
			});
			doTransition(prev, next,
				{
					top : height
				},
				{
					top : 0
				},
				"swing",
				"swing",
				"normal",
				"normal",
				false);
		},
		scrollX : function (prev, next, container, forward) {
			var width = container.width();

			container.css({
				overflow : "hidden"
			});
			next.css({
				left : forward ? width : -width
			});
			doTransition(prev, next,
				{
					left : forward ? -width : width
				},
				{
					left : 0
				},
				"easeOutElastic",
				"easeOutElastic",
				1500,
				1500,
				true);
		},
		scrollY : function (prev, next, container, forward) {
			var height = container.height();

			container.css({
				overflow : "hidden"
			});
			next.css({
				top : forward ? height : -height
			});
			doTransition(prev, next,
				{
					top : forward ? -height : height
				},
				{
					top : 0
				},
				"easeOutElastic",
				"easeOutElastic",
				1500,
				1500,
				true);
		},
		closeX : function (prev, next, container, forward) {
			var width = container.width(),
				height = container.height(),
				visible = {clip : "rect(0px, Wpx, Hpx, 0px)".replace("W", width).replace("H", height)},
				invisible = {clip : "rect(0px, Wpx, Hpx, Wpx)".replace("H", height).replace(/W/g, width / 2)};
				
			next.css(invisible);
			prev.css(visible);
			doTransition(prev, next,
				invisible,
				visible,
				"swing",
				"easeOutBounce",
				"fast",
				"slow",
				false);
		},
		closeY : function (prev, next, container, forward) {
			var width = container.width(),
				height = container.height(),
				visible = {clip : "rect(0px, Wpx, Hpx, 0px)".replace("W", width).replace("H", height)},
				invisible = {clip : "rect(Hpx, Rpx, Hpx, 0px)".replace("R", width).replace(/H/g, height / 2)};

			next.css(invisible);
			prev.css(visible);
			doTransition(prev, next,
				invisible,
				visible,
				"swing",
				"easeOutBounce",
				"fast",
				"slow",
				false);
		},
/*
		wipeX : function (prev, next, container, forward) {
			var width = container.width(),
				height = container.height(),
				clipStart = "rect(0px Rpx Bpx 0px)".replace("R", width).replace("B", height),
				clipEnd = "rect(0px Rpx Bpx Lpx)".replace("R", forward ? 0 : width).replace("B", height).replace("L", forward ? 0 : width);
			prev.css({
				zIndex : 2,
				clip : clipStart
			});
			next.css({
				zIndex : 1
			});
			doTransition(prev, next,
				{
					clip : clipEnd
				},
				{
					// Strange, need this bogus animation in order not to mess up future animations
					height : height
				},
				"swing",
				"swing",
				"normal",
				"normal",
				true);
		},
		wipeY : function (prev, next, container, forward) {
			var width = container.width(),
				height = container.height(),
				clipStart = "rect(0px Rpx Bpx 0px)".replace("R", width).replace("B", height),
				clipEnd = "rect(Tpx Rpx Bpx 0px)".replace("T", forward ? 0 : height).replace("B", forward ? 0 : height).replace("R", width);
			prev.css({
				zIndex : 2,
				clip : clipStart
			});
			next.css({
				zIndex : 1
			});
			doTransition(prev, next,
				{
					clip : clipEnd
				},
				{
					height : height
				},
				"swing",
				"swing",
				"normal",
				"normal",
				true);
		},
*/
		shuffle : function (prev, next, container, forward) {
			var width = container.width(),
				subject = forward ? prev : next;

			container.css({
				overflow : "visible"
			});

			next.css({
				zIndex : 2
			});
			prev.css({
				zIndex : 3
			});
			next.show();

			// Move
			subject.css("opacity", forward ? 1: 0);
			subject.animate({
				top : 20,
				left : -width,
				opacity : 0.8
			}, "normal", "swing", function() {
				// Move in
				subject.css({
					zIndex : forward ? 1 : 3
				});
				subject.animate({
					top : 0,
					left : 0,
					opacity : forward ? 0.6 : 1
				}, "normal", "swing", function () {
					prev.remove();
				});
			});
		},
		uncoverX : function (prev, next, container, forward) {
			var width = container.width();
			container.css({
				overflow : "hidden"
			});
			prev.css({
				zIndex : forward ? 2 : 1
			});
			next.css({
				left : forward ? 0 : -width,
				zIndex : forward ? 1 : 2
			});
			doTransition(prev, next,
				{
					left : forward ? -width : 0
				},
				{
					left : 0
				},
				"swing",
				"swing",
				"normal",
				"normal",
				true);
		},
		uncoverY : function (prev, next, container, forward) {
			var height = container.height();
			container.css({
				overflow : "hidden"
			});
			prev.css({
				zIndex : forward ? 2 : 1
			});
			next.css({
				top : forward ? 0 : -height,
				zIndex : forward ? 1 : 2
			});
			doTransition(prev, next,
				{
					top : forward ? -height : 0
				},
				{
					top : 0
				},
				"swing",
				"swing",
				"normal",
				"normal",
				true);
		},
		toss : function (prev, next, container, forward) {
			var width = container.width(),
				height = container.height(),
				tossed = {
					top : -(height / 2),
					left : width * 2,
					opacity : 0
				},
				visible = {
					left : 0,
					top : 0,
					opacity : 1
				};

			container.css({
				overflow : "visible"
			});
			prev.css({
				zIndex : forward ? 2 : 1
			});
			next.css({
				zIndex : forward ? 1 : 2
			});
			if (!forward)
			{
				next.css(tossed);
			}

			doTransition(prev, next,
				forward ? tossed : visible,
				visible,
				"swing",
				"swing",
				1100,
				1100,
				true);
		},
		clipFadeZoom : function (prev, next, container, forward) {
			var width = container.width(),
				height = container.height(),
				small = "rect(Hpx Wpx Hpx Wpx)".replace(/W/g, Math.floor(width / 2)).replace(/H/g, Math.floor(height / 2)),
				large = "rect(0px Wpx Hpx 0px)".replace("H", height).replace("W", width);
			prev.css({
				zIndex : forward ? 1 : 2,
				clip : large,
				opacity : 1
			});
			next.css({
				zIndex : forward ? 2 : 1,
				clip : forward ? small : large,
				opacity : forward ? 1 : 0
			});
			doTransition(prev, next,
				{
					clip : forward ? large : small,
					opacity : forward ? 0 : 1
				},
				{
					clip : large,
					opacity : 1
				},
				"swing",
				"swing",
				"normal",
				"normal",
				true);
		}
	};

	function centerImage (element)
	{
		var img = new Image(),
			containerWidth = element.parent().width(),
			containerHeight = element.parent().height(),
			width,
			height,
			ratio;
		img.onload = function () {
			width = img.width;
			height = img.height;
			ratio = Math.min(1, containerWidth / width);
			ratio = Math.min(ratio, containerHeight / height);
			width *= ratio;
			height *= ratio;

			var style = {
				position : "absolute",
				left : (containerWidth - width) / 2,
				top : (containerHeight - height) / 2,
				width : width,
				height : height
			};
			element.css(style);
		};
		img.src = element.attr("src");
	}

	$.fn.transitionTo = function(src, transition, forward) {
		var prev,
			img = this.find("img"),
			container = this.parent(),
			fnTransition = transitions[transition],
			relativeStyle = {
					position : "relative",
					top: 0,
					left : 0,
					width : container.width(),
					height : container.height()
				},
			absoluteStyle = {
					position : "absolute",
					opacity : "",
					clip : 	"rect(0px Rpx Bpx 0px)".replace("R", container.width()).replace("B", container.height()),
					top: 0,
					left : 0,
					width : container.width(),
					height : container.height()
				};

		// remove all siblings and stop any running animation
		this.siblings().remove().andSelf().stop(true, true);

		// Only do this if the elements are visible
		if (container.filter(":visible").size())
		{
			// Previous animations may have messed up the CSS so we need to reset it
			container.css(relativeStyle);
			this.css(absoluteStyle);
		}
		
		if (!fnTransition)
		{
			img.attr("src", src).parent().css(relativeStyle);
			centerImage(img);
			return;
		}

		// Insert a clone to serve as "previous" image in animation
		prev = this.clone().insertAfter(this);

		// Replace image and center it
		img.attr("src", src).parent().css(relativeStyle);
		centerImage(img);

		if (typeof forward == "undefined")
		{
			forward = true;
		}

		fnTransition(prev, this, container, forward);
	};

})(jQuery);
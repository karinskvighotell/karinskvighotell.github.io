(function ($) {
	var clipPattern = /rect\(([0-9]{1,})(px|em)[, ]+([0-9]{1,})(px|em)[, ]+([0-9]{1,})(px|em)[, ]+([0-9]{1,})(px|em)\)/;

	/**
	* Creates an array of clip settings where the values correspond to:
	* rect([0] [1], [2] [3], [4] [5], [6] [7])
	*/
	function getClip (style) {
		var parsed = clipPattern.exec(style),
		result = $.map(parsed.slice(1), function (text, index) {
				if ((index % 2) == 0)
				{
					return parseInt(text);
				}
				else
				{
					return text;
				}
			});
		return result;
	}

	function makeClip(array) {
		var result = "rect(" + [
				array[0] + array[1],
				array[2] + array[3],
				array[4] + array[5],
				array[6] + array[7]
			].join(",") + ")";
		return result;
	}
	
	$.fx.step.clip = function (fx) {
	
		if (!fx.clipTarget) {
			fx.clipStart = getClip($.curCSS(fx.elem, "clip"));
			fx.clipTarget = getClip(fx.end);
		}

		var update = makeClip([
				parseInt((fx.pos * (fx.clipTarget[0] - fx.clipStart[0])) + fx.clipStart[0]), fx.clipTarget[1],
				parseInt((fx.pos * (fx.clipTarget[2] - fx.clipStart[2])) + fx.clipStart[2]), fx.clipTarget[3],
				parseInt((fx.pos * (fx.clipTarget[4] - fx.clipStart[4])) + fx.clipStart[4]), fx.clipTarget[5],
				parseInt((fx.pos * (fx.clipTarget[6] - fx.clipStart[6])) + fx.clipStart[6]), fx.clipTarget[7]
			]);
		
		$(fx.elem).css("clip", update);
	}
})(jQuery);

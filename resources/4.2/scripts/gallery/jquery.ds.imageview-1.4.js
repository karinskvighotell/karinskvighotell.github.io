(function ($) {
    $.fn.dsImageView = function (opts) {
        var options = $.extend({
            transition: "fade",                              // Transition
            playSpeed: 5000,                                 // Time (ms) for each image when playing through
            disabledClass: "disabled",                       // CSS class for disabled previous/next elements
            image: $("#ds-image"),                           // [required] image element, will have its src attribute replaced as necessary
            description: $("#ds-description"),               // [required] Description element, its content is replaced by the current image description
            previous: $("#ds-previous"),                     // [required] "previous" element
            imageNumber: $("#ds-image-number"),              // [required] Image number element, its content is replaced by the current image number
            next: $("#ds-next"),                             // [required] "next" element
            totalNumber: $("#ds-total-number"),              // [required] Total number element, its content is replaced by the total number of images
            descriptions: null,                              // [required] Collection of image description elements
            close: $("#ds-close"),                           // [optional] "Close" button
            play: $("#ds-play"),                             // [optional] "play" element
            stop: $("#ds-pause"),                            // [optional] "stop" element
            overlay: null,                                   // [optional] Overlay element, automatically faded in/out and resized as necessary
            container: null,                                 // [optional] Container element, resized as necessary
            activeClass: "active",                           // [optional] CSS class for "active" links
            playable: true,                                  // [optional] Playing enabled
            autoPlay: false,                                 // [optional] Start playing automatically
            callback: null,                                  // [optional] callback to be notified of image changes - function (activatedImageNumber) {...}
            containerTop: 20,                                // [optional] Sets default space for the fullview container from top
            commentForm: $("#ds-comment-form"),              // [optional] Comment form element
            commentList: "div.GalleryComments"               // [optional] Comment list selector
        }, opts),
			playable = options.playable && options.play && options.stop,
			autoPlay = options.autoPlay && playable,
			subjects = this,
			disabledClass = options.disabledClass,
			ie6 = ($.browser.msie && $.browser.version < "7"),
			currentImage = null,
			images = [],
			playId = null,
			containerWidth = null,
			containerHeight = null,
			containerTop = null;
        var count = 0;

        function show() {
            var obj = $(this);
            currentImage = null;

            // Size image view appropriately
            adjustSize();

            // Hide objects that MSIE would show above the overlay
            if (ie6) {
                $("embed, object, select").css({ visibility: "hidden" });
            }

            // Show image view
            presentContainer(function () {
                view(obj);
                initPlaying();
            });

            eventHandlers("bind");
            return false;
        }

        function view(obj) {
            var index = subjects.index(obj);
            stopPlaying();
            go(index);
            return false;
        }

        function go(image) {
            var from = currentImage,
				to = image;
            image = (image + images.length) % images.length;
            to = image;

            if (image !== currentImage && image >= 0 && image < images.length) {
                currentImage = image;
                loadImage(images[currentImage].src, function () {
                    if (currentImage !== null) {
                        transitionImage(from, to);
                    }
                });
                refreshNavigation();
                if (options.callback) {
                    options.callback(currentImage);
                }
                resetPlayTimeout();
                preloadNeighbours();
            }
        }

        function transitionImage(from, to) {
            var obj = options.image.parent().parent(),
				fwd = ((from < to) && !(from === 0 && to === images.length - 1)) || (from === images.length - 1 && to === 0),
				src = images[currentImage].src;
            obj.transitionTo(src, from === null ? false : options.transition, fwd);
        }

        function previous() {
            go(currentImage - 1);
            return false;
        }

        function next() {
            go(currentImage === null ? 0 : currentImage + 1);
            return false;
        }

        function initPlaying() {
            options.totalNumber.html(images.length);
            if (images.length <= 1) {
                options.previous.parent().hide();
            }
            else {
                options.previous.parent().show();
            }
            // Hide elements as necessary
            if (playable) {
                options.play.show();
                options.stop.show();

                // Autostart?
                if (autoPlay) {
                    startPlaying();
                }
            }
            else {
                options.play.hide();
                options.stop.hide();
            }
        }

        function playClicked() {
            startPlaying();
            next();
        }

        function startPlaying() {
            stopPlaying();
            playId = window.setTimeout(next, options.playSpeed);
            options.play.addClass(options.disabledClass);
            options.stop.removeClass(options.disabledClass);
            return false;
        }

        function stopPlaying() {
            if (playId) {
                window.clearTimeout(playId);
                playId = null;
                refreshNavigation();
            }
            options.play.removeClass(options.disabledClass);
            options.stop.addClass(options.disabledClass);
            return false;
        }

        function togglePlaying() {
            if (playId) {
                stopPlaying();
            }
            else {
                playClicked();
            }
        }

        function resetPlayTimeout() {
            if (playId) {
                window.clearTimeout(playId);
                playId = window.setTimeout(next, options.playSpeed);
            }
        }

        function presentContainer(callback) {
            // Prepare for animation
            var children = options.container.find("> *");
            options.container.css({
                width: 0,
                height: 0,
                minWidth: 0,
                minHeight: 0,
                display: "block"
            });
            options.image.css("visibility", "hidden");
            children.css("opacity", 0);

            //children.fixIEBackground();

            // Do the animation
            options.container.animate({
                width: containerWidth,
                height: containerHeight
            }, function () {
                options.container.css({
                    minWidth: containerWidth,
                    minHeight: containerHeight,
                    height: ie6 ? containerHeight : "auto"
                });
                callback();
                options.image.css("visibility", "visible");
                children.animate({ opacity: 1 });
            });
            if (options.overlay) {
                options.overlay.fadeOut(0).css({ opacity: 0.7 }).fadeIn("normal");
            }
        }

        function hideImage() {
            options.image.stop(true, true).css({ opacity: 0 });
            options.description.stop(true, true).css({ opacity: 0 });
        }

        function refreshNavigation() {
            var speed = options.description.html() ? "normal" : 0;
            options.imageNumber.text(currentImage + 1);
            options.description.stop(true, true);
            //options.description.fixIEBackground();
            options.description.fadeOut(speed, function () {
                if (currentImage !== null) {
                    options.description.html(images[currentImage].description());
                    options.description.find("div").each(function () {
                        var obj = $(this);
                        var id = obj.attr("id");
                        if (id != undefined && id.length > 0)
                            obj.attr("id", "_" + id);
                    });
                    options.description.find(options.commentList).show();
                    if (options.commentForm.length > 0)
                        options.description.append(options.commentForm.clone());
                    options.description.fadeIn(speed);
                }
            });

            subjects.removeClass(options.activeClass);
            subjects.eq(currentImage).addClass(options.activeClass);
        }

        // Preload previous and next images
        function preloadNeighbours() {
            var total = images.length,
				prev = (currentImage + total - 1) % total,
				next = (currentImage + total + 1) % total;
            loadImage(images[prev].src);
            loadImage(images[next].src);
        }

        function loadImage(url, callback) {
            var image = new Image();
            if (callback) {
                image.onload = function () {
                    // Reset onload or MSIE will misbehave with animated gifs
                    image.onload = function () { };
                    callback();
                };
            }
            image.src = url;
        }

        function hide() {
            // Disable event handlers
            eventHandlers("unbind");

            // Stop playing
            if (playable) {
                stopPlaying();
            }

            // Hide container
            options.image.parent().parent().css("opacity", "");
            $("> *", options.container).animate({ opacity: 0 });
            options.container.animate({
                width: 0,
                height: 0,
                minWidth: 0,
                minHeight: 0
            }, "normal", function () {
                options.description.html("");
                options.container.hide().width(containerWidth).height(containerHeight);
            });
            options.overlay.fadeOut("normal", function () {
                if (ie6) {
                    // Show objects that were hidden for MSIE
                    $("embed, object, select").css({ visibility: "visible" });
                }
            });
            currentImage = null;
            options.image.attr("src", "/resources/functions/images/empty-pixel.gif");
            return false;
        }

        function eventHandlers(action) {
            // Click handlers
            if (options.close) {
                options.close[action]("click", hide);
            }
            options.next[action]("click", next);
            options.previous[action]("click", previous);
            if (playable) {
                options.play[action]("click", playClicked);
                options.stop[action]("click", stopPlaying);
            }

            // Window event handlers
            if (options.overlay && options.container) {
                options.overlay[action]("click", hide);
                $(window)[action]("resize", adjustSize);
                $(window)[action]("scroll", onScroll);
            }
            options.image.parent()[action]("click", next);
            $(document)[action]("keydown", onKeyDown);
        }

        function onKeyDown(event) {
            if (event.which == 32) {
                // Space
                if (playable) {
                    var target = $(event.target);
                    if (target.is("textarea, input"))
                        return;
                    togglePlaying();
                }
            } else if (event.which == 27) {
                // Escape
                if (options.container)
                    hide();
            } else if (event.which == 37) {
                // Left
                previous();
            } else if (event.which == 39) {
                // Right
                next();
            }
        }

        function onScroll() {
            var scrollLeft = $(window).scrollLeft(),
                scrollTop = $(window).scrollTop(),
                currentTop = options.container.position().top;
            if (currentTop > scrollTop + containerTop) {
                options.container.css({
                    top: scrollTop + containerTop
                });
            }
            else if (currentTop + options.container.height() < scrollTop + $(window).height()
                && currentTop < scrollTop + containerTop) {
                options.container.css({
                    top: Math.max(containerTop, scrollTop + $(window).height() - options.container.outerHeight())
                });
            }

            if (ie6) {
                options.overlay.css({
                    position: 'absolute',
                    left: scrollLeft,
                    top: scrollTop,
                    width: $(window).width(),
                    height: $(window).height()
                });
            }
        }

        function adjustSize() {
            var scrollTop = $(window).scrollTop(),
				scrollLeft = $(window).scrollLeft(),
				xOffset = scrollLeft,
				yOffset = scrollTop,
				currentTop = Math.max(options.container.position().top, containerTop),
				containerXOffset = ($(window).width() - options.container.width()) / 2,
				containerYOffset = containerTop; // ($(window).height() - options.container.height()) / 2;

            // overlay size
            options.overlay.css({
                position: ie6 ? 'absolute' : 'fixed',
                left: ie6 ? xOffset : 0,
                top: ie6 ? yOffset : 0,
                width: $(window).width(),
                height: $(window).height()
            });

            xOffset = scrollLeft + Math.max(0, containerXOffset);
            yOffset = scrollTop + Math.max(containerTop, Math.max(0, containerYOffset));

            options.container.css({
                position: 'absolute',
                left: Math.floor(xOffset),
                top: Math.floor(yOffset)
            });
        }

        // Find all images
        this.each(function (index) {
            var obj = $(this);
            images[index] = {
                id: obj.attr("id"),
                src: obj.attr("href"),
                description: function () {
                    return (options.descriptions ? options.descriptions.eq(index).html() : subjects.eq(index).find("img").attr("alt"));
                }
            };
        });

        // Measure container
        if (options.container) {
            var css = {
                visibility: options.container.css("visibility"),
                display: options.container.css("display")
            };

            options.container.css({
                visibility: "hidden",
                display: "block"
            });
            containerWidth = options.container.width();
            containerHeight = options.container.height();
            containerTop = options.containerTop;
            options.container.css(css);
        }

        // Set appropriate click handlers
        if (options.container) {
            this.click(show);
        }
        else {
            eventHandlers("bind");
            initPlaying();
            go(0);
            this.click(function () {
                return view($(this));
            });
        }
        return this;
    };
})(jQuery);

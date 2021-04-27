/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - http://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

(function ($, Drupal, window, document, undefined) {
  Drupal.behaviors.nmacsFlexslider = {
    attach: function (context, settings) {

      Drupal.nmaCsInitialiseSlideshow = function(destroy) {

        if (typeof(destroy) === 'undefined') destroy = false;

        if ($('#slider').length) {

          if ($('#slider').data('flexslider') != undefined && !destroy) {
            return;
          }

          var currentSlide = 0;

          if($('#slideshow-link').length) {
            // remove any existing full screen slideshow dialogs
            if ($("#slideshow-dialog").hasClass('ui-dialog-content')) {
             $("#slideshow-dialog").dialog('destroy').remove();
            }

            // Make a copy of the galleries for the popup.
            // The #slideshow-link click handler will populate the list items.
            var slider = '<div id="dialog-slider" class="flexslider slider"><ul class="slides"></ul></div>';
            $('#slider').parent().append('<div id="slideshow-dialog"></div>');
            $('#slideshow-dialog').append(slider);
          }

          //Thumbnail carousel

          if ($('#carousel').length) {
            $('#carousel').flexslider({
              animation: "slide",
              controlNav: false,
              slideshow: false,
              itemWidth: 100,
              itemMargin: 0,
              touch: false,
              directionNav: false,
              asNavFor: '#slider',
              after: function(slider) {
                $("#carousel").trigger("scroll");
              },
              start: function(slider) {
                $("#carousel").trigger("scroll");
              },
            });
          }
          //Image carousel
          $('#slider').flexslider({
            animation: "fade",
            controlNav: false,
            slideshow: false,
            touch: false,
            directionNav: true,
            keyboard: true,
            multipleKeyboard: true,
            prevText: "Previous",
            nextText: "Next",
            sync: "#carousel",
            before: function(slider) {
              currentSlide = slider.animatingTo;
              if (typeof settings.nma_cs.images.img_request[currentSlide] != 'undefined') {
                $('.gallery-links a.image-request').replaceWith(settings.nma_cs.images.img_request[currentSlide]);
                Drupal.nmacsInitImageRequestLink();
              }
              // Hide the image reuse section on slide change.
              $('.object-page-main').removeClass('show');
            },
            after: function(slider) {
              $("#slider ul.slides li.flex-active-slide img").trigger("canSee");
            },
            start: function(slider) {
              $("#slider ul.slides li.flex-active-slide img").trigger("canSee");
              currentSlide = slider.animatingTo;
              if (typeof settings.nma_cs.images.img_request[currentSlide] != 'undefined') {
                $('.gallery-links a.image-request').replaceWith(settings.nma_cs.images.img_request[currentSlide]);
                Drupal.nmacsInitImageRequestLink();
              }
            }
          });

          $('#carousel img.carousel-lazy').show().lazyload({
            effect : "fadeIn",
            container: "#carousel",
            threshold : 50,
            appear: function () {
              // need to remove lazy so it doesn't try to load them again
              // this was an issue on Chrome
              $(this).removeClass('carousel-lazy');
            }
          });

          $('#slider img.slider-lazy').show().lazyload({
            effect : "fadeIn",
            'event' : "canSee",
            // Deliberately provide a bogus container otherwise event doesn't work
            container: "#carousel",
            appear: function () {
              // need to remove lazy so it doesn't try to load them again
              // this was an issue on Chrome
              $(this).removeClass('slider-lazy');
            }
          });

          // dialog setup
          if($('#slideshow-link').length) {
            $('#slideshow-dialog').dialog({
              resizable: false,
              draggable: false,
              modal: true,
              autoOpen: false,
              title: $('.object-title').first().text(),
              close: function( event, ui ) {
                $('#slider').flexslider(currentSlide);
              },
              open: function (event, ui) {
                // dialog gallery
                $('#dialog-slider').flexslider({
                  animation: "fade",
                  controlNav: false,
                  slideshow: false,
                  touch: false,
                  directionNav: true,
                  keyboard: true,
                  multipleKeyboard: true,
                  prevText: "Previous",
                  nextText: "Next",
                  before: function(slider) {
                    currentSlide = slider.animatingTo;
                  },
                  after: function(slider) {
                    $("#dialog-slider ul.slides li.flex-active-slide img").trigger("canSee");
                  },
                  start: function(slider) {
                    $("#dialog-slider ul.slides li.flex-active-slide img").trigger("canSee");
                  }
                });
                // sync the full screen image to the smaller slideshow image
                $('#dialog-slider').flexslider(currentSlide);

                $('#dialog-slider img.slider-lazy').show().lazyload({
                  effect : "fadeIn",
                  'event' : "canSee",
                  // Deliberately provide a bogus container otherwise event doesn't work
                  container: "#dialog-slider",
                  appear: function () {
                    // need to remove lazy so it doesn't try to load them again
                    // this was an issue on Chrome
                    $(this).removeClass('slider-lazy');
                  }
                });
              }
            });

            // slideshow link setup
            var dialogSliderSetup = false;
            $('#slideshow-link').on("touchstart click", function(e){
              e.preventDefault();
              if(!dialogSliderSetup) {
                for (var i=0; i<Drupal.settings.nma_cs.images.slides_large.length; i++) {
                  $('#dialog-slider ul').append(Drupal.settings.nma_cs.images.slides_large[i]);
                }
                dialogSliderSetup = true;
              }

              $('#slideshow-dialog').dialog('open');
            });
          }
        }
      }
      Drupal.nmaCsInitialiseSlideshow();

      // Click handler for image request links.
      Drupal.nmacsInitImageRequestLink = function() {
        $('.object-page-main a.image-request').once('image-request').click(function(e) {
          e.preventDefault();
          // Get rid of the focus state on the clicked link, because the client
          // wanted it to be that way.
          $(this).blur();

          var $img = $('.object-page-main #slider li.flex-active-slide img');
          var imageInfo = '';
          if ($img.attr('data-download-dimensions')) {
            imageInfo += $img.attr('data-download-dimensions') + ', ';
          }
          if ($img.attr('data-download-size')) {
            imageInfo += $img.attr('data-download-size');
          }

          // Toggle the form.
          $('.object-page-main').toggleClass('show');
          // Set the download image link.
          $('#image-reuse_outer-wrapper #image-download a').attr('href', $img.attr('data-download-url'));
          // Set the download image info. Clean up existing p tag and then add a
          // new one if we need to so we never end up with an empty p tag.
          $('#image-reuse_outer-wrapper #image-download p.download-image-info').remove();
          if (imageInfo) {
            $('#image-reuse_outer-wrapper #image-download').append('<p class="download-image-info">Download image:<br />' + imageInfo + '</p>');
          }

          $('#image-reuse_outer-wrapper #image-download a').once('image-download').click(function(e) {
            $('#image-reuse_outer-wrapper input[name="submitted[clicked_button]"]').val('Download');
            // Trigger the webform on download.
            $('#webform-client-form-4311 .form-actions .form-submit').click();
          });

          // Set the image purchase link for this image.
          $('#image-reuse_outer-wrapper #image-purchase a').once('image-purchase').click(function(event) {
            event.preventDefault();
            // Hardcoded "Purchase" value needed to be hook in the form_submit_handler
            $('#image-reuse_outer-wrapper input[name="submitted[clicked_button]"]').val('Purchase');
            $("#webform-client-form-4311").submit();
          });

          // Set the image request for this image.
          $('#image-reuse_outer-wrapper a.image-send-request').attr('href', $(this).attr('href'));

          $('#image-reuse_outer-wrapper').attr('data-ref-type', $img.attr('data-type'));

        });
      }

      Drupal.populateForm = function () {
        if ($('#webform-client-form-4311').length) {
          var $img = $('.object-page-main #slider li.flex-active-slide img');
          // Populate the form.
          if (!(objectId = $('#section-object').attr('data-object-id'))) {
            // If not available from the statement above, get it from the path
            objectId = window.location.pathname.split("/").slice(-1)[0];
          }
          $('#image-reuse_outer-wrapper input[name="submitted[object_id]"]').val(objectId);
          $('#image-reuse_outer-wrapper input[name="submitted[object_link]"]').val(location.href);
          $('#image-reuse_outer-wrapper input[name="submitted[image_title]"]').val($img.attr('title'));
          $('#image-reuse_outer-wrapper input[name="submitted[image]"]').val($img.attr('id'));
          $('#image-reuse_outer-wrapper input[name="submitted[clicked_button]"]').val($(this).text());
        }
      }
      Drupal.populateForm();


      Drupal.nmacsAddSmallThrobber = function (selector) {
        $(selector).prepend('<div class="ajax-throbber-wrapper-small"><img class="ajax-throbber" src="http://' + window.location.host + settings.nma_cs.basePath + settings.nma_cs.modulePath + '/images/throbber.gif" /></div>');
      }

      Drupal.nmacsRemoveSmallThrobber = function(selector) {
        $('.ajax-throbber-wrapper-small', selector).remove();
      }

    }
  }
})(jQuery, Drupal, this, this.document);

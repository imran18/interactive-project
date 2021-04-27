/**
 * @file
 * Javascript for the flexslider slideshow for user editable content.
 */

(function ($, Drupal, window, document, undefined) {
  Drupal.behaviors.nmaucFlexslider = {
    attach: function (context, settings) { 
      
      Drupal.nmaucInitialiseSlideshow = function() {

        if ($('#rephotograph-slider').length && $('#rephotograph-carousel').length && $('#nmauc-slideshow-link').length) {

          // the current slide the user is viewing
          var currentSlide = 0;

          // make a copy for the 
          if($('#nmauc-slideshow-link').length) {
            // remove any existing full screen slideshow dialogs
            if ($("#rephotograph-dialog").hasClass('ui-dialog-content')) {
             $("#rephotograph-dialog").dialog('destroy').remove();
            }
            var carousel = $('#rephotograph-carousel').clone();
            carousel.attr('id','rephotograph-carousel-dialog');
            var slider = $('#rephotograph-slider').clone();
            slider.attr('id','rephotograph-slider-dialog');
            $('#rephotograph-carousel').parent().append('<div id="rephotograph-dialog"></div>');
            $('#rephotograph-dialog').append(slider);
            $('#rephotograph-dialog').append(carousel);
          }
          

          //Thumbnail carousel
          $('#rephotograph-carousel').flexslider({
            animation: "slide",
            controlNav: false,
            slideshow: false,
            itemWidth: 100,
            itemMargin: 5,
            touch: true,
            directionNav: false,
            asNavFor: '#rephotograph-slider',
            start: function (slider) {
              // apply pointcrop once
              Drupal.crop('#rephotograph-carousel img', 'li', true);
            }
          });
          
          //Image carousel 
          $('#rephotograph-slider').flexslider({
            animation: "fade",
            controlNav: false,
            slideshow: false,
            touch: true,
            directionNav: true,
            keyboard: true,
            multipleKeyboard: true, 
            prevText: "Previous",
            nextText: "Next",
            sync: "#rephotograph-carousel",
            before: function(slider) {
              currentSlide = slider.animatingTo;
            }
          });   


          if($('#nmauc-slideshow-link').length) {
            $('#rephotograph-dialog').dialog({
              resizable: false,
              draggable: false,
              modal: true,
              autoOpen: false,
              title: 'Contributer Photos',
              close: function( event, ui ) {
                $('#rephotograph-slider').flexslider(currentSlide);
              },
              open: function (event, ui) {
                // dialog gallery
                if ($('#rephotograph-carousel-dialog').length) {
                  $('#rephotograph-carousel-dialog').flexslider({
                    animation: "slide",
                    controlNav: false,
                    slideshow: false,
                    itemWidth: 100,
                    itemMargin: 0,
                    touch: true,
                    directionNav: false,
                    asNavFor: '#rephotograph-slider-dialog',
                    start: function (slider) {
                      // apply pointcrop once
                      Drupal.crop('#rephotograph-carousel-dialog img', 'li', false);
                    }
                  });
                }
                $('#rephotograph-slider-dialog').flexslider({
                  animation: "fade",
                  controlNav: false,
                  slideshow: false,
                  touch: true,
                  directionNav: true,
                  keyboard: true,
                  multipleKeyboard: true, 
                  prevText: "Previous",
                  nextText: "Next",
                  sync: "#rephotograph-carousel-dialog",
                  before: function(slider) {
                    currentSlide = slider.animatingTo;
                  }
                });
                // sync the full screen image to the smaller slideshow image
                $('#rephotograph-slider-dialog').flexslider(currentSlide);
              }
            });

            $('#nmauc-slideshow-link').click(function(){
              $('#rephotograph-dialog').dialog('open');
              $('#rephotograph-slider-dialog').flexslider(currentSlide);
            });
          }

        }
      }
      Drupal.nmaucInitialiseSlideshow();
    }
  }
})(jQuery, Drupal, this, this.document);
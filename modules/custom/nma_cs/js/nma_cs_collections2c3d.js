/**
 * @file
 * Javascript for the collections listing page.
 */

(function ($, Drupal, window, document, undefined) {

  Drupal.behaviors.nmacsCollections = {
    attach: function (context, settings) {
      // set this to false if you wish to set the pushstate without triggering a refresh
      // resets to true after pushstate state change
      Drupal.pushStateReload = true;

      function nmacsCollectionsAddThrobber(selector) {
        $(selector).prepend('<div class="ajax-throbber-wrapper"><img class="ajax-throbber" src="http://' + window.location.host + settings.nma_cs.basePath + settings.nma_cs.modulePath + '/images/throbber.gif" /></div>');
      }

      function nmacsCollectionsRemoveThrobber(selector) {
        $('.ajax-throbber-wrapper', selector).remove();
      }

      function nmacsCollectionsAddMore(addRows, setState) {
        // Default state.
        if (typeof(setState) === 'undefined') setState = true;

        var page = Drupal.nmacsGetParameterByName('page') || 1;

        // An object page.
        //nmacsCollectionsAddThrobber('.object-section');
        $('#listing-more-link').addClass('loading');
        $.ajax({
          url: $('#listing-more-link').attr('href'), //'http://' + window.location.host + settings.nma_cs.basePath + url,
          dataType: 'json',
          data: {
            ajax: 1,
            page: Number(page) + 1,
            rows: settings.nma_cs.collectionRows,
          },
          success: function(data, textStatus, jqXHR) {
            if (data.markup == '') {
              // Error of some sort.
            }
            else {
              // We passed Drupal JS settings through in our ajax response so
              // handle the merging.
              if (data.settings) {
                $.extend(true, Drupal.settings, data.settings);
                $.extend(true, settings, data.settings);
              }

              var page = Number(Drupal.nmacsGetParameterByName('page')) || 1,
                urlParams = location.search;
              urlParams = Drupal.nmacsUpdateQueryString('page', page + 1, urlParams);

              if (setState) {
                Drupal.pushStateReload = false; // only want to affect the history, not reload the page
                History.pushState({}, 'Collections', location.pathname + urlParams);
              }
              
              // Add our new content.
              var lis = $('ul', data.markup).html();
              $('#section-list ul.object-view').append(lis).focus();

              // update with pointcrop when loaded
              /*Drupal.processedGridImages = false;
              Drupal.crop('div.collection-images div.object-image img', 'div');*/
              Drupal.nmacsReadmoreToggle($('div.collection-statement-of-significance'));
              Drupal.setAriaRoles();
              Drupal.nmaCsInitialiseResults();

              // Update the more link url.
              if (data.show_more) {
                urlParams = Drupal.nmacsUpdateQueryString('page', page + 2, urlParams);
                $('#listing-more-link').attr('href', location.pathname + urlParams);
              } else {
                $('#listing-more-link').hide();
              }
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // Don't throw the error if the ajax was aborted.
            if (textStatus != 'abort') {
              alert("There was an error loading the results.");
            }
          },
          complete: function (jqXHR, textStatus) {
            $('#listing-more-link').removeClass('loading');
            //nmacsCollectionsRemoveThrobber('.object-section');
          }
        });
      }

      function nmacsCollectionsProcessMore(setState) {
        // Default state.
        if (typeof(setState) === 'undefined') setState = true;

        var $collections = $('.object-section li.collection'),
          numCollections = $collections.length,
          start = Number(Drupal.nmacsGetParameterByName('start')) || 0,
          rows = settings.nma_cs.collectionRows,
          urlParams = location.search;

        if (numCollections > start + rows) {
          // If we have more than the number of results required, for example if
          // the user has added more then used the back button, just remove the
          // excess items.
          $collections.slice(start + rows).remove();
          // Update the start param in the query string.
          urlParams = Drupal.nmacsUpdateQueryString('start', start + rows, urlParams);
          // Update the more link url.
          $('#listing-more-link').attr('href', location.pathname + urlParams);
        }
        else if (numCollections < start + rows) {
          // If we have less than required then add more.
          nmacsCollectionsAddMore(0, setState);
        }
        // Otherwise if numCollections = start + rows then do nothing.
      }

      $(document).on('touchstart click', '#listing-more-link', function(e) {
        nmacsCollectionsAddMore(settings.nma_cs.collectionRows);
        e.preventDefault();
      });

      // Bind to StateChange Event
      History.Adapter.bind(window, 'statechange', function() {
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        if (Drupal.pushStateReload) {
          // Process any more button functions.
          nmacsCollectionsProcessMore(false);
        }
        else { 
          Drupal.pushStateReload = true;
        }
      });

      // crop images
      /*$(document).ready(function() {
        Drupal.crop('div.collection-images div.object-image img', 'div');
      });*/
    }
  }

})(jQuery, Drupal, this, this.document);

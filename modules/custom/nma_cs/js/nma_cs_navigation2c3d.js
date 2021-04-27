/**
 * @file
 * Navigation fucntionality for the search page using ajax and HTML5 pushState.
 */

function nmacsIsNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

(function ($, Drupal, window, document, undefined) {

  Drupal.behaviors.nmacsNav = {
    attach: function (context, settings) {
      // Don't reprocess ourself after an ajax request when we reattach
      // Drupal behaviors.
      if (typeof settings.nmaCsNavProcessed != 'undefined' && settings.nmaCsNavProcessed) {
        settings.nmaCsNavProcessed = false;
        return;
      }

      // set this to false if you wish to set the pushstate without triggering a refresh
      // resets to true after pushstate state change
      Drupal.pushStateReload = true;

      // flag to say if an ajax link has been 'clicked'
      // this is used for accessibility when the space key is pressed to make sure the link
      // is activated in the correct manner
      Drupal.linkNoRefresh = false;

      // used to store the link that was clicked when opening an object
      // the focus will go back to that link when the object is closed
      Drupal.objectClicked = null;

      Drupal.ajaxRequests = new Array();

      // Flag if the browser is IE 8 or 9.
      Drupal.ie89 = false;
      if ($('html').hasClass('ie9') || $('html').hasClass('lt-ie9')) {
        Drupal.ie89 = true;
      }

      $(document).on('touchend click', '#listing-more-link', function(e) {
        nmacsAddMore(context, settings, settings.nma_cs.rows);
        e.preventDefault();
      });

      Drupal.nmaCsInitialiseLinks(context, settings);

      // Bind to StateChange Event. Make sure only to do it once.
      $('body').once('nmacs-history-bind', function() {
        History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate

          if (!Drupal.ie89) {
            nmacsResetAjax(); // abort all ajax requests in progress
          }
          var State = History.getState(); // Note: We are using History.getState() instead of event.state

          if (Drupal.pushStateReload) {
            // Close any fullscreen slideshows.
            $("#slideshow-dialog, #rephotograph-dialog").dialog('destroy').remove();

            if (!Drupal.nmacsCheckObject(context, settings) || Drupal.ie89) {
              var address = State.cleanUrl.replace(/http:\/\/.*?\//i,'/');
              Drupal.nmacsLoadPage(context, settings, address, false);
            }
          }
          else {
            Drupal.pushStateReload = true;
          }

          // update google analytics with any state changes
          if (typeof(_gaq) !== 'undefined') { 
            _gaq.push(['_trackPageview', State.cleanUrl.replace(/http:\/\/.*?\//i,'/')]);
          }
        });
      });

      // Bind to ajax events. Make sure only to do it once.
      $('body').once('nmacs-ajax-bind', function() {
        $(document).bind('ajaxSend', function(event, jqXHR, ajaxOptions) {
          // Every time an ajax event is fired, we want to store it.
          nmacsAddAjax(jqXHR);
        }).bind('ajaxComplete', function(event, jqXHR, ajaxOptions) {
          // Every time an ajax event is completed we want to remove it.
          if (!Drupal.ie89) {
            nmacsResetAjax(jqXHR);
          }
        });
      });

      // check to see if there is an object parameter in the url on load
      // if so we need to trigger a load of that object via ajax
      // @todo do we use document.ready() for this??
      $(document).ready( function () {

        Drupal.nmacsCheckObject(context, settings);

        // if there is a facet selected collapse sidebar on load
        if (Drupal.nmacsGetParameterByName("f[0]")) {
          
        }

        // if there is a search term collapse sidebar on load
        if (typeof(Drupal.settings.nma_cs)!=='undefined') {
          if (Drupal.settings.nma_cs.collapseOnLoad) {
            
          }
        }

      });

      Drupal.nmacsSearch();

      Drupal.showHideClearFilter();

      Drupal.showHideHighlights();
    }
  }

      function nmacsAddThrobber(selector) {
        $('body').addClass('throbber-active');
      }

      function nmacsRemoveThrobber(selector) {
        $('body').removeClass('throbber-active');
      }

      function nmacsAddMore(context, settings, addRows, setState) {
        Drupal.linkNoRefresh = true;

        // Default state.
        if (typeof(setState) === 'undefined') setState = true;

        var url = 'ce',
          page = Drupal.nmacsGetParameterByName('page') || 1;

        // An object page.
        //nmacsAddThrobber('.main-content');
        $('#listing-more-link').addClass('loading');

        

        $.ajax({
          url: $('#listing-more-link').attr('href'),//'http://' + window.location.host + settings.nma_cs.basePath + url,
          dataType: 'json',
          data: {
            ajax: 1,
            page: Number(page) + 1,
            rows: settings.nma_cs.rows, 
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
                urlParams = Drupal.nmacsHistoryGetHash();
              urlParams = Drupal.nmacsUpdateQueryString('page', page + 1, urlParams);

              if (setState) {
                // We only want to affect the history, not reload the page.
                Drupal.pushStateReload = false;
                // We want to replace the current state not make a new state.
                // We are not supporting the back button with this pager as it
                // opens a world of pain in conjunction with filtering etc.
                History.replaceState({}, 'Collections', urlParams);
              }
              
              // Add our new content.
              var lis = $('ul', data.markup).html();
              var $lastGridItem = $('#section-list ul.object-view-grid li.last');
              $lastGridItem.removeClass('last');
              $('#section-list ul.object-view-grid').append(lis);
              $lastGridItem.next().find('a.objectlink').focus();
              $lastGridItem.next().addClass('active-object');

              var newRows = $('tbody', data.markup).html();
              newRows = $(newRows).not('tr.table-titles'); // remove header row
              var $lastTableItem = $('#section-list table.object-view-table tr.last')
              $lastTableItem.removeClass('last');
              $('#section-list table.object-view-table tbody').append(newRows);
              $lastTableItem.next().find('a.objectlink').focus();
              $lastTableItem.next().addClass('active-object');

              Drupal.nmaCsInitialiseResults(); // reapply page results js.

              // Initialise maps.
              // @todo what if there is an object open over a map? Would we
              // also have to do this then, the in object section below?
              // In this case add locations instead of replacing them.
              // .push can take multiple arguments and .apply will pass all
              // items of the second parameter array into .push.
              Drupal.settings.nma_geo.maps['map-canvas-main-listing-map'].mapLocations.push.apply(Drupal.settings.nma_geo.maps['map-canvas-main-listing-map'].mapLocations, data.addresses);
              Drupal.behaviors.nmaGeoGoogleMaps.attach(context, settings);

              // trigger the correct display (grid or table)
              Drupal.processedGridImages = false;
              Drupal.processedTableImages = false;
              // @todo is this necessary?
              Drupal.nmaCsSwitchResultsView(Drupal.nmaCsResultsDisplayMode);

              Drupal.setAriaRoles();

              Drupal.showHideClearFilter();

              // Update the more link url.
              if (data.show_more) {
                urlParams = Drupal.nmacsUpdateQueryString('page', page + 2, urlParams);
                $('#listing-more-link').attr('href', urlParams);
              } else {
                $('#listing-more-link').hide();
                $('.object-section').removeClass('more-button-active');
                $('.object-section').addClass('more-button-inactive');
              }

              settings.nmaCsNavProcessed = true;
              Drupal.attachBehaviors(context, settings);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // Don't throw the error if the ajax was aborted.
            if (textStatus != 'abort') {
              //alert("There was an error loading the results.");
            }
          },
          complete: function (jqXHR, textStatus) {
            $('#listing-more-link').removeClass('loading');
          }
        });
      }

      Drupal.nmacsLoadPage = function(context, settings, path, setState) {

        Drupal.linkNoRefresh = true;

        // Default state.
        if (typeof(setState) === 'undefined') setState = true;
        var pathParts = path.replace(/\?.*/i, "").split('/')
          pathNoQuery = path.split('?')[0];

        // find out if we have an object parameter in the url
        // if there is it means we need to load an object page not the normal explorer page
        var objectId = Drupal.nmacsGetParameterByName('object');
        if (!nmacsIsNumber(objectId)) {
          objectId = null;
        }



        // Load the main listing.
        if ((pathParts[1] == 'ce' || pathNoQuery == '/')) {

          // Strip preceding slash if any.
          if (path[0] == '/') {
            path = path.substr(1);
          }

          // On IE8/9 we want to hide the grid/table if we are loading another 
          // grid/table on the top. This is because of History.js and how on first
          // load it doesn't send parameters, so its always the default homepage.
          if (Drupal.ie89) {
            if (Drupal.nmacsGetParameterByName('f%5B0%5D') != '') {
              $('#section-list').empty();
            }
          }

          nmacsAddThrobber('.main-content');
          
          $.ajax({
            url: 'http://' + window.location.host + settings.nma_cs.basePath + path,
            dataType: 'json',
            data: {
              ajax: 1,
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

                // This is where we update the address bar with the 'url' parameter
                if (setState) {
                //  window.history.pushState({object: data.object}, data.title, data.url);
                  History.pushState({object: data.object}, data.title, data.url);
                }
                // Add our new content.
                //  $('#section-object').html(data.markup).focus();
                $('.object-section').replaceWith(data.markup).focus();

                // update the facet blocks
                for (var i = 0; i < data.facet_blocks.length; i++) {
                  $('#block-facetapi-' + data.facet_blocks[i].id).replaceWith(data.facet_blocks[i].markup); 
                }
                Drupal.behaviors.nmaSolrFacetFilter.attach(context, settings);

                // update search block
                $('#search-block-form').replaceWith(data.search_block);
                Drupal.nmacsInitialiseSearchValidation();
                Drupal.nmacsSearch();
                // Direct copy from apachesolr_autocomplete.js.
                // We need to reattach the javascript behaviour because the block
                // has been replaced and it doesn't get attached automatically.
                jQuery.each(Drupal.settings.apachesolr_autocomplete.forms, function(key, settings) {
                  Drupal.apachesolr_autocomplete.processOne(key, settings, context);
                });

                // update explore bar
                $('.object-filter').replaceWith(data.explore_bar);
                $('.mobile-count').replaceWith(data.explore_bar_mobile);
                Drupal.behaviors.CToolsAutoSubmit.attach(context);
                Drupal.behaviors.nmaSolrAutosubmit.attach(context);

                Drupal.nmaCsFacetFilterSetup(false); // reapply facet block js
                Drupal.nmaCsInitialiseResults(); // reapply page results js
                Drupal.nmacsSetFilterCount();

                // Initialise maps.
                // This must happen after attaching collapse behavior.
                // @todo what if there is an object open over a map? Would we
                // also have to do this then, the in object section below?
                Drupal.settings.nma_geo.maps['map-canvas-main-listing-map'].mapLocations = data.addresses;
                Drupal.behaviors.nmaGeoGoogleMaps.attach(context, settings);

                // trigger the correct display (grid or table)
                Drupal.processedGridImages = false;
                Drupal.processedTableImages = false;
                // @todo is this necessary?
                Drupal.nmaCsSwitchResultsView(Drupal.nmaCsResultsDisplayMode);

                Drupal.setAriaRoles();

                Drupal.showHideClearFilter();
                Drupal.showHideHighlights();
                Drupal.nmacsSetContentTop();

                settings.nmaCsNavProcessed = true;
                Drupal.attachBehaviors();

                // focus on explore bar
                $('.object-section li a').first().focus();
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              // Don't throw the error if the ajax was aborted.
              if (textStatus != 'abort') {
                //alert("There was an error loading the object.");
              }
            },
            complete: function (jqXHR, textStatus) {
              nmacsRemoveThrobber('.main-content');
              if (Drupal.ie9LoadObjectInUrl) {
                // if there is an object id in the url, load it
                var objectId = Drupal.nmacsGetParameterByName("object");
                if (objectId != '') {
                  Drupal.nmacsLoadPage(context, settings, '/object/' + objectId, false);
                }
              }
            }
          });
        }

        else if ((pathParts.length == 3 && pathParts[1] == 'object' && nmacsIsNumber(pathParts[2])) || objectId) {

          if (objectId && pathParts[1] != 'object') { // url with "/object/1234" takes precedence over "?object=1234", IE issue
            path = "/object/"+objectId;
          }

          nmacsAddThrobber('.main-content');
          
          $.ajax({
            url: 'http://' + window.location.host + settings.nma_cs.basePath + path,
            dataType: 'json',
            data: {
              ajax: 1,
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

                // This is where we update the address bar with the 'url' parameter
                if (setState) {
                //  window.history.pushState({object: data.object}, data.title, data.url);
                  History.pushState({object: data.object}, data.title, data.url);
                }
                // Add our new content.
                // Store the object ID on the markup so we can use it later.
                $('#section-object').html(data.markup).attr('data-object-id', data.object.id).focus();
                $('#content').addClass('object-active');

                // Remove the active class in case it has been left behind.
                $('ul.object-view li.active-object').removeClass('active-object');
                // Hack for flexslider support + others.

                // Add image data for slideshows.
                Drupal.settings.nma_cs.images = {
                  slides_large: data.slides_large,
                  img_request: data.img_request
                };

                Drupal.nmaCsInitialiseSlideshow(null, true);
                Drupal.nmaucInitialiseSlideshow();
                Drupal.behaviors.collapse.attach(context, settings);

                // Initialise maps.
                // This must happen after attaching collapse behavior.
                Drupal.settings.nma_geo.maps[data.object.map_id].mapLocations = data.object.map_locations;
                if (data.node && data.node.user_content_locations.length) {
                  Drupal.settings.nma_geo.maps[data.node.user_content_map_id].mapLocations = data.node.user_content_locations;
                }
                Drupal.behaviors.nmaGeoGoogleMaps.attach(context, settings);

                Drupal.setAriaRoles();

                Drupal.nmacsInitialiseObject();

                Drupal.nmacsReadmoreToggle($('div.object-desc').find('div.block-info'));

                // Fix image request link destination for js users.
                $('.flex-request-image a').each(function() {
                  Drupal.nmacsSetLinkDestination($(this));
                  Drupal.behaviors.CSWebformLinks.attach(context, settings);
                });

                Drupal.showHideClearFilter();
                Drupal.showHideHighlights();
                Drupal.nmacsSetContentTop();

                settings.nmaCsNavProcessed = true;
                Drupal.attachBehaviors();

                // focus on close link now the pdf link is hidden
                $('.close').focus();

                Drupal.ie9LoadObjectInUrl = false;
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              // Don't throw the error if the ajax was aborted.
              if (textStatus != 'abort') {
                //alert("There was an error loading the object.");
              }
            },
            complete: function (jqXHR, textStatus) {
              nmacsRemoveThrobber('.main-content');
            }
          });
        }
        else {
          $('#section-object').empty();
          $('#content').removeClass('object-active');
        }
      };

      Drupal.nmaCsInitialiseLinks = function(context, settings) {
        // pushState handling for all object links.
        $(document).on('click', 'a.objectlink', function(e) {
          // If the object link was in a map cluster list,
          // don't refresh the main map.
          if ($(this).parents('.map-cluster-list').length) {
            // Don't refresh the main map.
            Drupal.settings.nma_geo.maps['map-canvas-main-listing-map'].skipProcessing = true;
          }

          // we only want this for the main explorer page, not the feature/collection page
          var pathParts = location.pathname.split('/');
          if (pathParts[1] != 'highlight') {

            e.preventDefault();

            Drupal.objectClicked = e.target;

            // remove all selected classes
            $('.object-view-grid > li').removeClass('selected'); 
            $('.object-view-table tbody > tr').removeClass('selected');

            // find the index of this element
            var index = -1;
            if ($(this).parents('li').length!=0) {
              index = $('.object-view-grid > li').index($(this).parent());
            } else if ($(this).parents('td').length!=0) {
              index = $('.object-view-table tbody > tr').index($(this).parents('td').parent('tr'));
            }

            // add selected class to grid and table 
            if (index!=-1) {
              $($('.object-view-grid > li').get(index)).addClass('selected');
              $($('.object-view-table tbody > tr').get(index)).addClass('selected');
            }

            // we do not want to use the normal object link for pushstate pages
            // we want to take the object id and add it to the query parameters
            // in the form ?object=99999999

            // Get the object id.
            // remove any parameters
            var href = $(this).attr("href");
            var questionMarkPos = href.indexOf('?');
            if (questionMarkPos!=-1) {
              href = href.substr(0,questionMarkPos);
            }
            var urlParts = href.split('/');
            var objectId = urlParts[2];

            // Create the parameters.
            var urlParams = Drupal.nmacsHistoryGetHash();
            // Replace the object id.
            urlParams = Drupal.nmacsUpdateQueryString('object', objectId, urlParams);
            // get base path
            var basePath = '/ce/';
            if (location.pathname != '/') {
              basePath = location.pathname;
            }

            Drupal.pushStateReload = false; // we want to only update the history and url. we don't want a refresh of this url
            History.pushState({}, 'Collection explorer', urlParams); 
            Drupal.nmacsLoadPage(context, settings, $(this).attr("href"), false); // reload the page using the original url

          }
        });

        // pushState handling for all facet links.
        $(document).on('touchend click', 'a.facetapi-inactive,a.facetapi-active,a.facet-link,.current-search-item-active-links a', function(e) {
          var parser = document.createElement('a');
          parser.href = window.location;
          if (window.location.pathname.indexOf('/set') == -1 && window.location.pathname.indexOf('/whats-new') == -1) {
            var url = $(this).attr("href");
            url = Drupal.nmacsUpdateQueryString('object', null, url);
            History.pushState({}, 'Collection explorer', url); // update the url
            Drupal.nmacsCloseObject();
            e.preventDefault();
          }
        });

        // pushState handling for close link on object page
        $(document).on('touchend click', 'a.close', function(e) {
          Drupal.linkNoRefresh = true;

          Drupal.nmacsCloseObject();

          var urlParams = Drupal.nmacsHistoryGetHash();
          // Update the url.
          urlParams = Drupal.nmacsUpdateQueryString('object', null, urlParams);
          Drupal.pushStateReload = false; // we want to only update the history and url. we don't want a refresh of this url
          History.pushState({}, 'Collection explorer', urlParams); // update the url

          Drupal.showHideHighlights();

          e.preventDefault();
        });
      };

      /**
       * Add an ajax request to the ajaxRequests array
       *
       * @param XMLHttpRequest xhr
       *   The ajax request
       */
      function nmacsAddAjax(xhr) {
        Drupal.ajaxRequests.push(xhr);
      }

      /**
       * Remove an ajax request from the ajaxRequests array
       *
       * @param XMLHttpRequest xhr
       *   The ajax request
       */
      function nmacsRemoveAjax(xhr) {
        for(var i=0;i<Drupal.ajaxRequests.length;i++) {
          if (Drupal.ajaxRequests[i]!=null) {
            if (Drupal.ajaxRequests[i] == xhr) {
              Drupal.ajaxRequests[i] = null;
            }
          }
        }
      }

      /**
       * Aborts all requests in ajaxRequests and resets array
       */
      function nmacsResetAjax() {
        for(var i=0;i<Drupal.ajaxRequests.length;i++) {
          if (Drupal.ajaxRequests[i]!=null) {
            Drupal.ajaxRequests[i].abort();
          }
        }
        Drupal.ajaxRequests = new Array();
      }

      Drupal.nmacsHistoryGetHash = function () {
        return decodeURIComponent(History.getState().cleanUrl.replace(/http:\/\/.*?\//i,'/'));
      }

      Drupal.nmacsCheckObject = function(context, settings) {
        // if there is an object id in the url, load it
        var objectId = Drupal.nmacsGetParameterByName("object");
        if (objectId != '') {
          if (!$("#content").hasClass('object-active')) {
            Drupal.nmacsLoadPage(context, settings, '/object/' + objectId, false);
            return true;
          }
        }
        // If not then close any object that is already there.
        else {
          if ($("#content").hasClass('object-active')) {
            Drupal.nmacsCloseObject();
            return false;
          }
        }
        return false;
      };

      Drupal.nmacsCloseObject = function() {
        // Close the object.
        $('#section-object').empty();
        $('#content').removeClass('object-active');

        // set focus back to the link that triggered opening this object
        if (Drupal.objectClicked != null) { 
          Drupal.objectClicked.focus();
        }
        Drupal.objectClicked = null;

        $('.object-view-grid > li').removeClass('selected'); 
        $('.object-view-table tbody > tr').removeClass('selected');

        // Refresh map if the map tab is open.
        if (Drupal.nmaCsResultsDisplayMode == 'map') {
          google.maps.event.trigger(Drupal.settings.nma_geo.maps['map-canvas-main-listing-map'].gMap, 'resize');
        }

        setTimeout(function() {
          Drupal.nmacsSetContentTop();
        }, 200);
      };

      /**
       * Take over the submission of the search form to make it into a refine
       * rather than replace.
       */
      Drupal.nmacsSearch = function() {
        // Submit form handler.
        $('#search-block-form').submit(function(e) {

          // Get the search term.
          var searchTerm = $('#edit-search-block-form--2').val();

          // Get the current path. (we could do this via window.location)
          var action = $(this).attr('action');

          // Grab everything up to the fragment (?)
          var path = action;
          if (action.indexOf('?') != -1) {
            path = action.substring(0, action.indexOf('?'));
          }

          // Are we on the main explorer pages?
          if (path.indexOf('/ce/') !=-1 || path == '' || path == '/') {
            path = path.replace("/ce/", '');
            // Create our new path with the search term appended to the existing search term.
            if (path == "" || path == "/") {
              path = '/ce/' + searchTerm;
            } else {
              path = '/ce/' + path + '%20' + searchTerm;
            }
          // If not, do not try and append anything and just go straight to the search.
          } else {
            path = '/ce/' + searchTerm;
          }

          // Add fragment back in.
          if (action.indexOf('?') != -1) {
            path += action.substring(action.indexOf('?'));
          }

          // If there is ajax in the action, remove it.
          path = path.replace('ajax=1','');

          // Redirect to our new search path.
          // TODO In the future we should ajax this for a better UX.
          window.location = path;

          // Stop the form from submitting.
          e.preventDefault();
        });
      };

      /**
       * Decide if we need to hide the clear filter button
       */
      Drupal.showHideClearFilter = function() {
        var parser = document.createElement('a');
        parser.href = window.location;
        if (window.location.search.indexOf('f[0]') == -1 && (window.location.pathname.indexOf('/ce/') == -1 || window.location.pathname == '/ce/')) {
          // Hide the clear filter link.
          $('.clear-filters').hide();
        } else {
          // Show the clear filter link.
          $('.clear-filters').show();
        }
      };

      /**
       * Decide if we need to show or hide the highlights (sets).
       */
      Drupal.showHideHighlights = function() {
        var parser = document.createElement('a');
        parser.href = window.location;
        if (window.location.search.indexOf('f[0]') == -1 && (window.location.pathname == '/ce/' || window.location.pathname == '/' || window.location.pathname == '/whats-new') && window.location.search.indexOf('object') == -1) {
          // Show the clear filter link.
          $('.highlights').show();
        } else {
          // Hide the clear filter link.
          $('.highlights').hide();
        }
      };

})(jQuery, Drupal, this, this.document);



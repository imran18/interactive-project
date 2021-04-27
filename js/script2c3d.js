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
  Drupal.behaviors.nmacs = {
    attach: function (context, settings) { 

      var MOBILE_WIDTH = 1050;

      var sidebarCollapsed = true;

      //nmacsReadmoreToggle([Direct-Parent-Div])
      Drupal.nmacsReadmoreToggle($('body.page-collections div.collection-statement-of-significance'));
      Drupal.nmacsReadmoreToggle($('body.page-featured div.feature-desc'));
      Drupal.nmacsReadmoreToggle($('div.object-desc div.block-info'));

      // The main result set display mode.
      Drupal.nmaCsResultsDisplayMode = 'grid';

      //add class for js only elements
      $('body').addClass('jqactive');

      // Set variables for when the search is focused
      var searchFocused = false;
      $('.apachesolr-autocomplete').focus(function() {
        searchFocused = true;
      });
      $('.apachesolr-autocomplete').blur(function() {
        searchFocused = false;
      });

      Drupal.nmaCsCollapseSideBar = function() {
        if (!sidebarCollapsed && searchFocused == false) {
          // Make sure to close the search autocomplete dropdown, otherwise
          // users can still click an option after the sidebar has collapsed
          // and in that case the search will submit without the selected value.
          // Note that this version of apachesolr_autocomplete uses its own
          // custom autocomplete plugin, not the usual jquery ui autocomplete.
          $('.apachesolr-autocomplete').blur();
          $('#content').removeClass('facet-menu');
          $('#content').removeClass('active-menu-mobile');
          $('.block-facetapi').removeClass('facet-block-active');
          $('#block-nma-cs-filter-bar a.menu-title-link').attr('aria-selected', 'false');
          if ($('#block-search-form .form-text').is(':focus')){
            $("#block-search-form .form-text").prop('disabled', true);
          }

          sidebarCollapsed = true;
        }
      }
      Drupal.nmaCsExpandSideBar = function() {
        if (sidebarCollapsed) {
          $('#content').addClass('active-menu-mobile');
          sidebarCollapsed = false;
        }
      }

      // Open the menu if we are in desktop mode.
      if ($(window).width() > MOBILE_WIDTH) {
        Drupal.nmaCsExpandSideBar();
      }

      var facetMenuOpen = false;
      Drupal.nmaCsCloseFacetBlocks = function() {
        $('#content').removeClass('facet-menu');
        $('.block-facetapi').removeClass('facet-block-active');
        $('#block-nma-cs-filter-bar a.menu-title-link').attr('aria-selected', 'false');
        // Disable tabbing.
        $('#block-nma-cs-filter-bar a.facetapi-inactive, #block-nma-cs-filter-bar a.facet-more-link').attr('tabindex', '-1');
        facetMenuOpen = false;
      }
      Drupal.nmaCsOpenFacetBlock = function(id) {
        var $this = id;

        // find our facetapi block
        var $block = null;
        if ($this.next('.block-facetapi').length) {
          $block = $this.next('.block-facetapi');
        } else if ($this.closest('.block-facetapi').length) {
          $block = $this.closest('.block-facetapi');
        }

        // if the facet block is not active, make it active
        if (!$block.hasClass('facet-block-active')) {
          Drupal.nmaCsCloseFacetBlocks(); // close all facet blocks
          $('#content').addClass('facet-menu');
          $block.addClass('facet-block-active');
          if ($(window).width() > MOBILE_WIDTH) {
            $block.find('a').first().focus();
          }
          $block.siblings('a.menu-title-link').attr('aria-selected', 'true');
          facetMenuOpen = true;
        }

        // Enable tabbing through these options.
        $block.find('a.facetapi-inactive').attr('tabindex', '0');
        $block.find('a.facet-more-link').attr('tabindex', '0');

        // hide search validation messages
        Drupal.nmaCsRemoveEmptySearchMessage();
      }

      Drupal.nmaCsAddEmptySearchMessage = function() {
        $('#search-block-form .form-item-search-block-form').after('<div id="search-block-form-error"><p>Please enter some keywords.<br/>You can also remove search terms using the top bar.</p></div>');
      }

      Drupal.nmaCsRemoveEmptySearchMessage = function() {
        $('#search-block-form #search-block-form-error').remove();
      }

      //Mobile menu button
      $(".mobile-menu").once('mobile-menu').bind('touchstart click', function(event) {
        event.preventDefault();
        if ($('#content').hasClass('active-menu-mobile')) {
          Drupal.nmaCsCollapseSideBar();
        }
        else {
          Drupal.nmaCsExpandSideBar();
        }
      });

      //Mobile filter
      $(".mobile-filter").once("mobile-filter").bind('touchstart click', function(event) {
        event.preventDefault();
        if ($('#page').hasClass('mobile-filter-active')) {
          $('#page').removeClass('mobile-filter-active');
        }
        else {
          $('#page').addClass('mobile-filter-active');
        }
        Drupal.nmacsSetContentTop();
      });

      // when the sidebar is open and a user hovers / tabs over Featured, What's New or Collections
      // we want to close any open facet blocks so its not blocking the text
      $('.menu__link').once('submenu-behaviour', function() {
        $(this).hover(function(e) {
          Drupal.nmaCsCloseFacetBlocks();
        }).focus(function(e) {
          Drupal.nmaCsCloseFacetBlocks();
        });
      });

      // on focus of the search text box we hide any facet menu that was open
      $('.sidebars .form-text').once('sidebar-text-focus', function() {
        $(this).focus(function() {
          Drupal.nmaCsCloseFacetBlocks();
        });
      });

      // the 4 w links
      $('.facet-menu .facet-link .menu-title-link').once('sidebar-link-click', function() {
        var facetLinkIgnoreFocus = false;
        $(this).mousedown(function(e) {
          if ($(this).next('.block-facetapi').hasClass('facet-block-active')) {
            Drupal.nmaCsCloseFacetBlocks();
          } else {
            Drupal.nmaCsOpenFacetBlock($(this));
          }
          facetLinkIgnoreFocus = true;
        });
        $(this).focus(function(e) {
          if (!facetLinkIgnoreFocus) {
            Drupal.nmaCsCloseFacetBlocks();
          }
          facetLinkIgnoreFocus = false;
        });
      });

      // Sidebar facet links.
      $('#block-nma-cs-filter-bar a.facetapi-inactive', context).once('nmacs-sidebar-facet').click(function(e) {
        // Collapse on mibile only.
        if ($(window).width() <= MOBILE_WIDTH) {
          Drupal.nmaCsCollapseSideBar();
        }
      });

      /**
       * Show the map view of the objects in the main result set.
       *
       * @param string viewMode
       *   The view mode being switched to.
       */
      Drupal.nmaCsSwitchResultsView = function(viewMode) {
        var viewModeClass = viewMode + '-icon';
        var objectDisplayClass = viewMode + '-display';

        // Clear selection.
        $('ul.display-mode a').removeClass('active').attr('aria-selected', 'false');
        $('.object-section').removeClass(function(index, className) {
          // Match any classes with the -display suffix and concatenate them
          // into a space separated class string to remove.
          return (className.match(/(^|\s)\S+-display/g) || []).join(' ');
        });

        // Set new selection.
        $('ul.display-mode .' + viewModeClass).addClass('active').attr('aria-selected', 'true');
        $('.object-section').addClass(objectDisplayClass);

        // Quick hack to make views persistent when changing sort orders.
        // @todo remove this in the future and add full support for object/view
        // in the URL.
        var action = $('#nma-solr-sort-form').attr('action');
        action = Drupal.nmacsUpdateQueryString('view', viewMode, action);
        $('#nma-solr-sort-form').attr('action', action);
        // trigger lazy load event
        $("#page-skip-position").trigger("scroll");
        Drupal.nmaCsResultsDisplayMode = viewMode;
        // Refresh map.
        if (viewMode == 'map') {
          google.maps.event.trigger(Drupal.settings.nma_geo.maps['map-canvas-main-listing-map'].gMap, 'resize');
        }
      }

      Drupal.nmaCsInitialiseResults = function() {
        // Adding and removing classes for the display of objects.
        $('.display-mode .grid-icon').bind('touchstart click', function(e){
          Drupal.linkNoRefresh = true;
          Drupal.nmaCsSwitchResultsView('grid');
          e.preventDefault();
        });
        $('.display-mode .table-icon').bind('touchstart click', function(e) {
          Drupal.linkNoRefresh = true;
          Drupal.nmaCsSwitchResultsView('table');
          e.preventDefault();
        });
        $('.display-mode .map-icon').bind('touchstart click', function(e) {
          Drupal.linkNoRefresh = true;
          Drupal.nmaCsSwitchResultsView('map');
          e.preventDefault();
        });

        //OBJECT LIST CLASSES
        //add class when the images are hovered/focused
        $('.objectlink').once("objectlink-hover").hover(function() {
          $(this).parent().addClass('active-object');
        },
        function() {
          $(this).parent().removeClass('active-object');
        });
        $('.objectlink').once("objectlink-focus").focus(function(){
          $(this).parent().addClass('active-object');
        }).blur(function(){
          $(this).parent().removeClass("active-object");
        });

        //add class when the content is hovered/focused
        $('.object-content').once("object-content-hover").hover(function() {
          $(this).parent().addClass('active-object');
        },
        function() {
          $(this).parent().removeClass('active-object');
        });
        $('.object-content a').once("object-content-focus").focus(function(){
          $(this).closest('.object').addClass('active-object');
          //console.log($(this).closest('.object'));
        }).blur(function(){
           $(this).closest('.object').removeClass("active-object");
        });

        // if we don't have any search results, we need to hide the sort and display buttons
        if ($('ul.object-view-grid').length) {
          $('.right-sort').show();
        } else {
          $('.right-sort').hide();
        }

        //Clicking the current filter buttons
        $(".filter-section .current-filter").once("filter-section-current-filter").bind('touchstart click', function(event) {
          event.preventDefault();
          if ($('#page').hasClass('filters-expanded')) {
            $('#page').removeClass('filters-expanded');
          }
          else {
            $('#page').addClass('filters-expanded');
          }
          Drupal.nmacsSetContentTop();
        });

        //Clicking the add filters buttons
        $(".filter-section .add-filter").once("filter-section-add-filter").bind('touchstart click', function(event) {
          event.preventDefault();
          Drupal.nmaCsExpandSideBar();
          //add class 'w-highlight' on .sidebars for 5 seconds
          $('.sidebars').addClass('w-highlight');
          setTimeout(function(){
            $('.sidebars').removeClass('w-highlight');
          }, 1000);
        });

        if (jQuery.isFunction($.fn.lazyload)) {
          $('img.lazy').show().lazyload({
            effect : "fadeIn",
            container: ".page-content-wrapper",
            threshold : 200,
            appear: function () {
              // need to remove lazy so it doesn't try to load them again
              // this was an issue on Chrome
              $(this).removeClass('lazy'); 
            }
          });
        }

      }
      Drupal.nmaCsInitialiseResults();

      // search validation
      // prompt user with an error message if they try to search with no search terms
      Drupal.nmacsInitialiseSearchValidation = function() {
        $('#search-block-form').once('search-block-submit-empty', function() {
          $(this).submit(function(event) {

            // if a facet block is open, disable click, close facet blocks and focus in search input
            if (facetMenuOpen) {
              Drupal.nmaCsCloseFacetBlocks();
              $('#edit-search-block-form--2').focus();
              return false;
            } else {
              if ($('#edit-search-block-form--2').val().trim() == '') {
                Drupal.nmaCsAddEmptySearchMessage();
                $('#edit-search-block-form--2').addClass('error');
                $('#edit-search-block-form--2').focus();
                return false;
              } else {
                Drupal.nmaCsRemoveEmptySearchMessage();
                $('#search-block-form-error').html('');
                $('#edit-search-block-form--2').removeClass('error');
              }
            }
          });
        });
      }
      Drupal.nmacsInitialiseSearchValidation();

      // Check if there is a view parameter in the url and switch to that view.
      var view = Drupal.nmacsGetParameterByName('view');
      if (view) {
        Drupal.nmaCsSwitchResultsView(view);
      }

      // handle key board presses
      var enter = 13;
      var space = 32;
      var escape = 27;
      $(document).bind('keydown', function (event) {

        // if escape is pressed, close the facet menu if it is open
        if (event.keyCode == escape && facetMenuOpen) {
          Drupal.nmaCsCloseFacetBlocks();
        } else if (event.keyCode == escape && Drupal.shareMenuOpen) {
          Drupal.nmacsObjectMenuClose();
          $('.menu-toggle').focus();
        }

        // handler for if sidebar isn't collapsed and facet menu isn't open
        // and we hit enter or space
        if ((event.keyCode == enter || event.keyCode == space) && !facetMenuOpen) {
          if ($(event.target).hasClass('menu-title-link')) { // if we are on a facet link
            event.preventDefault();
            Drupal.nmaCsOpenFacetBlock($(event.target));
          }
        }

        // simulate the enter key when using the space key for links
        if (event.keyCode == space) {
          if (!$(event.target).hasClass('menu-title-link')) {  // ignore facet links
            if ($(event.target).attr('href') != undefined) { // make sure it is a link
              Drupal.linkNoRefresh = false; // reset
              event.preventDefault(); // stop the standard scrolling behavour of the space key
              $(event.target).trigger('click'); // simulate a click to allow ajax to do its thing and set linkNoRefresh if needed
              if (Drupal.linkNoRefresh == false) { // if it isn't an ajax link, treat link a normal link and go to the url
                window.location = $(event.target).attr('href');
              }

            }
          }
        }

        // means we are on an object page and what to close it
        if (event.keyCode == escape && $('a.close-link').length) {
          $('a.close-link').trigger('click');
        }

      });

      // initialise any javascript associated with the object page
      Drupal.nmacsInitialiseObject = function() {
        // add event handlers for the ... menu link on object page
        $('.menu-toggle')
          .once('menu-toggle')
          .mouseover(function(){ 
            Drupal.nmacsShareMenuOpen();
          })
          .bind('touchstart click', function(e){ 
            e.preventDefault();
            Drupal.linkNoRefresh = true;
            Drupal.nmacsObjectMenuToggle();
          })
          .mouseout(function(){ 
            Drupal.nmacsObjectMenuClose();
          });
        $('.share-menu .menu')
          .once('share-menu')
          .mouseover(function(){ 
            Drupal.nmacsShareMenuOpen();
          })
          .mouseout(function(){ 
            Drupal.nmacsObjectMenuClose();
          });
        $('.share-menu .menu a').once('share-menu-menu-a').focus(function(){ 
          Drupal.nmacsShareMenuOpen();
        });
        $('.close, .back, .page-content, .object-page-main').once('close-back-page-content').focus(function() {
          Drupal.nmacsObjectMenuClose();
        });

        // when the pdf link is clicked, we need to append the current slide id to the link
        if ($('.pdf-link').length) {
          $('.pdf-link').once('pdf-link').bind('touchstart click', function(e) {
            e.preventDefault();
            var pdfLink = $(this).attr('href');
            pdfLink += '?image=' + $('#slider li.flex-active-slide img').attr('id');
            window.location = pdfLink;
          });
        }

      }
      Drupal.nmacsInitialiseObject();


      Drupal.shareMenuOpen = false;
      Drupal.nmacsShareMenuOpen = function() {
        if (!$('.share-menu').hasClass('menu-active')) {
          $('.share-menu').addClass('menu-active'); 
        }
        Drupal.shareMenuOpen = true;
      }
      Drupal.nmacsObjectMenuClose = function() {
        if ($('.share-menu').hasClass('menu-active')) {
          $('.share-menu').removeClass('menu-active'); 
        }
        Drupal.shareMenuOpen = false;
      }

      Drupal.nmacsObjectMenuToggle = function() {
        if (Drupal.shareMenuOpen) {
          Drupal.nmacsObjectMenuClose();
        } else {
          Drupal.nmacsShareMenuOpen();
        }
      }

      // if we are on the features page we want to make the more button throb when clicked
      $('#listing-more-link').once('listing-more-link').bind('touchstart click', function(event) {
        $(this).addClass('loading');
      });

      Drupal.nmacsSetFilterCount = function() {
        var filterLength = $('.filters .item-list ul li').length;
        if (filterLength) {
          $('.filter-button span').html(filterLength);
          $('.mobile-filter span').html(filterLength);
        } else {
          $('.mobile-filter span').html(0);
          $('#page').removeClass('filters-expanded');
        }
      }
      Drupal.nmacsSetFilterCount();

      /**
       * Set the css top of the content area based on the header.
       */
      Drupal.nmacsSetContentTop = function() {

        if ($('body').hasClass('page-ce')) {

          var HEADER_HEIGHT = 50;
          var DESKTOP_ADJUSTMENT = 10;
          var FILTER_OVERLAP = 2;

          var top = HEADER_HEIGHT;
          var contentTop = 0;
          var contentTransform = 0;
          var regionContentTop = 0;
          var regionContentTransform = 0;
          var filterTop = 0;
          var filterTransform = 0;

          // If an object is being viewed.
          if ($("#content").hasClass('object-active') || $(window).width() <= MOBILE_WIDTH) {

            // Set top for mobile filter area.
            if ($('#page').hasClass('mobile-filter-active')) {
              top = $('.explore-header').height() + HEADER_HEIGHT;
              // If the filters are exposed, add them to height.
              if ($('#page').hasClass('filters-expanded')) {
                top += $('.filters').outerHeight();
              }
            } else {
              top = HEADER_HEIGHT;
              regionContentTop = '-' + $('.region-content-top').height();
            }

            // Set top for exposed filters.
            if (!$('#page').hasClass('mobile-filter-active')) {
              filterTop = - $('.filters').height();
            } else if ($('#page').hasClass('filters-expanded')) {
              filterTop = $('.explore-header').height();
            } else {
              filterTop = - $('.filters').height();
            }

          } else {
            top = HEADER_HEIGHT;
            filterTop = 0;
          }

          // Desktop (non IE)
          if ($(window).width() > MOBILE_WIDTH || $('html').hasClass('ie9') || $('html').hasClass('lt-ie9')) {
            regionContentTransform = 0;
            filterTransform = 0;
          }
          // Mobile.
          else {
            regionContentTransform = regionContentTop;
            regionContentTop = 0;
            filterTransform = filterTop;
            filterTop = 0;
          }

          // Set css.
          var filterHeight = $('.filters').height();
          if (filterTop != 0 || filterTransform != 0) {
            $('.filters').css({
              'top': filterTop + 'px',
              'transform': 'translate3d(0px, ' + filterTransform + 'px ,0px)',
              '-ms-transform': 'translate3d(0px, ' + filterTransform + 'px ,0px)',
              '-webkit-transform': 'translate3d(0px, ' + filterTransform + 'px ,0px)',
              '-moz-transform': 'translate3d(0px, ' + filterTransform + 'px ,0px)'
            });
          } else {
            $('.filters').css({
              'top': '',
              'transform': '',
              '-ms-transform': '',
              '-webkit-transform': '',
              '-moz-transform': ''
            });
          }

          // We need to wait for the previous CSS animations to have taken
          // effect before we can get an accurate height.
          var getHeightTimeout = 0;
          if (filterTransform != filterHeight) {
            getHeightTimeout = 200;
          }
          setTimeout(function() {
            // Desktop (non IE)
            if ($(window).width() > MOBILE_WIDTH || $('html').hasClass('ie9') || $('html').hasClass('lt-ie9')) {
              contentTop = $('.explore-header').height();
              contentTransform = 0;
              contentBottom = 0;
            }
            // Mobile.
            else {
              contentTransform = top;
              contentTop = 0;
              if (!$('html').hasClass('ie9') || $('html').hasClass('lt-ie9')) {
                contentBottom = top;
              }
            }
            
            $('.page-content-wrapper').css({
              'top': contentTop + 'px',
              'transform': 'translate3d(0px, ' + contentTransform + 'px ,0px)',
              '-ms-transform': 'translate3d(0px, ' + contentTransform + 'px ,0px)',
              '-webkit-transform': 'translate3d(0px, ' + contentTransform + 'px ,0px)',
              '-moz-transform': 'translate3d(0px, ' + contentTransform + 'px ,0px)',
              'bottom': contentBottom + 'px'
            });
          }, getHeightTimeout);
        }
      }

      Drupal.nmacsSetTabsAvailable = function () {
        if ($(window).width() > MOBILE_WIDTH) {
          $('#page-skip-position').attr('tabindex', '-1');
          $('#section-list').attr('tabindex', '-1');
          $('.page-content-wrapper').attr('tabindex', '-1');
        } else {
          $('#page-skip-position').attr('tabindex', '0');
          $('#section-list').attr('tabindex', '0');
          $('.page-content-wrapper').attr('tabindex', '0');
        }
      }

      $(window).on('resize', function(){
        Drupal.nmacsSetContentTop();
        Drupal.nmacsSetTabsAvailable();
      });

      // Initialise on first load.
      $('body').once('nmacs-content-top-init', function() {
        Drupal.nmacsSetContentTop();
        Drupal.nmacsSetTabsAvailable();
      });
    }
  }

  Drupal.behaviors.CSComments = {
    attach: function (context, settings) {
      // Due to ajax comments we need this to run everything ajax happens to
      // show or hide the title.
      if ($('#comments').has('div.comment').length) {
        $('#comments h2.title:not(.comment-form)').show();
      }
      else {
        $('#comments h2.title:not(.comment-form)').hide();
      }
    }
  }

  Drupal.behaviors.CSWebformLinks = {
    attach: function (context, settings) {
      $('li.webform-link a').each(function() {
        Drupal.nmacsSetLinkDestination($(this));
      });
    }
  }

  /**
   * Set the destination param for alink based on the current page url.
   *
   * When drupal submits a form if the destination param is set that's where
   * the user will be redirected to.
   */
  Drupal.nmacsSetLinkDestination = function($link) {
    var href = $link.attr('href'),
      pathname = (window.location.pathname == '/') ? '' : window.location.pathname;

    href = Drupal.nmacsUpdateQueryString('destination', encodeURIComponent(pathname + window.location.search), href);
    $link.attr('href', href);
  }

  /**
   * Get a parameter from the url
   */
  Drupal.nmacsGetParameterByName = function(name, fromUrl) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^#&]*)", 'g'),
    results, lastMatch, url = fromUrl || location.href;
    while (results = regex.exec(url)) {
      lastMatch = results;
    }
    return lastMatch == null ? "" : decodeURIComponent(lastMatch[1].replace(/\+/g, " "));
  }

  /**
   * Remove or update a query param in a url/query string.
   *
   * @param string key
   *   The param name.
   * @param string value
   *   The value you want the param to be set to. If excluded or null the
   *   param will be removed.
   * @param string url
   *   The url/query string to operate on.
   *
   * @return string
   *   Returns the url string with the param updated/remomved.
   */
  Drupal.nmacsUpdateQueryString = function(key, value, url) {
    if (!url) url = '';
    var re = new RegExp("([?&])" + key + "=.*?(&|$)(.*)", "gi");

    if (re.test(url)) {
      if (typeof value !== 'undefined' && value !== null) {
        return url.replace(re, '$1' + key + "=" + value + '$2$3');
      }
      else {
        var hash = url.split('#');
        url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
        if (typeof hash[1] !== 'undefined' && hash[1] !== null)  {
          url += '#' + hash[1];
        }
        return url;
      }
    }
    else {
      if (typeof value !== 'undefined' && value !== null) {
        var separator = url.indexOf('?') !== -1 ? '&' : '?',
          hash = new Array(url);//url.split('#');
        url = hash[0] + separator + key + '=' + value;
        if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
          url += '#' + hash[1];
        }
        return url;
      }
      else {
        return url;
      }
    }
  }

  Drupal.nmacsReadmoreToggle = function(pWrapper) {
    var readmoreLink = '<a href="#" class="readmore-link">' + 'Read more' + '</a>',
        readlessLink = '<a href="#" class="readless-link">' + 'Read less' + '</a>',
        dot = '<span class="read-more-ellipsis">' + '...' + '</span>';  

    pWrapper.once('readmore-text', function() {
      $(this).each(function() {
        var pTag = $(this).children();

        if (pTag.length === 1 && pTag.text().length > 350) {
          // single p tag
          var cutOffText = '<span class="cut-off-text">' + pTag.text().substr(350, pTag.text().length) + '</span>',
              trimmedText = '<span>' + pTag.text().substr(0,350) + '</span>',
              output = trimmedText + dot + readmoreLink + cutOffText + readlessLink;

          pTag.html(output);
        } else if (pTag.length > 1 && pTag.first().text().length > 350) {
          var cutOffText = '<span class="cut-off-text">' + pTag.first().text().substr(350, pTag.first().text().length) + '</span>',
              trimmedText = '<span>' + pTag.first().text().substr(0,350) + '</span>',
              output = trimmedText + cutOffText;

          pTag.addClass('hide-all-p cut-off-text').parent().addClass('multiple-p-div');
          pTag.first().html(output);
          pTag.first().addClass('visible-content').append(dot + readmoreLink);
          pTag.last().append(readlessLink);
        } else if (pTag.length > 1 && pTag.first().text().length < 350) {
          // multiple p tags     
          pTag.addClass('hide-all-p cut-off-text').parent().addClass('multiple-p-div');
          pTag.first().addClass('visible-content').append(dot + readmoreLink);
          pTag.last().append(readlessLink);          
        }        
        // *if shorter than 350 do nothing
      });
    });
   
    handleReadmoreClickEvent($('a.readmore-link'), pWrapper);  
    handleReadlessClickEvent($('a.readless-link'), pWrapper);
  
    function handleReadmoreClickEvent(btn, pWrapper) {
      btn.once('toggle-button', function() {
        $(this).bind('touchstart click', function(event) {
          if (!$(this).closest(pWrapper).hasClass('multiple-p-div')) {
            $(this).addClass('hide-elements').prev().addClass('hide-elements');
            $(this).nextAll().removeClass('hide-elements').addClass('show-elements');
            nmacsReadmoreAccessibilitySingleP($(this));
          }
          else {
            //for multiple p tags div where 1st p is longer than 350
            $(this).prevAll('span.cut-off-text').addClass('show-elements');
            //multiple p tags with a 1st p less than 350
            $(this).addClass('hide-elements').prev().addClass('hide-elements').closest('div.multiple-p-div').children().addClass('all-p-visible').last().find('a.readless-link').addClass('show-elements');
            nmacsReadmoreAccessibilityMultipleP($(this));
          }
          return false;
        });
      });
    }  
    function handleReadlessClickEvent(btn, pWrapper) {
      btn.once('toggle-button', function() {
        $(this).bind('touchstart click', function(event) {
          if (!$(this).closest(pWrapper).hasClass('multiple-p-div')) {
            $(this).addClass('hide-elements').prev().addClass('hide-elements').prevAll().removeClass('hide-elements').addClass('show-elements');
          }
          else {
            $(this).closest('div.multiple-p-div').children().find('span.cut-off-text').removeClass('show-elements');
            $(this).closest('div.multiple-p-div').children().removeClass('all-p-visible').find('.hide-elements').removeClass('hide-elements');
          }
          return false;
        }); 
      });
    }
     
    function nmacsReadmoreAccessibilityMultipleP(btn) {
      //set focus on the second paragraph after the button
      btn.parent().next().attr('tabindex', '0').focus();
    }
    function nmacsReadmoreAccessibilitySingleP(btn) {
      //set focus on the paragraph after the button 
      btn.next().attr('tabindex', '0').focus();
    }
    
    if ($('body').hasClass('page-object')) {
      //Get the pages url, remove uneeded elements
      prevPageUrl = document.referrer;
      httpRemove = prevPageUrl.replace('http://', '');
      pageName = httpRemove.split('.')[0];
      //Array of values which are allowed
      var siteNames = ["collectionsearch", "cs-test", "collectionsearch-test"];
      var allowedUrl = siteNames.indexOf(pageName);
      if (allowedUrl > -1) {
        return false;
      } else {
        $("body").addClass('external-url');
      }
    }

    $(document).ready(function() {
      $(window).load(function(){
        $(".page-content-wrapper").trigger("scroll");
      });
    });

  }
})(jQuery, Drupal, this, this.document);

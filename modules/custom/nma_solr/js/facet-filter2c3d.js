(function($){

/**
 * Adds facet filtering to facet blocks.
 */
Drupal.behaviors.nmaSolrFacetFilter = {
  attach: function(context, settings) {
    
    Drupal.nmaCsFacetFilterSetup = function(firstTime) {
      var showCount = 100;

      if (typeof(firstTime) === 'undefined') firstTime = true;

      $('div.block-facetapi .item-list', context).each(function() {
        // Initially only show some facets.
        var $itemList = $(this);
        var offset =100;
        //$('ul > li', $itemList).slice(20).hide();
        $('h3.slider-trigger').click(function(){
          $('.slider').slideToggle();
        });

        if (firstTime) {
          /*
          var $textbox = $('<input type="text" class="facet-filter" placeholder="Search filters" />').keyup(function(e) {
            var value = $(this).val();
            if (!value) {
              $(this).next('.item-list').find('ul > li').slice(showCount).hide();
              $(this).next('.item-list').find('ul > li').slice(0, showCount).show();
              $moreButton.show();
            }
            else {
              $(this).next('.item-list').find('ul > li').each(function() {
                // Case insensitive matching.
                if ($('span.facet-content', $(this)).text().toLowerCase().indexOf(value.toLowerCase()) != -1) {
                  $(this).show();
                }
                else {
                  $(this).hide();
                }
              });
              $moreButton.hide();
            }
          });
*/
          /*var $textbox = $('<input type="text" class="facet-filter" placeholder="Search filters" />').blur(function(e) {
            var value = $(this).val();
            var block_id = $(this).closest('.block-facetapi').attr('id');
            if (block_id) {
              Drupal.nmacsGetFacets(block_id, showCount, offset);
            }
          });
          $itemList.before($textbox);*/

          // add more button
          var $moreButton = $('<a class="facet-more-link" href="#">More</a>').click(function(e) {

            e.preventDefault();
            /*
            Drupal.linkNoRefresh = true;
            var visible = $moreButton.siblings('.item-list').find('ul > li:visible').length;
            var $list = $moreButton.siblings('.item-list').find('ul > li');
            var cutoff = visible + showCount; 
            $list.slice(cutoff).hide();
            $list.slice(0, cutoff).show();
            // focus on first item in new content.
            $list.slice(cutoff - showCount, cutoff - showCount).find('a').focus();
            if (cutoff >= $list.length) {
              $(this).hide();
            }
*/

            var block_id = $(this).closest('.block-facetapi').attr('id');
            if (block_id) {

              $moreButton.addClass('loading');
              Drupal.nmacsGetFacets(block_id, showCount, offset, '', function(show_more){
                // If we don't have enough items for more, hide it.
                if (!show_more) {
                  $moreButton.hide();
                }

                // stop throbber
                $moreButton.removeClass('loading');

                // focus on the new part of the list
                var $item = $('.item-list li a', $('#'+block_id)).get(offset);
                if ($item!=undefined) {
                  // only focus if menu is open
                  if ($('#content').hasClass('active-menu')) {
                    $item.focus();
                  }
                }

                offset+= showCount;

              });

            }
          });
          // If we don't have enough items for more, hide it.
          if ($itemList.find('li').length < showCount) {
            $moreButton.hide();
          }
          $itemList.after($moreButton);
        }
      });
    }

    Drupal.nmacsGetFacets = function(block_id, limit, offset, search, successCallback) {
      if (typeof(search) === 'undefined') {
        search = '';
      }
      if (typeof(offset) === 'undefined') {
        offset = $('#' + block_id + '.item-list ul li').length;
      }

      if (typeof(successCallback) === 'undefined') {
        successCallback = function() {};
      }

      var address = window.location.protocol + '//' + window.location.hostname + '/facet';
      if ($('#edit-search-block-form--2').val()!='') {
        address += '/' + $('#edit-search-block-form--2').val();
      }
      var hash = History.getState().hash;//.replace(/http:\/\/.*?\//i,'/');
      if (hash.indexOf('?')!=-1) {
        hash = Drupal.nmacsUpdateQueryString('_suid', null, hash);
        address += hash.substr(hash.indexOf('?'));
      }
      // Remove the block-facetapi- from the start.
      block_id = block_id.substr(15);
      $.ajax({
        url: address,
        dataType: 'json',
        data: {
          block_id: block_id,
          facet_limit: limit,
          facet_offset: offset,
          facet_prefix: search
        },
        success: function(data, textStatus, jqXHR) {
          if (typeof(data.error) !== 'undefined' && data.error) {
          }
          else {
            var $block = $('#block-facetapi-' + block_id);
            if (typeof(data.markup) !== 'undefined' && data.markup) {
              // @todo: Markup may contain an empty message instead of lis so we need to account for that.

              // If we have no search word then we are adding more.
              // Otherwise we are replacing with what matches the new search.
              if (search) {
                $('.item-list', $block).replaceWith($(data.markup));
              }
              else {
                $('.item-list ul li.last', $block).removeClass('last');
                $('.item-list ul', $block).append($(data.markup).find('ul li'));
              }
              Drupal.nmaCsInitialiseLinks(context, settings);
            }
            else {
              // No results.
              $('.item-list ul li', $block).remove();
            }
          }
          successCallback(data.show_more);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Don't throw the error if the ajax was aborted.
          if (textStatus != 'abort') {
            //alert("There was an error loading the results.");
          }
        },
        complete: function (jqXHR, textStatus) {
        }
      });
    }

    Drupal.nmaCsFacetFilterSetup();
  }  
}
})(jQuery);

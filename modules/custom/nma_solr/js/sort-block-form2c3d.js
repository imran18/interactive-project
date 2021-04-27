(function($){

/**
 * Extra helper for autosubmit form.
 */
Drupal.behaviors.nmaSolrAutosubmit = {
  attach: function(context) {
    $("#nma-solr-sort-form .form-actions").hide();

    // Add a sort order switcher after the dropdown.
    var selectedSort = $('#edit-solrsort option:selected').val();
    // We don't want to reorder on relevance or random.
    if (selectedSort != '' && selectedSort.substring(0, 6) != 'random') {
      $orderer = $('<a class="order-switcher" href="#" title="Reverse sort order"><div class="sort-order">Reverse sort order</div></a>');
    }
    else {
      $orderer = $('<div class="sort-order"></div>');
    }
    $orderer.click(function() {
      // Keep the same selection and resubmit to reverse the order.
      $('#nma-solr-sort-form .ctools-auto-submit-click').click();
      return false;
    });

    // click handler for clicking on the same item in the sort list to flip sort order
    var firstClick = true;
    $('#edit-solrsort').once('solrsort-nma').mouseup(function(e) {
      e.stopPropagation();
      if (firstClick) {
        firstClick = false;
      } else {
        firstClick = true;
        $('#nma-solr-sort-form .ctools-auto-submit-click').click();
      }
    }).blur(function(e) {
      firstClick = true;
    }).on("keyup", function(e) {
      if (e.keyCode == 13) {
        $('#nma-solr-sort-form .ctools-auto-submit-click').click();
      }
    }).after($orderer);

    // need this for ff because it doesn't lose focus on the first click outside the 
    // select but only on the second click
    $(document).mouseup(function() {
      firstClick = true;
    });
  }
}
})(jQuery);

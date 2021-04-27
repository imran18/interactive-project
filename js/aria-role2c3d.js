/**
* Insert WAI-ARIA Landmark Roles (Roles for Accessible Rich Internet Applications)
*
* http://www.w3.org/TR/2006/WD-aria-role-20060926/
*
* Due to validation errors with WAI-ARIA roles we use JavaScript to
* insert the roles. This is a stop-gap measure while the W3C sort
* out the validator.
*
* To unset comment out aria-roles.js in .info file
*/
(function ($, Drupal, window, document, undefined) {
  Drupal.behaviors.aria = {
    attach: function (context, settings) {
      
      Drupal.setAriaRoles = function() {
        
        // facet blocks
        $('#block-nma-cs-filter-bar .block-facetapi').attr('role', 'tabpanel');
        $('#block-nma-cs-filter-bar ul.facet-menu').attr('role', 'tablist');
        $('#block-nma-cs-filter-bar a.menu-title-link').attr('role', 'tab').attr('aria-selected', 'false');
        $('#block-nma-cs-filter-bar a.menu-title-link').each(function() {
          $(this).attr('aria-controls', $(this).next('div.block-facetapi').attr('id'));
        });
        $('#block-nma-cs-filter-bar a.facetapi-inactive, #block-nma-cs-filter-bar a.facet-more-link').attr('tabindex', '-1');
        

        // facet links in sidebar
        $('.sidebars .item-list .facetapi-inactive')
          .attr('role', 'button')
          .attr('aria-pressed', 'false')
          .attr('aria-controls', 'section-list');

        // facet links in explore bar
        $('.current-search-item a')
          .attr('role', 'button')
          .attr('aria-pressed', 'true')
          .attr('aria-controls', 'section-list');
        
        // change listing view icons
        $('.display-mode').attr('role', 'tablist');
        $('.display-mode a').attr('role', 'tab');
        $('.display-mode a.list-icon').attr('aria-selected', 'false').attr('aria-controls', 'listing-table-wrapper');
        $('.display-mode a.thumbnail-icon').attr('aria-selected', 'true').attr('aria-controls', 'listing-grid-wrapper');
        $('#listing-grid-wrapper').attr('role', 'tabpanel');
        $('#listing-table-wrapper').attr('role', 'tabpanel');

      }
      Drupal.setAriaRoles();

    }
  }
})(jQuery, Drupal, this, this.document);

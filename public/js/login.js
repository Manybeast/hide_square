(function ($) {
  $(document).ready(function () {
    $('._registration').on('click', (e) => {
      e.preventDefault();
      $('#registration').modal();
    })
  });
})(jQuery);

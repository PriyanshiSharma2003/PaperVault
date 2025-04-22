$(document).ready(function () {
  const $alert = $('.alert-success');
  if ($alert.length > 0) {
    setTimeout(() => {
      $alert.fadeOut(500, () => {
        $alert.remove();
      });
    },500); 
  }
});

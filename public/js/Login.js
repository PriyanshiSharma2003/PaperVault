$(document).ready(function () {
  // Password toggle functionality
  $('#togglePassword').on('click', function () {
    const passwordInput = $('#password');
    const type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
    passwordInput.attr('type', type);
    $(this).toggleClass('fa-eye fa-eye-slash');
  });

});
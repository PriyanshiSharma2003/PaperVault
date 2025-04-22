$(document).ready(function () {
  $('#resetPasswordForm').on('submit', function (e) {

    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (newPassword !== confirmPassword) {
      $('#flash-message')
        .removeClass('d-none alert-success')
        .addClass('alert-danger')
        .text('Passwords do not match!')
        .fadeIn();
    } else {
      $('#flash-message')
        .removeClass('d-none alert-danger')
        .addClass('alert-success')
        .text('Password reset successfully!')
        .fadeIn();
    }

    setTimeout(() => {
      $('#flash-message').fadeOut();
    }, 3000);
  });

  $('#togglePassword').on('click', function () {
    const passwordInput = $('#password');
    const type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
    passwordInput.attr('type', type);

    $(this).toggleClass('fa-eye fa-eye-slash');
  });

  $('#newtogglePassword').on('click', function () {
    const passwordInput = $('#newpassword');
    const type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
    passwordInput.attr('type', type);

    $(this).toggleClass('fa-eye fa-eye-slash');
  });
});
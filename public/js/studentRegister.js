$(document).ready(function () {
  $('#studentRegisterForm').on('submit', function (e) {
    

    $('#flash-message')
      .removeClass('d-none alert-danger')
      .addClass('alert-success')
      .text('Student registered successfully!')
      .fadeIn();

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
});

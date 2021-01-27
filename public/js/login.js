(function ($) {
  async function login(e) {
    const form = $(e.target).closest('._form');
    const login = $('#login');
    const password = $('#password');
    const user = {
      login: login.val(),
      password: password.val()
    };
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if(response.ok) {
      window.location = '/';
    } else {
      password.val('');
      form.find('._loginError').html(`Wrong ${result.errorInput} entered`).removeClass('invisible');
    }
  }

  async function registration(e) {
    const form = $(e.target).closest('._form');
    const password = $('#regPassword');
    const confirm = $('#regConfirm');
    const user = {
      username: $('#regName').val(),
      login: $('#regLogin').val(),
      password: password.val(),
      confirm: confirm.val()
    };
    let registration = await fetch('/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(user)
    });
    let result = await registration.json();

    $('._regError').addClass('invisible');
    form.find('input').removeClass('is-invalid');

    if(registration.ok) {
      window.location = '/';
    } else {
      password.val('');
      confirm.val('');
      $.each(result, (key, val) => {
        form.find(`._${key}`).html(val).removeClass('invisible');
        form.find(`._${key}`).prev().addClass('is-invalid');
      });
    }
  }

  $(document).ready(function () {
    $('._login').on('click', login);
    $('._registration').on('click', registration);
    $('._openRegistrationModal').on('click', (e) => {
      e.preventDefault();
      $('#registration').modal();
    })
  });
})(jQuery);

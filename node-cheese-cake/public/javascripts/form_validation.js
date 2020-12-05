$(document).ready(function () {
  var name = $("#name");
  var nameOk = $("#name-ok");
  var nameMessage = $("#name-message");
  var nameFlag = false;

  var email = $("#email");
  var emailOk = $("#email-ok");
  var emailMessage = $("#email-message");
  var emailFlag = false;

  var password = $("#password");
  var passwordMessage = $('#password-message');
  var passwordErrorMessage = "Password should include alphabets, numbers and special characters";
  var passwordFlag = false;

  var signUpSubmit = $("#signUpSubmit");
  var submitMessage = $("#submit-message");

  var number = /([0-9])/;
  var alphabets = /([a-zA-Z])/;
  var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;

  nameOk.hide();
  emailOk.hide();

  name.blur(function () {
    if (name.val().length > 3) {
      nameMessage.hide();
      nameOk.show();
      nameFlag = true;
    } else {
      nameOk.hide();
      nameMessage.show().addClass('error').html("Name should be of length 3 or more.");
      nameFlag = false;
    }
  });
  
  email.blur(function () {
    if (email.val().length == 0) {

      emailOk.hide();
      emailMessage.show()
          .removeClass()
          .addClass('text-danger')
          .html("Email cannot be empty!");
      emailFlag = false;
    }

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.val())) {

      var emailValue = email.val();
      $.ajax({
        type: 'POST',
        url: '/user/verification',
        data: {email: emailValue, _csrf : $("#_csrf").val()},

        success: function (data) {
          if (data == false) {
            emailMessage.hide();
            emailOk.show();
            emailFlag = true;
          } else {
            emailFlag = false;
            emailOk.hide();
            emailMessage.show()
                .removeClass()
                .addClass('text-danger')
                .html("Email already in use!");
          }
        },
        error: function (error) {
          console.log('Error: ' + error);
        }
      });

      emailOk.show();
      emailMessage.hide().removeClass();
    }

  });


  password.blur(function () {

    if (password.val().length === 0) {

      passwordMessage.show()
          .removeClass()
          .addClass('text-danger')
          .html("Password cannot be empty!");
      passwordFlag = false
    } else if (password.val().length < 6) {

      passwordMessage.removeClass()
          .addClass('text-danger')
          .html("Password must be at-least of length 6.");
      passwordFlag = false;
    } else if (password.val().match(number) && password.val().match(alphabets) && password.val().match(special_characters)) {

      // passwordOk.show();
      passwordMessage.removeClass().addClass('text-success').html("Strong");
      passwordFlag = true;
    } else {

      passwordMessage.removeClass()
          .addClass('text-warning')
          .html(passwordErrorMessage);
      passwordFlag = false;
    }
  });

  signUpSubmit.click(function () {
    if (nameFlag && emailFlag && passwordFlag) {
      return true;
    } else {
      submitMessage.show()
          .removeClass()
          .addClass('error')
          .html("Please check the credentials and their requirement.");
      return false;
    }
  });
});


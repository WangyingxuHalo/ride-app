// Default running function when opening website
window.onload = mainFunc();

function mainFunc() {
    var userAdd = document.getElementById("username");
    var emailAdd = document.getElementById("email");
    var password = document.getElementById("inputPassword");
    userAdd.onkeyup = function () {
        detectUser();
    }
    emailAdd.onkeyup = function () {
        detectEmail();
    }
    password.onkeyup = function () {
        detectPwd();
    }
}

function detectUser() {
    var inputUser = document.getElementById('username');
    var user = document.getElementById('nameformat');
    // email
    var regex = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;
    if (regex.test(inputUser.value)) {
        user.innerText = "";
    } else {
        user.innerText = "format not correct";
    }
}

function detectEmail() {
    var inputemail = document.getElementById('email');
    var email = document.getElementById('emailformat');
    // email
    var regex = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
    if (regex.test(inputemail.value)) {
        email.innerText = "";
    } else {
        email.innerText = "format not correct";
    }
}

function detectPwd() {
    var inputpwd = document.getElementById('inputPassword');
    var pwd = document.getElementById('pwdformat');
    // password at least number and english character, length 6 - 20
    var regex = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
    if (regex.test(inputpwd.value)) {
        pwd.innerText = "";
    } else {
        pwd.innerText = "Password requires length 6-20, character and number";
    }
}

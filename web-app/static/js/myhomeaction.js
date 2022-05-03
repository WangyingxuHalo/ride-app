// Default running function when opening website
window.onload = mainFunc();

function mainFunc() {
    var emailAdd = document.getElementById("username");
    var password = document.getElementById("inputPassword");
    emailAdd.onkeyup = function () {
        detectEmail('userformat');
    }
    password.onkeyup = function () {
        detectPwd('pwdformat');
    }
}

function detectEmail(emailadd) {
    var inputemail = document.getElementById('username');
    var email = document.getElementById('userformat');
    // email
    var regex = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;
    if (regex.test(inputemail.value)) {
        email.innerText = "";
        enablebtn();
    } else {
        email.innerText = "format not correct";
        disablebtn();
    }
}

function detectPwd(password) {
    var inputpwd = document.getElementById('inputPassword');
    var pwd = document.getElementById('pwdformat');
    // password at least number and english character, length 6 - 20
    var regex = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
    if (regex.test(inputpwd.value)) {
        pwd.innerText = "";
        enablebtn();
    } else {
        pwd.innerText = "format not correct";
        disablebtn();
    }
}

function enablebtn() {
    var btnObj = document.getElementById(btn);
    btnObj.disabled = false;
}

function disablebtn() {
    var btnObj = document.getElementById(btn);
    btnObj.disabled = true;
}
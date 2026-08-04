import { auth } from "./firebase.js";

import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const params = new URLSearchParams(window.location.search);

const mode = params.get("mode");
const oobCode = params.get("oobCode");

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const loading = document.getElementById("loading");
const content = document.getElementById("content");

function hideLoading() {
    loading.style.display = "none";
}

function success(message) {
    hideLoading();

    title.textContent = "Success";

    subtitle.innerHTML = message;

    content.innerHTML = `
        <a class="home" href="/">
            Return to Midnight Anime
        </a>
    `;
}

function error(message) {
    hideLoading();

    title.textContent = "Something went wrong";

    subtitle.innerHTML = message;

    content.innerHTML = `
        <a class="home" href="/">
            Back to Home
        </a>
    `;
}

switch(mode){

case "verifyEmail":
verifyEmail();
break;

case "resetPassword":
resetPassword();
break;

case "recoverEmail":
recoverEmail();
break;

case "verifyBeforeUpdateEmail":
verifyBeforeUpdateEmail();
break;

default:
error("Unknown authentication action.");

}

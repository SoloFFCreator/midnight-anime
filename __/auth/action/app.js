import { auth } from "./firebase.js";

import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const qs = new URLSearchParams(window.location.search);

const mode = qs.get("mode");
const oobCode = qs.get("oobCode");
const continueUrl = qs.get("continueUrl") || "/";
const lang = qs.get("lang") || "en";

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const content = document.getElementById("content");
const loading = document.getElementById("loading");

function stopLoading() {
    if (loading) loading.style.display = "none";
}

function setState(titleText, subtitleText) {
    title.textContent = titleText;
    subtitle.textContent = subtitleText;
}

function showButton(text, href = continueUrl) {
    content.innerHTML = `
        <a class="home" href="${href}">
            ${text}
        </a>
    `;
}

function showError(message) {
    stopLoading();

    setState(
        "Authentication Error",
        message
    );

    content.innerHTML = `
        <div class="error">${message}</div>

        <a class="home" href="/">
            Return Home
        </a>
    `;
}

async function verifyEmail() {

    try {

        await applyActionCode(auth, oobCode);

        stopLoading();

        setState(
            "Email Verified",
            "Your email address has been verified successfully."
        );

        showButton("Continue");

    } catch (e) {

        console.error(e);

        showError(
            "This verification link is invalid or has expired."
        );

    }

}

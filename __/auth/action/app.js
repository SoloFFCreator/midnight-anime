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
  async function recoverEmail() {

    try {

        const info = await checkActionCode(auth, oobCode);

        await applyActionCode(auth, oobCode);

        stopLoading();

        setState(
            "Email Restored",
            `Your email has been restored successfully.`
        );

        content.innerHTML = `
            <div class="success">
                Email recovery completed.
            </div>

            <a class="home" href="/">
                Continue
            </a>
        `;

    } catch (e) {

        console.error(e);

        showError(
            "This email recovery link is invalid or has expired."
        );

    }

}

async function verifyBeforeUpdateEmail() {

    try {

        await applyActionCode(auth, oobCode);

        stopLoading();

        setState(
            "Email Verified",
            "Your new email address has been verified successfully."
        );

        content.innerHTML = `
            <div class="success">
                Verification completed.
            </div>

            <a class="home" href="/">
                Continue
            </a>
        `;

    } catch (e) {

        console.error(e);

        showError(
            "Verification link has expired or is invalid."
        );

    }

}

switch (mode) {

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
        showError("Unknown authentication action.");
}

}

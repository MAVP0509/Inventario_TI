// scripts/controller_propuesta_login/propuesta_login_3.js

const { animate } = anime;

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      animate({
        targets: "#loginCard",
        translateY: [
          { value: -10, duration: 100 },
          { value: 0, duration: 400 }
        ],
        scale: [
          { value: 1.05, duration: 100 },
          { value: 1.0, duration: 400 }
        ],
        easing: "easeInOutQuad"
      });
    });
  }
});

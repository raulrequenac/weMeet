window.onload = function () {
  const button = document.getElementById("dropdownMenuButton")

  window.addEventListener('click', event => {
    if (button.contains(event.target)) {
      document.getElementById('drop').classList.toggle('show');
    } else {
      document.getElementById('drop').classList.remove('show');
    }
  })

  const passwordBtn = this.document.getElementById("toggle-password")
  passwordBtn.onclick = function () {
    const passwordInput = document.getElementById("password")
    let passwordType = passwordInput.type
    passwordInput.setAttribute('type', passwordType === "text" ? "password" : "text")
  }
}

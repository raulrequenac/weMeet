window.onload = function() {
  const button = document.getElementById("dropdownMenuButton")

  button.onclick = function() {
    document.getElementById('drop').classList.toggle('show');
  }

  const passwordBtn = this.document.getElementById("toggle-password")
  passwordBtn.onclick = function() {
    const passwordInput = document.getElementById("password")
    let passwordType = passwordInput.type 
    passwordInput.setAttribute('type', passwordType === "text" ? "password" : "text")
  }

  document.onclick = function() {
    document.getElementById('drop').classList.remove('show');
  }
}





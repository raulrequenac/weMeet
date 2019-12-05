window.onload = function() {
  const button = document.getElementById("dropdownMenuButton");

  button.onclick = function() {
    document.getElementById('drop').classList.toggle('show');
  }
}

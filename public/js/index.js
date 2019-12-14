window.onload = function () {
  const button = document.getElementById("dropdownMenuButton");
  if (button) {
    const drop = document.getElementById('drop');
  
    button.addEventListener('click', event => {
      drop.classList.toggle('show')
    })
    window.addEventListener('click', event => {
      drop.classList.remove('show');
    })
  }

  const passwordBtn = document.getElementById("toggle-password")
  if (passwordBtn) {
    passwordBtn.onclick = function () {
      const passwordInput = document.getElementById("password")
      const passwordType = passwordInput.type
      passwordInput.setAttribute('type', passwordType === "text" ? "password" : "text")
    }
  }


  // Activate Carousel
  $("#carouselExampleIndicators").carousel("pause");
    
  // // Enable Carousel Controls
  $("#prev").click(function(){
    $("#carouselExampleIndicators").carousel("prev");
  });
  $("#next").click(function(){
    $("#carouselExampleIndicators").carousel("next");
  });
}

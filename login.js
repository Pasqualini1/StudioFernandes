// Simula o cadastro fixo da manicure
const USER = "manicure";
const PASS = "1234";

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");

  if (user === USER && pass === PASS) {
    // Salva login no localStorage
    localStorage.setItem("logado", "sim");
    window.location.href = "agenda.html"; // redireciona para a próxima página
  } else {
    errorMsg.textContent = "Usuário ou senha incorretos.";
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js') // Caminho para o service-worker
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.log('Falha ao registrar o Service Worker:', error);
      });
  });
}



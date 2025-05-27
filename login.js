// Credenciais simuladas
const credenciais = {
  username: "manicure",
  password: "123456"
};

// Evento de envio do formulário
document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault(); // Impede envio padrão

  // Pega valores dos campos
  const usuarioDigitado = document.getElementById("username").value.trim();
  const senhaDigitada = document.getElementById("password").value.trim();

  // Verifica se coincidem
  if (
    usuarioDigitado === credenciais.username &&
    senhaDigitada === credenciais.password
  ) {
    // Login bem-sucedido, redireciona
    window.location.href = "https://studiofernandes.rf.gd/agenda.html";
 // Redirecione para a página da agenda
  } else {
    // Mostra mensagem de erro
    document.getElementById("error-msg").textContent = "Usuário ou senha inválidos!";
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado com sucesso!"))
    .catch(error => console.log("Erro ao registrar Service Worker:", error));
}
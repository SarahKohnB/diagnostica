const form = document.getElementById("loginForm");

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        const resposta = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })

        });

        const dados = await resposta.json();

        const mensagem =
            document.getElementById("mensagem");

        if (dados.sucesso) {

            localStorage.setItem(
                "usuario",
                JSON.stringify(dados.usuario)
            );

            window.location.href = "menu.html";

        } else {

            mensagem.innerText =
                dados.mensagem;

        }

    });

}
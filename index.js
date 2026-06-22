const express = require("express");
const path = require("path");

const app = express();

const rotas = require("./src/routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", rotas);

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
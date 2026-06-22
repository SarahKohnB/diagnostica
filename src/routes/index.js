const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../database/sqlite");

const router = express.Router();

router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    db.get(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro interno."
                });
            }

            if (!usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado."
                });
            }

            const senhaValida = bcrypt.compareSync(
                senha,
                usuario.senha
            );

            if (!senhaValida) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Senha incorreta."
                });
            }

            res.json({
                sucesso: true,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo
                }
            });

        }
    );

});
// LISTAR PRODUTOS

router.get("/produtos", (req, res) => {

    const busca = req.query.busca || "";

    db.all(
        `
        SELECT *
        FROM produtos
        WHERE nome LIKE ?
        ORDER BY nome ASC
        `,
        [`%${busca}%`],
        (err, produtos) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(produtos);
        }
    );

});


// CADASTRAR PRODUTO

router.post("/produtos", (req, res) => {

    const {
        nome,
        categoria,
        quantidade,
        estoque_minimo
    } = req.body;

    db.run(
        `
        INSERT INTO produtos
        (nome,categoria,quantidade,estoque_minimo)
        VALUES (?,?,?,?)
        `,
        [
            nome,
            categoria,
            quantidade,
            estoque_minimo
        ],
        function(err){

            if(err){

                return res.status(500).json(err);

            }

            res.json({
                sucesso:true,
                id:this.lastID
            });

        }
    );

});


// EXCLUIR PRODUTO

router.delete("/produtos/:id", (req,res)=>{

    const id = req.params.id;

    db.run(
        "DELETE FROM produtos WHERE id=?",
        [id],
        function(err){

            if(err){

                return res.status(500).json(err);

            }

            res.json({
                sucesso:true
            });

        }
    );

});
// LISTAR MOVIMENTAÇÕES

router.get("/movimentacoes", (req, res) => {

    db.all(`
        SELECT
            m.*,
            p.nome as produto
        FROM movimentacoes m
        INNER JOIN produtos p
        ON p.id = m.produto_id

        ORDER BY m.id DESC
    `,
    [],
    (err, dados) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(dados);

    });

});


// MOVIMENTAR ESTOQUE

router.post("/movimentar", (req, res) => {

    const {
        produto_id,
        tipo,
        quantidade,
        usuario
    } = req.body;

    db.get(
        "SELECT * FROM produtos WHERE id=?",
        [produto_id],
        (err, produto) => {

            if(err || !produto){

                return res.status(400).json({
                    sucesso:false
                });

            }

            let novaQuantidade =
                produto.quantidade;

            if(tipo === "entrada"){

                novaQuantidade +=
                    Number(quantidade);

            }

            if(tipo === "saida"){

                novaQuantidade -=
                    Number(quantidade);

                if(novaQuantidade < 0){

                    return res.json({
                        sucesso:false,
                        mensagem:
                        "Estoque insuficiente"
                    });

                }

            }

            db.run(
                `
                UPDATE produtos
                SET quantidade=?
                WHERE id=?
                `,
                [
                    novaQuantidade,
                    produto_id
                ]
            );

            db.run(
                `
                INSERT INTO movimentacoes
                (
                    produto_id,
                    tipo,
                    quantidade,
                    data_movimentacao,
                    usuario
                )
                VALUES
                (?,?,?,?,?)
                `,
                [
                    produto_id,
                    tipo,
                    quantidade,
                    new Date()
                        .toLocaleDateString("pt-BR"),
                    usuario
                ]
            );

            if(
                novaQuantidade <
                produto.estoque_minimo
            ){

                return res.json({

                    sucesso:true,

                    alerta:
                    "⚠ Estoque abaixo do mínimo!"

                });

            }

            res.json({
                sucesso:true
            });

        }

    );

});
// EDITAR PRODUTO

router.put("/produtos/:id", (req, res) => {

    const id = req.params.id;

    const {
        nome,
        categoria,
        quantidade,
        estoque_minimo
    } = req.body;

    db.run(
        `
        UPDATE produtos
        SET
            nome=?,
            categoria=?,
            quantidade=?,
            estoque_minimo=?
        WHERE id=?
        `,
        [
            nome,
            categoria,
            quantidade,
            estoque_minimo,
            id
        ],
        function(err){

            if(err){

                return res.status(500).json(err);

            }

            res.json({
                sucesso:true
            });

        }
    );

});
router.get("/dashboard", (req, res) => {

    db.all(
        "SELECT * FROM produtos",
        [],
        (err, produtos) => {

            if(err){

                return res.status(500).json(err);

            }

            let totalEstoque = 0;
            let estoqueBaixo = 0;

            produtos.forEach(produto => {

                totalEstoque += produto.quantidade;

                if(
                    produto.quantidade <
                    produto.estoque_minimo
                ){

                    estoqueBaixo++;

                }

            });

            res.json({

                totalProdutos:
                produtos.length,

                totalEstoque,

                estoqueBaixo

            });

        }
    );

});
module.exports = router;
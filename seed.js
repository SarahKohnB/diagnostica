const bcrypt = require("bcryptjs");
const db = require("./src/database/sqlite");

const senhaAdmin = bcrypt.hashSync("admin123", 10);

db.serialize(() => {

    db.run(`
        INSERT OR IGNORE INTO usuarios
        (nome,email,senha,tipo)
        VALUES
        ('Administrador','admin@saep.com', ?, 'admin')
    `, [senhaAdmin]);

    db.run(`
        INSERT OR IGNORE INTO produtos
        (nome,categoria,quantidade,estoque_minimo)
        VALUES
        ('Cimento CP2','Construção',100,20)
    `);

    db.run(`
        INSERT OR IGNORE INTO produtos
        (nome,categoria,quantidade,estoque_minimo)
        VALUES
        ('Tinta Acrílica','Acabamento',50,10)
    `);

    db.run(`
        INSERT OR IGNORE INTO produtos
        (nome,categoria,quantidade,estoque_minimo)
        VALUES
        ('Argamassa AC3','Construção',80,15)
    `);

    console.log("Banco populado com sucesso.");
});

setTimeout(() => {
    db.close();
}, 1000);
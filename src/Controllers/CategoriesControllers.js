import Joi from "joi";
import connection from "../DBstrategy/postgres.js";

export async function ListarCategoria(req, res) {

    try {
        const { rows } = await connection.query('SELECT * FROM categories');

        res.send(rows)
    } catch {
        res.send('deu ruim')
    }
}

export async function PostarCategoria(req, res) {

    const { name } = req.body

    const objetoJoi = Joi.object({
        name: Joi.string().required()
    })

    const { error } = objetoJoi.validate(req.body)

    if (error) {
        res.sendStatus(400)
        return
    }

    try {
        const { rows: itemRepetido } = await connection.query('SELECT name FROM categories WHERE name = $1', [name]);

        if (itemRepetido.length !== 0) {
            return res.status(409).send('Essa categoria já existe')
        }
        await connection.query("INSERT INTO categories (name) VALUES ($1)", [name]);

        const { rows } = await connection.query('SELECT * FROM categories');
        res.send(rows)
    } catch {
        res.send("deu ruim")
    }
}


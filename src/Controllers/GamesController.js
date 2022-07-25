import Joi from "joi";
import connection from "../DBstrategy/postgres.js";

export async function ListarGames(req,res){

    const nome = req.query.name;
    console.log(nome)

try{
   if(nome){
    const {rows: jogos} = await connection.query('SELECT * FROM games WHERE name  LIKE $1', [`${nome}%`]);
    return res.send(jogos)
   }else{
    const { rows: jogos } = await connection.query('SELECT *FROM games')
   }
   return res.send(jogos)

}catch{
    res.send('deu ruim')
}
}

export  async function PostarGames(req, res){

    const novoJogo = req.body

    const regexURL = /^http[s]?:\/\/(www\.)?(.*)?\/?(.)*/
    const regexNumber = /^[1-9][0-9]?$|^100$/

    const objetoJoi = Joi.object({
        name: Joi.string().required(),
        image: Joi.string().pattern(regexURL).required(),
        stockTotal: Joi.number().required(),
        categoryId: Joi.number().required(),
        pricePerDay: Joi.number().required()

    })

    const { error } = objetoJoi.validate(novoJogo)

    if( error ){
        console.log(error)
        res.send("Objeto inválido")
        return
    }

    if(novoJogo.stockTotal<0|| novoJogo.pricePerDay<0){
        return res.sendStatus(400)
    }

    try{
        const { rows: categoria} = await connection.query('SELECT name FROM categories WHERE id = $1', [novoJogo.categoryId]);
console.log(categoria[0].name)
        if(categoria.length<1){
            return res.status(400).send('Categoria inexistente')
        }
        console.log("2")
        const { rows: itemRepetido} = await connection.query('SELECT name FROM games WHERE name = $1', [novoJogo.name]);

        if(itemRepetido.length!==0){
            return res.status(409).send('Esse jogo já existe')
        }
        console.log("3")
        await connection.query('INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES($1,$2,$3,$4,$5)', 
        [novoJogo.name, novoJogo.image, novoJogo.stockTotal, novoJogo.categoryId, novoJogo.pricePerDay])
        // await connection.query('INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay","categoryName") VALUES($1,$2,$3,$4,$5,$6)', 
        // [novoJogo.name, novoJogo.image, novoJogo.stockTotal, novoJogo.categoryId, novoJogo.pricePerDay, categoria[0].name])
        console.log("4")
        res.sendStatus(201)
    }catch{
        res.send("deu ruim")
    }
}


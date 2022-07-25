import connection from "../DBstrategy/postgres.js";
import Joi from "joi";
import dayjs from "dayjs";

export async function ListarRentals(req, res) {

    try {
        const { rows: alugueis } = await connection.query('SELECT *FROM rentals')
        const {rows: jogos} = await connection.query('SELECT id, name, "categoryId" FROM games')
        const {rows: categorias} = await connection.query('SELECT *FROM categories')
        const {rows: clientes} = await connection.query('SELECT id, name FROM customers')


console.log(alugueis)
        const infoTotal = alugueis.map(aluguel=> {
     
            const jogoAlugado = jogos.find((jogo)=> jogo.id===aluguel.gameId)

            const nomeDaCategoria = categorias.find(categoria=> categoria.id===jogoAlugado.categoryId)

            const cliente = clientes.find(cliente=> cliente.id===aluguel.customerId)


            const objetoAluguelCompleto =  {... aluguel,  "customer": cliente,"game": {...jogoAlugado, "categoryName": nomeDaCategoria.name} }

            return objetoAluguelCompleto

        })

        res.send(infoTotal)
    } catch {
        res.send('deu ruim')
    }
}

export async function PostarRentals(req, res) {

    const novoAluguel = req.body

    const objetoJoi = Joi.object({
        customerId: Joi.number().required(),
        gameId: Joi.number().required(),
        daysRented: Joi.number().required()
    })

    const { error } = objetoJoi.validate(novoAluguel)

    if (error) {
        res.sendStatus(400)
        return
    }

    if(novoAluguel.daysRented<=0){
        return res.sendStatus(400)
    }


    try {

        const {rows: verificacaoDoUsuario} = await connection.query('SELECT *FROM customers WHERE id=$1',[novoAluguel.customerId])
        console.log(verificacaoDoUsuario)
        if(verificacaoDoUsuario.length<1){
            return res.sendStatus(400)
        }

        const {rows: verificacaoDoJogo} = await connection.query('SELECT  "stockTotal" FROM games WHERE id=$1',[novoAluguel.gameId])
        console.log(verificacaoDoJogo)
        if(verificacaoDoJogo.length<1){
            return res.sendStatus(400)
        }
console.log("o jogo existe")

        const {rows: verificacaoDoEstoque }= await connection.query('SELECT "returnDate" FROM rentals WHERE "gameId"=$1',[novoAluguel.gameId])
        console.log(verificacaoDoEstoque)

        const jogosForaDoEstoque = verificacaoDoEstoque.filter((jogo) => jogo.returnDate==null)

        if(jogosForaDoEstoque.length >= verificacaoDoJogo[0].stockTotal){
            return res.sendStatus(400)
        }


        const {rows: jogoAlugado} = await connection.query('SELECT "pricePerDay" FROM games WHERE id=$1',
        [novoAluguel.gameId])

        const diaDoAluguel = dayjs().format('YYYY-MM-DD')
  
        const precoTotal = jogoAlugado[0].pricePerDay*novoAluguel.daysRented

        await connection.query('INSERT INTO rentals ("customerId","gameId", "rentDate", "daysRented","returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3,$4, $5, $6, $7)', 
        [novoAluguel.customerId, novoAluguel.gameId, diaDoAluguel, novoAluguel.daysRented, null, precoTotal, null ])

        res.sendStatus(201)
    } catch {
        res.send('Algo deu errado')
    }
}

export async function DevolverRentals(req,res){


 
    const { id } = req.params;

    const dataRetorno = dayjs().format('YYYY-MM-DD')
    const datavolta = dayjs(dataRetorno)



try{

    const {rows :jogoDevolvido} = await connection.query('SELECT "rentDate", "daysRented" , "originalPrice", "returnDate" FROM rentals WHERE id=$1',[id])

if(jogoDevolvido.length<1){
    return res.sendStatus(404)
}

if(jogoDevolvido[0].returnDate!==null){
    return res.sendStatus(400)
}

const dataAlugado = dayjs(jogoDevolvido[0].rentDate).format('YYYY-MM-DD')

const date2 = dayjs(`${dataAlugado}`)
const date1 = dayjs(`${datavolta}`)
const tempo = date1.diff(date2,'day')
console.log(tempo)

let multa = 0

if(tempo>0){
console.log("entrou na multa")
   multa = tempo*(jogoDevolvido[0].originalPrice)
}

await connection.query('UPDATE rentals SET "returnDate"=$1, "delayFee" = $2 WHERE id=$3',[dayjs().format('YYYY-MM-DD'), multa, id])

res.sendStatus(200)

}catch{
    res.send("deu ruim")
}

}

export async function DeletarRental(req, res){

    const { id } = req.params;

    console.log(id)
try{

    const {rows : jogoDeletado} = await connection.query('SELECT "returnDate" FROM rentals WHERE id=$1',[id])
console.log(jogoDeletado)
    if(jogoDeletado.length<1){
        return res.sendStatus(404)
    }
console.log("existe")
    if(jogoDeletado[0].returnDate!==null){
        return res.sendStatus(400)
    }
console.log("nao foi deletado")
    await connection.query('DELETE FROM rentals WHERE id=$1',[id])


res.sendStatus(200)

}catch{
    res.send("deu ruim")
}

}
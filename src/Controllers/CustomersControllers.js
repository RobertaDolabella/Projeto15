import connection from "../DBstrategy/postgres.js";
import Joi from "joi";

export async function ListarCustomers(req,res){

    const cpf = req.query.cpf;
    console.log(cpf)



    try{
        if(cpf){
            const {rows: usuario} = await connection.query('SELECT * FROM customers WHERE cpf LIKE $1', [`${cpf}%`]);
            return res.send(usuario)
        }else{
            const {rows: usuario} = await connection.query('SELECT *FROM customers')

            return res.send(usuario)
            }

    }catch{
        res.send("deu ruim")
    }

}

export  async function PostarCustomers(req, res){
console.log("entrou no post")
    const novoCliente = req.body

    const regexCPF = /[0-9]{11,11}/
    const telefoneRegex = /[0-9]{10,11}/
    const dataRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/

    const objetoJoi = Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        cpf: Joi.string().pattern(regexCPF).required(),
        birthday: Joi.string().pattern(dataRegex).required()
    })
console.log("2")
    const { error } = objetoJoi.validate(novoCliente)

    if( error ){

        res.sendStatus(400)
        return
    }

    try{
        const { rows: verificacaoCPF} = await connection.query('SELECT cpf FROM customers WHERE cpf = $1', [novoCliente.cpf]);

        if(verificacaoCPF.length>0){
            return res.status(409).send('CPF já cadastrado')
        }

        await connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES($1,$2,$3,$4)', 
        [novoCliente.name, novoCliente.phone, novoCliente.cpf, novoCliente.birthday])
        console.log("4")
        res.sendStatus(201)
    }catch{
        res.send("deu ruim")
    }
}

export async function AtualizarCustomers(req, res){

    const { id } = req.params;

    const atualizacaoCliente = req.body


    const regexCPF = /[0-9]{11,11}/
    const telefoneRegex = /[0-9]{10,11}/
    const dataRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
  console.log("1")
    const objetoJoi = Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        cpf: Joi.string().pattern(regexCPF).required(),
        birthday: Joi.string().pattern(dataRegex).required()
    })
console.log("2")
    const { error } = objetoJoi.validate(atualizacaoCliente)

    if( error ){
        console.log(error)
        res.sendStatus(400)
        return
    }
    try{
        const { rows: verificacaoCPF} = await connection.query('SELECT cpf FROM customers WHERE id = $1', [id]);

        if(verificacaoCPF[0].cpf!==atualizacaoCliente.cpf){
            res.send("O cpf informado não corresponde ao CPF cadastrado").status(409)
            return
        }
        await connection.query('UPDATE customers SET name=$1, phone=$2, birthday=$4 WHERE cpf=$3',
        [atualizacaoCliente.name, atualizacaoCliente.phone, atualizacaoCliente.cpf, atualizacaoCliente.birthday])

        res.sendStatus(201)
    }catch{
            res.send("deu ruim")
        }


}

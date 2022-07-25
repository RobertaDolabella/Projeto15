import { Router } from "express";
import {ListarCustomers, PostarCustomers, AtualizarCustomers} from "../Controllers/CustomersControllers.js";

const router = Router();

router.get('/customers', ListarCustomers)
router.post('/customers', PostarCustomers)
router.put('/customers/:id', AtualizarCustomers)

export default router;
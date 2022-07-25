import { Router } from "express";
import {ListarRentals, PostarRentals, DevolverRentals, DeletarRental} from "../Controllers/RentalsControllers.js";

const router = Router()

router.get('/rentals', ListarRentals)
router.post('/rentals', PostarRentals)
router.post('/rentals/:id/return', DevolverRentals)
router.delete('/rentals/:id', DeletarRental)

export default router;
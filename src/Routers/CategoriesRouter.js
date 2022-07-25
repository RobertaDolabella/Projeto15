import { Router } from "express";
import { ListarCategoria , PostarCategoria} from "../Controllers/CategoriesControllers.js";
const router = Router()

router.get('/categories', ListarCategoria);
router.post('/categories', PostarCategoria);

export default router;
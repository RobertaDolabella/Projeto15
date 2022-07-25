import { Router } from "express";
import {ListarGames, PostarGames} from "../Controllers/GamesController.js";

const router = Router();

router.get('/games', ListarGames)
router.post('/games', PostarGames)

export default router;
import { Router } from "express";
import { addComment, getComments, deleteComment, editComment, deleteComments } from "../controllers/comment.controller.js";
import { aiActionWords, aiTagParser } from "../middlewares/aiModel.middleware.js";


const router = Router()

router.post('/save-comment', aiTagParser, aiActionWords, addComment)
router.get('/list-comments', getComments)
router.delete('/delete-comment/:id', deleteComment)
router.put('/edit-comment/:id', editComment)
router.delete('/delete-comments', deleteComments)

export default router
import { Router } from "express";
import { addNews } from "../controllers/news.controller.js";
const router = Router()
// router.route("/daily-news").get(getDailyNews)
// router.route("/update-news").get(updateNews)
router.route("/add-news").get(addNews)

export default router
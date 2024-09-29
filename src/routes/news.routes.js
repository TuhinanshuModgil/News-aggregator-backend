import { Router } from "express";

Router.route("/daily-news").get(getDailyNews)
Router.route("/update-news").get(updateNews)
Router.route("/add-news").get(addNews)
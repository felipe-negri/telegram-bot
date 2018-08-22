#!/usr/bin/env node

const TelegramBot = require( `node-telegram-bot-api` )
const TOKEN = `634996314:AAG0D6B4WFY1TdFokv2dU35GDeZ0DqTrXjc`
const bot = new TelegramBot( TOKEN, { polling: true } )

const torrentName = process.argv[3]
const mensagem = `O arquivo:\n${torrentName}\nTerminou de ser baixado :D  `.replace(/\s\s/g, "\n")

bot.sendMessage("127227156", mensagem)
bot.sendSticker("127227156", "CAADAQADeAMAAu3_-wbDcSv-O7t9-wl").then(()=>{process.exit(0)})
 


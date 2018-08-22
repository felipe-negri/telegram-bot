const keys = require('./keys.js')
var botToken = keys.botToken;//INSERT HERE YOUR AUTHENTICATION token PROVIDED BY @BotFather
var AUTHID = keys.AUTHID;  //INSERT HERE YOUR UNIQUE ID, YOU CAN FIND IT STARTING THE BOT AND SENDING THE COMMAND /myid
var botName = keys.botName;//INSERT YOUR YOUR BOT NAME (OR WHAT YOU PREFERE)
var fs = require('fs');



var TEMP_LIMIT = 60;
var tempLimitToggle = false;
var setIntervalTemp;

var Bot = require('node-telegram-bot-api'),
bot = new Bot(botToken, { polling: true });

var sys = require('util'),
spawn = require('child_process').spawn,
exec = require('child_process').exec,
child;


console.log('Bot @'+botName+' - server started...');


send("@"+botName+" is now up!", AUTHID); //THE BOT WILL SEND THIS MESSAGE AT THE START


bot.onText(/^\/temp_limit on (\d{2})$/, function (msg, match) {
	var limit = match[1];
	console.log(limit);
	if(msg.chat.id == AUTHID){
		if(tempLimitToggle == false){
			tempLimitToggle = true;
			TEMP_LIMIT = limit;
			if (setIntervalTemp) clearInterval(setIntervalTemp);
			setIntervalTemp = setInterval(function(){
				if(tempLimitToggle)
				child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
					if (error == null){
						var temp = parseFloat(stdout)/1000;
						if(temp>=TEMP_LIMIT){
							console.log("reached");
							send("WARNING!: " + TEMP_LIMIT + "° reached! Temp: " + temp + "°", AUTHID);
						}
					}
				});
			},10000);
			send("Warning for temperature limit ON: "+limit+"°", msg.chat.id);
			
		}else{
			TEMP_LIMIT = limit;
			send("Warning for temperature limit updated to: " + TEMP_LIMIT + "°", msg.chat.id);
		}
	}
});

bot.onText(/^\/temp_limit off$/, function (msg, match) {
	if(msg.chat.id == AUTHID){
		if(tempLimitToggle == true){
			tempLimitToggle = false;
			clearInterval(setIntervalTemp);
			send("Warning for temperature limit OFF!", msg.chat.id);
		}
	}
});

bot.onText(/^\/temp$/, function(msg, match){
	var reply = "";
	if(msg.chat.id == AUTHID){
		child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
				reply = "Error: " + error;
				send(reply, msg.chat.id);
			} else {
				var temp = parseFloat(stdout)/1000;
				reply = "Temperature: " + temp + "°";
				console.log(msg.chat.id);
				send(reply, msg.chat.id);
			}
		});
	}
});

bot.onText(/^\/reboot$/, function(msg, match){
	var reply = "";
	if(msg.chat.id == AUTHID){
		send("Rebooting Raspberry Pi!", msg.chat.id);
		console.log("rebooting");
		
		setInterval(function(){child = exec("sudo reboot", function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
				reply = "Error: " + error;
				send(reply, msg.chat.id);
			}
		});
	},5000);
}
});

bot.onText(/^\/myid$/, function(msg, match){
	send("Your unique ID is: "+msg.chat.id, msg.chat.id);
	send("Insert this in 'my-telegram-id' in your bot.js", msg.chat.id);
});


bot.onText(/^\/space$/, function(msg, match){
	var reply = "";
	if(msg.chat.id == AUTHID){
		child = exec("df -h |grep sda1", function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
				reply = "Error: " + error;
				send(reply, msg.chat.id);
			} else {
				var space = stdout.split("       ")
				var total = space[1].split("G")[0]+" Gb"
				var utilizado = space[1].split("G")[1]+" Gb"
				var disponivel = space[1].split("G")[2]+" Gb"
				var percentualUso = (((space[1].split("G")[1])*100)/(space[1].split("G")[0])).toFixed(2) +" %"
				var nome = space[1].split("/pi/")[1]
				reply = (`Nome:${nome}Tamanho:${total}\nUtilizado:${utilizado}\nDisponivel:${disponivel}\n%Uso:${percentualUso}`)
				
				console.log(msg.chat.id);
				send(reply, msg.chat.id);
			}
		});
	}
});

bot.onText(/^\/cpu$/, function(msg, match){
	var reply = "";
	if(msg.chat.id == AUTHID){
		child = exec("top -d 0,5 -b -n2 | grep 'Cpu(s)'|tail -n 1 | awk '{print $2 + $4}'", function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
				reply = "Error: " + error;
				send(reply, msg.chat.id);
			} else {
				var cpu = parseFloat(stdout);
				reply = "CPU Load: " + cpu + "%";
				console.log(msg.chat.id);
				send(reply, msg.chat.id);
			}
		});
	}
});


bot.onText(/^\/list$/, function(msg, match){
	var reply = "";
	if(msg.chat.id == AUTHID){
		child = exec("ls -t /media/pi/Chrono_Trigger/", function (error, stdout, stderr) {
			let listNumerada = new Promise (function (resolve, reject) {
				
				var lista = (stdout.replace(/(\r\n|\n|\r)/gm,"   ")).split("   ")
				lista.pop()
				
				let count = 1;
				lista = lista.map((arquivo)=>{
					arquivo = count +" - "+arquivo+"\n"
					count++
					
					return arquivo
				})
				return resolve(lista)				
				
			})
			listNumerada.then((lista) => { 
				listaFinal = "Lista de Arquivos Baixados: \n"+lista.join('')
				send(listaFinal, msg.chat.id);
			})
			
		})
	}
});

/* SEND FUNCTION */
function send(msg, id){
	console.log(id);
	bot.sendMessage(id, msg).then(function () {
		console.log(msg);
	});
}

//fs.writeFile('file.txt', lista, function (err) {
//	if (err) throw err;
//	console.log('Saved!');
//});
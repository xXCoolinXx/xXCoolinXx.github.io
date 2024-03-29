//Load monkeys
let monkey_data;

function loadMonkeys(callback)
{
	$.getJSON("monkeys.json")
	.fail(function(){
		console.log("Failed to load monkeys :(");
	}).then(result => {
		monkey_data = result;
		callback();
	});
}

function numMonkeys() {
	return Object.keys(monkey_data).length;
}

//Logic for generating a monkey based on a unique identifier (name, Discord UID)

function getMonkey(name) {
	let len = numMonkeys();
	let hashbrowns = CryptoJS.MD5(name);
    let nombre = convertStringToNum(hashbrowns.toString());
    let monkey_number = nombre % len;

    return monkey_data[monkey_number];
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function convertStringToNum( str ) { 
	// Converts a string of characters to UTF-8 byte codes, separated by spaces
	// str: sequence of Unicode characters
	var highsurrogate = 0;
	var suppCP; // decimal code point value for a supp char
	var n = 0;
	var outputString = '';
	for (var i = 0; i < str.length; i++) {
		var cc = str.charCodeAt(i); 
		if (cc < 0 || cc > 0xFFFF) {
			outputString += '!Error in convertCharStr2UTF8: unexpected charCodeAt result, cc=' + cc + '!';
			}
		if (highsurrogate != 0) {  
			if (0xDC00 <= cc && cc <= 0xDFFF) {
				suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00); 
				outputString += ' '+dec2hex2(0xF0 | ((suppCP>>18) & 0x07)) + ' ' + dec2hex2(0x80 | ((suppCP>>12) & 0x3F)) + ' ' + dec2hex2(0x80 | ((suppCP>>6) & 0x3F)) + ' ' + dec2hex2(0x80 | (suppCP & 0x3F));
				highsurrogate = 0;
				continue;
				}
			else {
				outputString += 'Error in convertCharStr2UTF8: low surrogate expected, cc=' + cc + '!';
				highsurrogate = 0;
				}
			}
		if (0xD800 <= cc && cc <= 0xDBFF) { // high surrogate
			highsurrogate = cc;
			}
		else {
			if (cc <= 0x7F) { outputString += ' '+dec2hex2(cc); }
			else if (cc <= 0x7FF) { outputString += ' '+dec2hex2(0xC0 | ((cc>>6) & 0x1F)) + ' ' + dec2hex2(0x80 | (cc & 0x3F)); } 
			else if (cc <= 0xFFFF) { outputString += ' '+dec2hex2(0xE0 | ((cc>>12) & 0x0F)) + ' ' + dec2hex2(0x80 | ((cc>>6) & 0x3F)) + ' ' + dec2hex2(0x80 | (cc & 0x3F)); } 
			}
		}
	return parseInt(outputString.substring(1).replace(/\s+/g, ''));//.split(" ").join("").parseInt();
	}

function dec2hex ( textString ) {
	return (textString+0).toString(16).toUpperCase();
}

function  dec2hex2 ( textString ) {
	var hexequiv = new Array ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
	return hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
}

//Logic for the monkey quiz
//Generates a random monkey image, gives the user 4 options to guess
//Can be handled externally (website/discord bot)
function randomSetUnique(quantity, max){
	const set = new Set()
	while(set.size < quantity) {
	  set.add(Math.floor(Math.random() * max))
	}
	return [...set]
}

function randomizeArray(arr) {
    var i, j, tmp;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

function getQuestion() {
	let monkey_nums = randomSetUnique(4, numMonkeys());
	let monkeys = [];
	for(let i = 0; i < 4; i++) {
		monkeys[i] = monkey_data[monkey_nums[i]];
	}

	let correct_answer = monkeys[0];

	monkeys = randomizeArray(monkeys);

	return {
		'answer': correct_answer,
		'options': monkeys,
	};
}

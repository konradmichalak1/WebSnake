"use strict";

let name = "Dominik";
let number = 3

alert(`Hello, ${name}!`);

alert(`the result is ${number + 5}.`);

let stringNumber = "125";
alert(`${stringNumber + 5}`);

stringNumber = Number(stringNumber);

alert(`${stringNumber + 5}`);

// wejście dla użytkownika
let age = prompt('How old are you?', 100);
alert(`You are ${age} years old!`);

// potwierdzenie
let isBoss = confirm('Are you the boss?');
alert(isBoss);
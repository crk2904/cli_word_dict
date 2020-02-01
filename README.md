# Command Line Dictionary Tool

Create a command line dictionary tool using [this](https://fourtytwowords.herokuapp.com/) api.

### Word Definitions
```
dict defn <word>
```
Display definitions of a word.

### Word Synonyms
```
dict syn <word>
```
Display synonyms of a word.

### Word Antonyms
```
dic ant <word>
```
Display antonyms of a word

### Word Examples
```
dict ex <word>
```
Display examples of a word

### Word Full Dict
```
dict <word>
```
Display all above details for a word

### Word of the Day Full Dict
```
dict
```
Display all above details of word of the day

### Word Game
```
dict play
```
Command will display a definition, synonym, or antonym and ask the user to enter the word.

If correct word is entered, program should tell that the word is correct 
(Synonyms of the word should also be accepted as correct answer).

If incorrect word is entered, program should ask for
1. try again

	Lets user enter word again
2. hint

	Display a hint, and let user enter word again
	Hint can be
	1. Display the word randomly jumbled (cat -> atc).
	2. Display another definition of the word.
	3. Display another antonym of the word.
	4. Display another synonym of the word.
3. quit

	Display the word, its full dict, and quit

-----------------------------------------------------------------------

## Technology Stack : Node.JS

How To Run
1) The code is written in NodeJS.
2) Pull this repo, and run `npm install`, this will install all the dependencies required.
3) Run `npm link` to install as a global command
4) Now type the any of the aforementioned command.

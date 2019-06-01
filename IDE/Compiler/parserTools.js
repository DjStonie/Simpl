///Report an error to console
//error = error-json to be written to console
function reportError(error){
    const textArea2 = document.getElementById("console");
    textArea2.value = textArea2.value + "You made a mistake on line " + (error.line + 1) + ": " + error.error + "\n";
};
//Write to console in Simpl IDE
//string = string to write to be written console
function writeToConsole(string){
    const textArea2 = document.getElementById("console");
    textArea2.value = textArea2.value + string + "\n";
};
//Searches for a specific function
//name = name of the function to find
//return = string with the type of the function or error if nothing was found
function functionLookup(name){
    for (func in functions){
        if(functions[func].name === name){
            return functions[func];
        };
    };
    return {"id": "error", "type": "error", "error": "function not found " + name};
};

//Searches for a specific variable
//name = name of variable to look up
//variables = list with lists of variables
//return = string with type of variable found or error if nothing was found
function variableLookup(name){
    for (stack in variables){
        for (vars in variables[stack]){
            if (variables[stack][vars] && name === variables[stack][vars].name){
                //return variables[stack][vars].vartype;
                return variables[stack][vars].type;
            };
        };
    };
    return {"type": "error", "error": "could not find var " + name};
};

//Splits on newline into array
//Removes white space and changes everything to lower case
//return = array with trimmed strings split on \n
function codeReader(){
    let importsAndCode = getConvertedCode();
    let importCodeLines = importsAndCode[0].split("\n");
    for (line in importCodeLines) {
        importCodeLines[line] = importCodeLines[line].replace(/\s/g, "").toLowerCase();
    };
    let codeLines = importsAndCode[1].split("\n");
    for (line in codeLines) {
        codeLines[line] = codeLines[line].replace(/\s/g, "").toLowerCase();
    };
    return [importCodeLines,codeLines];
};

//Splits a string on a list with operators
//str = string to be split
//operatorList = list of operators to split by
function splitOnOperator(str, operatorList){
    let returnList = [];
    let currentElement = "";
    let foundOperator = false;
    for (let i = 0; i < str.length; i++){
        let nextChar = str.charAt(i);
        for (let j = 0; j < operatorList.length; j++){
            if (nextChar === operatorList[j]){
                if (currentElement !== ""){
                    returnList.push(currentElement);
                    currentElement = "";
                };
                returnList.push(nextChar);
                foundOperator = true;
            };
        };
        if (foundOperator){
            foundOperator = false;
        }
        else{
            currentElement += nextChar;
        };
    };
    if (currentElement !== ""){
        returnList.push(currentElement);
    };
    return returnList;
};

//tests if a name consists of a reserved keyword
//nameStr = string with the name to be tested
//returns = {"keyword": "ok"} if no conflicts were found otherwise error with the conflict
function testKeyword(nameStr){
    for (simpl in simplType){
        if (nameStr === simplType[simpl].id){
            return {"id": "error", "type": "error", "error": "Name " + nameStr + " matches simpl reserved word - simpl type"};
        };
    };
    for (simpl in simplConditional){
        if (nameStr === simplConditional[simpl].id){
            return {"id": "error", "type": "error", "error": "Name " + nameStr + "  matches simpl reserved word - simpl conditional"};
        };
    };
    for (cKeyword in cReservedWords){
        if (nameStr === cReservedWords[cKeyword]){
            return {"id": "error", "type": "error", "error": "Name " + nameStr + "  matches c reserved word"};
        };
    };
    return {"keyword": "ok"};
};

//Tests if any char in a string is a part of a set
//str = string of chars to be tested
//set = set of char/strings to be tested against
//return = if any char in the string is part of the set testStr returns true otherwise false 
function testStr(str, set){
    for (char in str){
        if(testChar(str.charAt(char), set)){
            return true;
        };
    };
    return false;
};

//Tests if a char (or string) is a part of a set of chars
//char = char to be tested
//set = set to be tested against
//return = true if char is a part of set otherwise false
function testChar(char, set){
    for (chars in set){
        if (char === set[chars]){
            return true;
        };
    };
    return false;
};
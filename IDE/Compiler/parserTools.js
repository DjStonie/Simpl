function reportError(error){
    const textArea2 = document.getElementById("console");
    textArea2.value = textArea2.value + "You made a mistake on line " + (error.line + 1) + ": " + error.error + "\n";
};

function writeToConsole(string){
    const textArea2 = document.getElementById("console");
    textArea2.value = textArea2.value + string + "\n";
};

//Searches for a specific variable
//name = name of variable to look up
//variables = list with lists of variables
//return = string with type of variable found or error if nothing was found
function lookUpVar(name){
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
//code = string
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

//
function testStr(str, set){
    for (char in str){
        if(testChar(str.charAt(char), set)){
            return true;
        };
    };
    return false;
};

//Tests if a char is a part of a set of chars
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
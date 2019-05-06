//all current variables
let variables = [[]];

//Splits on newline into array
//Removes white space and changes everything to lower case
//code = string
//return = array with trimmed strings split on \n
function codeReader(code){
    let codeLines = code.split("\n");
    for (line in codeLines) {
        codeLines[line] = codeLines[line].replace(/\s/g, "").toLowerCase();
    };
    return codeLines;
};

//Searches for a specific variable
//name = name of variable to look up
//variables = list with lists of variables
//return = string with type of variable found or error if nothing was found
function lookUpVar(name){
    for (stack in variables){
        for (vars in variables[stack]){
            if (variables[stack][vars] && name === variables[stack][vars].name){
                return variables[stack][vars].vartype;
            };
        };
    };
    return {"type": "error", "error": "could not find var"};
};

//Creates a string with c variable creations
//typeObj = json with information about variable to be created
//expression = expression part of variable declaration
//return = string with c variable declaration
function varWriter(typeObj, expression){
    switch(typeObj.vartype){
        case "int":
            const newLine = typeObj.vartype + " " + typeObj.name + " = " + expression + ";\n";
            return newLine;
            break;             
        case "char":
            break;
        case "string":
            break;
        case "bool":
            break;
        };

    return {"type": "error", "error": "internal varWriter - no match"}
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

function verifyIntExpr(expr){
    const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    const numbers = ["0","1","2","3","4","5","6","7","8","9"];
    const operators = ["+","-","/","*"];
    const exprList = splitOnOperator(expr, operators);

    let cantBeOperator = true;
    if (exprList[0] === "-"){
        cantBeOperator = false;
    };
    if (testChar(exprList[exprList.length - 1], operators)){
        return {"type": "error", "error": "int expression must end with number"};
    };
    for (expr in exprList){
        let nextChar = exprList[expr].charAt(0);
        if (testChar(nextChar, operators)){
            if (cantBeOperator){
                return {"type": "error", "error": "unexpected operator"};
            }
            else{
                cantBeOperator = true;
            }
        }
        else if (testChar(nextChar, numbers)){
            for (let i = 1; i < exprList[expr].length; i++){
                if(!testChar(exprList[expr].charAt(i), numbers)){
                    return {"type": "error", "error": "unexpected character"};
                };
            };
            cantBeOperator = false;
        }
        else if(testChar(nextChar, letters)){
            varType = lookUpVar(exprList[expr], variables);
            if (varType.error){
                return varType;
            }
            else if (varType === "int"){
                cantBeOperator = false;
            }
        }
        else{
            return {"type": "error", "error": "unexpected character"};
        };
    };
    return {"type": "int"};
};

//Verifies if name only contains legal chars
//nameStr = string with the potential new name that is to be tested
//return = {"type": "ok"} if things go well otherwise an error
function verifyName(nameStr){
    const numbers = ["0","1","2","3","4","5","6","7","8","9"];
    const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    if (nameStr.length > 0){
        if (testChar(nameStr.charAt(0), letters)){
            for (let i = 1; i < nameStr.length; i++){
                if (!(testChar(nameStr.charAt(i), numbers) || testChar(nameStr.charAt(i), letters))){
                    return {"type": "error", "error": "name error wrong char"};
                };
            };
            return {"type": "ok"};
        };
        return {"type": "error", "error": "naming error, var cannot start with number"};
    };
    return {"type": "error", "error": "name error too short"};
};

//Tests is a simpl expression results in an int result
//expr = expression to be tested
//return = {"type": "int"} if expr is an int otherwise error
function intExpressionHandler(expr){
    const numbers = ["0","1","2","3","4","5","6","7","8","9"];
    const operators = ["+","-","/","*"];
    let mustBeNumber = false;
    if (expr.length > 0){
        if (expr.charAt(0) === "-"){
            mustBeNumber = true;
        } else if (!testChar(expr.charAt(0), numbers)){
            return {"type": "error", "error": "int must start with - or number"};
        };
        if (testChar(expr.charAt(expr.length - 1), numbers)){
            for (let i = 1; i < expr.length; i++){
                if (mustBeNumber){
                    if (!testChar(expr.charAt(i), numbers)){
                        return {"type": "error", "error": "number expected"};
                    };
                    mustBeNumber = false;
                }
                else {
                    let isNumber = testChar(expr.charAt(i), numbers);
                    let isOperator = testChar(expr.charAt(i), operators);
                    if (isOperator){
                        mustBeNumber = true;
                    }else if (isNumber){
                        mustBeNumber = false;
                    }
                    if (!(isOperator || isNumber)){
                        return {"type": "error", "error": "illegal char number or operator expected"};
                    };
                };  
            };
            return {"type": "int"};
        };
        return {"type": "error", "error": "int must end with number"};
    };
    return {"type": "error", "error": "int epr too short"};
};

//Chooses correct handler according to the expected type
//expr = expression to be passed to correct handler
//typeExpected = the expected type of expr
//return =  result of specific handler or error if no handler could be found
function expressionHandler(expr, typeExpected){
    switch (typeExpected){
        case "int":
            //return intExpressionHandler(expr);
            return verifyIntExpr(expr);
            break;
    };
    return {"type": "error", "error": "could not find handler for expression"}
};

//verifies variables and pushes them onto stack
//newVar = json with information about a new variable
//line = line of simpl code with variable declaration
//variables = all current variables
//return = result of varWriter() or error
function variableHandler(newVar, line, variables){
    //verify name
    const name = line.substring(newVar.vartype.length, newVar.operator);
    const verifiedName = verifyName(name);
    if (verifiedName.type === "error"){
        return verifiedName;
    };            
    if (lookUpVar(name, variables).type !== "error"){
        return {"type": "error", "error": "var already created"};
    };
    //verify expression
    const expression = line.substring(newVar.operator + 1, line.length);
    const expressionType = expressionHandler(expression, newVar.vartype);
    if (expressionType.type === "error"){
        return expressionType;
    };
    //create new variable if no type error
    if (newVar.vartype === expressionType.type){
        newVar = {...newVar, "name": name};
        variables[0].push(newVar);
        return varWriter(newVar, expression);
    };
    return {"type": "error", "error": "Type error"}
};

//Identifies contents of a line of simpl code
//line = string with a simpl code line
//return = json with information about type simpl code
function lineIdentifier(line){
    const simplType = [{"id": "int"}, {"id": "void"}];
    const simplConditional = [{"id": "while"}, {"id": "for"}, {"id": "if"}]
    for (rule in simplType){
        if (line.startsWith(simplType[rule].id)){
            if (simplType[rule].id === "void"){
                const endOfName = line.indexOf("(");
                if (endOfName > 0){
                    return {"type": "function", "functiontype": simplType[rule].id};
                };
                return {"type": "error", "error": "void but no function"};
            };
            if(line.charAt(simplType[rule].id.length) === "["){
                return {"type": "list", "listtype": simplType[rule].id, "operator": simplType[rule].id.length};
            };
            //test for function or variable declaration
            for (let i = simplType[rule].id.length; i < line.length; i++){
                if (line.charAt(i) === "("){
                    return {"type": "function", "functiontype": simplType[rule].id, "operator": i};
                };
                if (line.charAt(i) === "="){
                    return {"type": "var", "vartype": simplType[rule].id, "operator": i};                           
                };
            };
            return {"type": "error", "error": "Var or Func?"};
        };
    };
    for (rule in simplConditional){
        if (line.startsWith(simplConditional[rule].id + "(")){
            return {"type": "conditional", "contype": simplConditional[rule].id};
        };
    };
    return {"type": "error", "error": "Keyword not found"};
};

//controls parsing
//codeArray = array with lines of simpl code trimmed by codeReader()
//return = 
function mainParser(codeArray){
    //all current variables
    variables = [[]];
    for (codeLine in codeArray){
        const statement = lineIdentifier(codeArray[codeLine]);
        switch (statement.type){
            case "error":
                console.log(statement.error);
                break;
            case "function":
                break;
            case "conditional":
                    break;
            case "var":
                console.log(variableHandler(statement, codeArray[codeLine], variables));
                break;
            case "list":
                break;
            default:
                //report error
                break;
        };
    };
};
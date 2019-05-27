//Verifies if name only contains legal chars
//nameStr = string with the potential new name that is to be tested
//return = {"type": "ok"} if things go well otherwise an error
function verifyName(nameStr){
    if (nameStr.length > 0){
        if (testChar(nameStr.charAt(0), letters)){
            for (let i = 1; i < nameStr.length; i++){
                if (!(testChar(nameStr.charAt(i), numbers) || testChar(nameStr.charAt(i), letters))){
                    return {"id": "error", "type": "error", "error": "name error wrong char " + nameStr.charAt(i)};
                };
            };
            const keywordTest = testKeyword(nameStr);
            if (keywordTest.error){
                return keywordTest;
            };
            return {"type": "ok"};
        };
        return {"id": "error", "type": "error", "error": "naming error, var cannot start with number"};
    };
    return {"id": "error", "type": "error", "error": "name error too short"};
};

//Creates a string with c variable creations
//typeObj = json with information about variable to be created
//expression = expression part of variable declaration
//return = string with c variable declaration
function varWriter(typeObj, expression){
    switch(typeObj.type){
        case "int":
            return typeObj.type + " " + typeObj.name + " = " + expression + ";";
        case "string":
            return  "char[] " + typeObj.name + " = " + expression + ";";
        case "bool":
            //not correct syntax! false and true not handled
            return  typeObj.type + " " + typeObj.name + " = " + expression + ";"
        };
    return {"type": "error", "error": "internal varWriter - no match"}
};

function varHandler(varJson, codeLine){
    if (varJson.operator){
        const name = codeLine.substring(varJson.type.length, varJson.operator);
        const verifiedName = verifyName(name);
        if (verifiedName.type === "error"){
            return verifiedName;
        }; 
        if (lookUpVar(name).type !== "error"){  
            return {"id": "error", "type": "error", "error": name + " already created"};
        };
        const expression = codeLine.substring(varJson.operator + 1);
        const exprType = mainExpressionParser(expression, varJson.type);
        if (exprType.error){
            return exprType;
        };
        if (varJson.type === exprType.type){
            variables[variables.length - 1].push({"type": varJson.type, "name": name});
            return varWriter({...varJson, "name": name}, expression);
        };
        return {"id": "error", "type": "error", "error": "type mismatch expected " + varJson.type + " found " + exprType.type};
    }
    else{
        const operator = codeLine.indexOf("=");
        if (operator > 0){
            const name = codeLine.substring(0, operator);
            const verifiedVar = lookUpVar(name);
            if (verifiedVar.error){
                return verifiedVar;
            };
            const expression = codeLine.substring(operator + 1);
            const exprType = mainExpressionParser(expression, varJson.type);
            if (exprType.type === "error"){
                return exprType;
            };
            if (verifiedVar === exprType.type){
                return varWriter({...varJson, "name": name}, expression);
            };
            return {"id": "error", "type": "error", "error": "expression type mismatch expected " + verifiedVar + " found " + exprType.type};
        };
        return {"id": "error", "type": "error", "error": "missing operator ="};
    };
};
/*
//verifies variables and pushes them onto stack
//newVar = json with information about a new variable
//line = line of simpl code with variable declaration
//variables = all current variables
//return = result of varWriter() or error
function variableHandler(newVar, line, indentLvl){
    //verify name
    const name = line.substring(newVar.vartype.length, newVar.operator);
    const verifiedName = verifyName(name);
    if (verifiedName.type === "error"){
        return verifiedName;
    };            
    if (lookUpVar(name).type !== "error"){
        return {"type": "error", "error": name + " already created"};
    };
    //verify expression
    const expression = line.substring(newVar.operator + 1, line.length);
    const expressionType = expressionHandler(expression, newVar.vartype);
    if (expressionType.type === "error"){
        return expressionType;
    };
    //create new variable if no type error
    if (newVar.vartype === expressionType.type){
        if (!(variables[indentLvl])){
            //variables[indentLvl] = [];
            variables.push([]);
        }
        variables[indentLvl].push({"vartype": newVar.vartype, "name": name});
        return varWriter({...newVar, "name": name}, expression);
    };
    return {"type": "error", "error": "Type error"}
};*/
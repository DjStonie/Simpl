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
            return  "_Bool" + " " + typeObj.name + " = " + correctBoolExprForC(expression) + ";"
        };
    return {"type": "error", "error": "internal varWriter - no match"}
};
//Parses a variable declaration or update
//varJson = json with information about a variable declaration
//codeline = current line of Simpl code
//return = string with translated Simpl code with a variable declaration
function varHandler(varJson, codeLine){
    if (varJson.operator){
        const name = codeLine.substring(varJson.type.length, varJson.operator);
        const verifiedName = verifyName(name);
        if (verifiedName.type === "error"){
            return verifiedName;
        }; 
        if (variableLookup(name).type !== "error"){  
            return {"id": "error", "type": "error", "error": "variable " + name + " already created"};
        };
        if (functionLookup(name).type !== "error"){
            return {"id": "error", "type": "error", "error": "function " + name + " already created"};
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
            const verifiedVar = variableLookup(name);
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
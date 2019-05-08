//Verifies if name only contains legal chars
//nameStr = string with the potential new name that is to be tested
//return = {"type": "ok"} if things go well otherwise an error
function verifyName(nameStr){
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
            //not correct syntax! false and true not handled
            return  typeObj.vartype + " " + typeObj.name + " = " + expression + ";\n";
            break;
        };

    return {"type": "error", "error": "internal varWriter - no match"}
};

//verifies variables and pushes them onto stack
//newVar = json with information about a new variable
//line = line of simpl code with variable declaration
//variables = all current variables
//return = result of varWriter() or error
function variableHandler(newVar, line){
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
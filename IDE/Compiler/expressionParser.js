function conditionalParser(conditional, codeLine){
    //console.log(conditional);
    //console.log(codeLine);
    const endOfCondition = codeLine.indexOf(")");
    if (endOfCondition < 0){
        return {"type": "error", "error": "conditional syntax - missing )"};
    };
    const condition = codeLine.substring(conditional.contype.length + 1, endOfCondition);
    if (condition === ""){
        return {"type": "error", "error": "conditional missing boolean condition"};
    };
    verfiedCondition = mainExpressionParser(condition, "bool");
    if (verfiedCondition.error){
        return verfiedCondition; //maybe expand error message?
    };
    if (codeLine.charAt(codeLine.length - 1) === "{"){
        return conditionalWriter(conditional, condition);
    };
    return {"id": "error", "type": "error", "error": "syntax missing { at end of line"};
};

function varHandler(varJson, codeLine){
    //console.log("varhandler codeline: " + codeLine);
    if (varJson.operator){
        const name = codeLine.substring(varJson.type.length, varJson.operator);
        if (lookUpVar(name).type !== "error"){
            return {"type": "error", "error": name + " already created"};
        };
        const verifiedName = verifyName(name);
        if (verifiedName.type === "error"){
            return verifiedName;
        };  
        const expression = codeLine.substring(varJson.operator + 1);
        //console.log(expression);
        console.log("varJson type: " + varJson.type);
        const exprType = mainExpressionParser(expression, varJson.type);
        //console.log(exprType);
        if (exprType.error){
            return exprType;
        };
        if (varJson.type === exprType.type){
            variables[variables.length - 1].push({"type": varJson.type, "name": name});
            //console.log("returns varwriter: " + name + " wti expression " + expression);
            return varWriter({...varJson, "name": name}, expression);
        };
        //console.log(exprType);
        return {"id": "error", "type": "error", "error": "type mismatch "+  "1" + varJson.type + " 23" + exprType.type};
    }
    else{
        const operator = codeLine.indexOf("=");
        if (operator > 0){
        //console.log("det her sker!!!");
        //console.log(operator);  
            const name = codeLine.substring(0, operator);
            //console.log("name: " + name);
            const verifiedVar = lookUpVar(name);
            //console.log(verifiedVar);
            if (verifiedVar.error){
                return verifiedVar;
            };
            const expression = codeLine.substring(operator + 1);
            const exprType = mainExpressionParser(expression, varJson.type);
            //console.log("expression: " + expression);
            //console.log("exprType: " + exprType.type);
            if (exprType.type === "error"){
                return exprType;
            };
            if (verifiedVar === exprType.type){
                //console.log("returns varwriter uden op: " + name);
                return varWriter({...varJson, "name": name}, expression);
            };
            return {"id": "error", "type": "error", "error": "type mismatch 1" + verifiedVar + " 2" + exprType.type};
        };
        return {"id": "error", "type": "error", "error": "missing operator ="};
    };
};

//return {...functions[func], "id": "call", "operator": exprIndex};
function functionCallParser(func, codeLine){
    const args = functionCallArgHandler(func, codeLine);
    if (args.error){
        return args;
    };
    return functionCallWriter(codeLine);
};

function lineController(codeLines){
    //reset all current variables
    variables = [[]];
    functions = [];
    let indentLvl = 0;

    for (codeLine in codeLines){
        if (codeLines[codeLine] !== ""){
            const lineJson = mainLineIdentifier(codeLines[codeLine]);
            switch (lineJson.id){
                case "end":
                    indentLvl -= 1;
                    variables.pop();
                    console.log("};");
                    break;
                case "error":
                    console.log(lineJson);
                    break;
                case "var":
                    console.log(varHandler(lineJson, codeLines[codeLine], parseInt(codeLine)));
                    break;
                case "function":
                    indentLvl += 1;
                    variables.push([])
                    console.log(functionDeclarationHandler(lineJson, codeLines[codeLine]));
                    break;
                case "conditional":
                    indentLvl += 1;
                    variables.push([])
                    console.log(conditionalParser(lineJson, codeLines[codeLine]));
                    break;
                case "call":
                    console.log(functionCallHandler(lineJson.name, codeLines[codeLine]));
                    break;
                case "return":
                    console.log(returnParser(codeLines[codeLine].substring(6)));
                    break;
                default:
                    console.log("no controller found");
            };
        };
    };
    if (indentLvl !== 0){
        return {"id": "error", "type": "error", "error": "missing }"};
    };
};

//Handles return statements
function returnParser(returnStr){
    if (returnStr.length > 0){
        if (functions[functions.length - 1].type !== "void"){
            //console.log(functions[functions.length - 1].type);
            const exprType = mainExpressionParser(returnStr, functions[functions.length - 1].type);
            if(exprType.error){
                return exprType;
            }
            if (functions[functions.length - 1].type === exprType.type){
                return returnWriter(returnStr);
            };
            return {"id": "error", "type": "error", "error": "return function type mismatch"};
        };
        return {"id": "error", "type": "error", "error": "return type void cannot return"};
    };
    return {"id": "error", "type": "error", "error": "missing statement after return"};
};

function mainLineIdentifier(codeLine){
    if (codeLine === "}"){
        return {"id": "end"};
    };
    if (codeLine.startsWith("return")){
        return {"id": "return"};
    };
    for (simpl in simplType){
        if (codeLine.startsWith(simplType[simpl].id)){
            //console.log("lineid: " + codeLine);
            const exprVarIndex = codeLine.indexOf("=");
            const exprFunctionIndex = codeLine.indexOf("(");
            if (exprVarIndex > 0 && (exprVarIndex < exprFunctionIndex || exprFunctionIndex < 0)){
                return {"id": "var", "type": simplType[simpl].id, "operator": exprVarIndex};
            }else if (exprFunctionIndex > 0 && (exprFunctionIndex < exprVarIndex || exprVarIndex < 0)){
                return {"id": "function", "type": simplType[simpl].id, "operator": exprFunctionIndex};
            };
            return {"id": "error", "type": "error", "error": "var or func?"};
        };
    };
    for (simpl in simplConditional){
        if (codeLine.startsWith(simplConditional[simpl].id + "(")){
            return {"id": "conditional", "type": "conditional", "contype": simplConditional[simpl].id};
        };
    };
    for (stack in variables){
        //console.log(variables);
        for (vars in variables[stack]){
            //console.log("stack[vars].name :" + variables[stack][vars].name);
            //console.log("codeline: " + codeLine);
            if(codeLine.startsWith(variables[stack][vars].name)){
                return {...variables[stack][vars], "id": "var"};
            };
        };
    };
    for (func in functions){
        if(codeLine.startsWith(functions[func].name)){
            return {...functions[func], "id": "call", "operator": exprIndex};
        };
    };
    //console.log("codeline: " + codeLine)
    return {"id": "error", "type": "error", "error": "keyword not found"};
};

function functionCallArgParser(func, argsStr){
    let argsList = [];
    if(argsStr !== ""){
        argsList = argsStr.split(",");
    };
    if (func.args.length !== argsList.length){
        return {"id": "error", "type": "error", "error": "wrong number of arguments"};
    };
    for (call in argsList){
        const exprType = mainExpressionHandler(argsList[call], func.args[call].type);
        if (exprType.error){
                return exprType;
        };
        if (func.args[call] === "int"){
            if (exprType.int !== "ok"){
                return {"id": "error", "type": "error", "error": "function argument type mismatch"};
            };
        };
        if (func.args[call] === "bool"){
            if (exprType.bool !== "ok"){
                return {"id": "error", "type": "error", "error": "function argument type mismatch"};
            };
        };
    };
    return {"args": "ok"};
};

function functionCallParser(func, codeLineList, codeLineIndex){
    const FuncCallArgsEnd = codeLineList[codeLineIndex].charAt(codeLineList[codeLineIndex].length - 1);
    if(FuncCallArgsEnd === ")"){
        const args = functionCallArgParser(func, codeLineList[codeLineIndex].substring(func.operator + 1, codeLineList[codeLineIndex].length - 1));//update?
        if (args.args){
            return func;
        };
        return args;
    };
    let arguments = codeLineList[codeLineIndex].substring(func.operator);
    for (let i = codeLineIndex + 1; i < codeLineList.length; i++){
        const FuncCallArgsEnd = codeLineList[codeLineIndex].charAt(codeLineList[codeLineIndex].length - 1);
        if(FuncCallArgsEnd === ")"){
            const args = functionCallArgParser(func, arguments + codeLineList[codeLineIndex].pop()); //virker?
            if (args.args){
                return func;
            };
            return args;
        }
        
    }
    return {"id": "error", "type": "error", "error": "missing ) in function call"};
};

function expressionParser(expression){
    const sampleChar = expression.charAt(0);
    if (sampleChar === "-" || testChar(sampleChar, numbers)){
        for (let i = 1; i < expression.length; i++){
            if(!testChar(expression.charAt(i), numbers)){
                return {"type": "error", "error": "unexpected character " + nextChar};
            };
        };
        return {"type": "int"};
    }
    else if (testChar(sampleChar, letters)){
        const funcArgIndex = expression.indexOf("(");
        if (funcArgIndex > 0){
            const functionName = expression.substring(0, funcArgIndex);
            const func = functionLookup(functionName);
            if (func.error){
                return func;
            };
            return {...func, "id": "call", "operator": funcArgIndex, };//retrun function call here?
        };
        if (expression === "true" || expression === "false"){
            return {type: "bool"};
        };
        //console.log("expression: " + expression);
        const variable = lookUpVar(expression);
        //console.log(variable);
        if (variable.error){
            return variable;
        };
        //console.log("vartype: " + variable);
        return {"type": variable};
    };
    return {"type": "error", "error": "unexpected char " + sampleChar};
};


//ingen minus variable

function intExpressionParser(expression){
    const exprList = splitOnOperator(expression, intOperators);
    //console.log(exprList);
    if (exprList[0] === "-"){
        exprList.shift();
        exprList[0] = "-" + exprList[0];
    };
    let operatorSwitch = false;
    for (expr in exprList){
        if (operatorSwitch){
            if (!(testChar(exprList[expr], intOperators))){
                return {"type": "error", "error": "operator expected found " + exprList[expr]};
            };
            operatorSwitch = false;
        }
        else {
            //console.log(exprList[expr]);
            const exprType = expressionParser(exprList[expr]);
            if(exprType.id === "call"){
                const functionCall = functionCallParser(exprType, exprList, expr);
                if(functionCall.type === "int"){
                    operatorSwitch = true;
                    expr = functionCall.newIndex;
                }
                else{
                    return exprType;
                };
                //find end of function
                //parse function call part
                //parse rest
                //operatorSwitch = true;
            }
            else if (exprType.type === "int"){
                operatorSwitch = true;
            } 
            else{
                return exprType;
            };
        };
    };
    if (!operatorSwitch){ //could be moved to top checking from the start if last char is operator
        return {"type": "error", "error": "int expression ending in operator"};
    };
    //return string to be written?
    return {"type": "int"};
};

function boolExpressionParser(expression){
    //console.log(expression);
    const exprList = splitOnOperator(expression, boolOperators);
    let operatorSwitch = false;
    for (expr in exprList){
        if (operatorSwitch){
            if (!(testChar(exprList[expr], boolOperators))){
                return {"type": "error", "error": "operator expected found " + exprList[expr]};
            };
            operatorSwitch = false;
        }
        else{
            const exprType = expressionParser(exprList[expr]);
            //console.log(exprType);
            if(exprType.id === "call"){
                const functionCall = functionCallParser(exprType, exprList, expr);
                if(functionCall.type === "bool" || functionCall.type === "int"){
                    operatorSwitch = true;
                    expr = functionCall.newIndex;
                }
                else{
                    return exprType;
                };
        
            }
            else if (exprType.type === "int" || exprType.type === "bool"){
                operatorSwitch = true;
            } 
            else{
                return {"type" : exprType};
            };/*
            console.log(exprType);
            if (exprType.error){
                const intExprType = intExpressionParser(exprList[expr]);
                if (intExprType.error){
                    return intExprType; //or exprType
                };
            };
            operatorSwitch = true;*/
        };
    };
    return {"type": "bool"};
};

function mainExpressionParser(expression, expectedType){
    switch (expectedType){
        case "int":
            return intExpressionParser(expression);
        case "bool":
            return boolExpressionParser(expression);
        default:
            return {"type": "error", "error": "unexpected type " + expectedType};
    };
};
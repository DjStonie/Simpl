function conditionalParser(conditional, codeLine){
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
        const exprType = mainExpressionParser(expression, varJson.type);
        if (exprType.error){
            return exprType;
        };
        if (varJson.type === exprType.type){
            console.log(codeLine);
            console.log(variables);
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
            return {"id": "error", "type": "error", "error": "type mismatch  expected " + verifiedVar + " found " + exprType.type};
        };
        return {"id": "error", "type": "error", "error": "missing operator ="};
    };
};

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

    for (let codeLine = 0; codeLine < codeLines.length; codeLine++){
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
                    console.log(varHandler(lineJson, codeLines[codeLine]));
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
                    console.log(functionCallParser(lineJson, codeLines[codeLine]));
                    break;
                case "return":
                    console.log(returnParser(codeLines[codeLine].substring(6)));
                    break;
                case "ccode":
                    const ccode = cParser(codeLines, codeLine);
                    codeLine = ccode[1];
                    console.log(ccode[0]);
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
    if (codeLine === "c{"){
        return {"id": "ccode"};
    };
    if (codeLine.startsWith("return")){
        return {"id": "return"};
    };
    for (simpl in simplType){
        if (codeLine.startsWith(simplType[simpl].id)){
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
        for (vars in variables[stack]){
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
        const exprType = mainExpressionParser(argsList[call], func.args[call].type);
        if (exprType.error){
                return exprType;
        };
        if (func.args[call].type === "int"){
            if (exprType.type !== "int"){
                return {"id": "error", "type": "error", "error": "function argument type mismatch"};
            };
        };
        if (func.args[call].type === "bool"){
            if (exprType.type !== "bool"){
                return {"id": "error", "type": "error", "error": "function argument type mismatch"};
            };
        };
    };
    return {"args": "ok"};
};

function functionCallParser(func, codeLineList, codeLineIndex){
    const funcCallArgsEnd = codeLineList[codeLineIndex].charAt(codeLineList[codeLineIndex].length - 1);
    if(funcCallArgsEnd === ")"){
        const args = functionCallArgParser(func, codeLineList[codeLineIndex].substring(func.operator + 1, codeLineList[codeLineIndex].length - 1));//update?
        if (args.args){
            return func;
        };
        return args;
    };
    let arguments = codeLineList[codeLineIndex].substring(func.operator + 1);
    for (let i = parseInt(codeLineIndex) + 1; i < codeLineList.length; i++){
        const funcCallArgsEnd = codeLineList[i].charAt(codeLineList[i].length - 1);
        if(funcCallArgsEnd === ")"){
            const args = functionCallArgParser(func, arguments + codeLineList[i].substring(0, codeLineList[i].length - 1));
            if (args.args){
                return {...func, "newindex": i};
            };
            return args;
        };
        arguments +=  codeLineList[i];
    };
    return {"id": "error", "type": "error", "error": "missing ) in function call"};
};

function expressionParser(expression){
    const sampleChar = expression.charAt(0);
    if (sampleChar === "-" || testChar(sampleChar, numbers)){
        for (let i = 1; i < expression.length; i++){
            if(!testChar(expression.charAt(i), numbers)){
                return {"id": "error", "type": "error", "error": "unexpected character expected number got " + expression.charAt(i)};
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
            return {...func, "id": "call", "operator": funcArgIndex};
        };
        if (expression === "true" || expression === "false"){
            return {type: "bool"};
        };
        const variable = lookUpVar(expression);
        if (variable.error){
            return variable;
        };
        return {"type": variable};
    };
    return {"id": "error", "type": "error", "error": "unexpected char " + sampleChar};
};
//ingen minus variable

function intExpressionParser(expression){
    const exprList = splitOnOperator(expression, intOperators);
    if (exprList[0] === "-"){
        exprList.shift();
        exprList[0] = "-" + exprList[0];
    };
    let operatorSwitch = false;
    for (let expr = 0; expr < exprList.length; expr++){
        if (operatorSwitch){
            if (!(testChar(exprList[expr], intOperators))){
                return {"type": "error", "error": "operator expected found " + exprList[expr]};
            };
            operatorSwitch = false;
        }
        else {
            const exprType = expressionParser(exprList[expr]);
            if(exprType.id === "call"){
                const functionCall = functionCallParser(exprType, exprList, expr);
                if(functionCall.type === "int"){
                    operatorSwitch = true;
                    expr = functionCall.newindex;
                }
                else{
                    return functionCall;
                };
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
    if (operatorSwitch){
        return {"type": "int"};
    };
    return {"id": "error", "type": "error", "error": "missing expression"};
};

function boolExpressionParser(expression){
    const exprList = splitOnOperator(expression, boolOperators);
    let operatorSwitch = false;
    if(exprList.length === 1){
        return expressionParser(expression);
    }
    for (let expr = 0; expr < exprList.length; expr++){
        if (operatorSwitch){
            if (!(testChar(exprList[expr], boolOperators))){
                return {"type": "error", "error": "operator expected found " + exprList[expr]};
            };
            operatorSwitch = false;
        }
        else{
            const exprType = expressionParser(exprList[expr]);

            if(exprType.id === "call"){
                const functionCall = functionCallParser(exprType, exprList, expr);
                if(functionCall.type === "bool" || functionCall.type === "int"){
                    operatorSwitch = true;
                    expr = functionCall.newindex;
                }
                else{
                    return functionCall;
                };     
            }
            else if (exprType.type === "int" || exprType.type === "bool"){
                operatorSwitch = true;
            } 
            else{
                return exprType;
            };
        };
    };
    if (operatorSwitch){
        return {"type": "bool"};
    }
    return {"id": "error", "type": "error", "error": "missing expression"};
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
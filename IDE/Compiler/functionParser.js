function functionWriter(newFunc, args, name){
    return newFunc.type + " " + name + "(" + args + "){";
};

function functionCallWriter(str){
    return str + ";";
};

function returnWriter(returnStr){
    return "return " + returnStr + ";";
};

function functionLookup(name){
    for (func in functions){
        if(functions[func].name === name){
            return functions[func];
        };
    };
    return {"type": "error", "error": "function not found " + name};
};

function functionHandler(func, line){
    if (func.functiontype === "call"){
        return functionCallHandler(func, line);
    }
    return functionDeclarationHandler(func, line);
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

function functionArgHandler(argStr){
    if (argStr.length > 0){
        const argList = argStr.split(",");
        let arguments = [];
        for (arg in argList){
            for (rule in simplType){
                if (argList[arg].startsWith(simplType[rule].id)){
                    if (simplType[rule].id === "void"){
                        return {"type": "error", "error": "arg cannot be of type void"};
                    };
                    const varType = simplType[rule].id;
                    const varName = argList[arg].substring(varType.length);
                    if(lookUpVar(varName).error){
                        isNameOk = verifyName(varName);
                        if(isNameOk.error){
                            return isNameOk;
                        };
                        variables[variables.length - 1].push({"type": varType, "name": varName});
                        arguments.push({"type": varType, "name": varName});
                    }
                    else{
                        return {"type": "error", "error": "arg - variable with same name already declared"};
                    };
                };
            };
        };
        return arguments;
    };
    return [];
};

function functionDeclarationHandler(newFunc, line){
    if(line.charAt(line.length - 1) === "{"){
        const argEndIndex = line.indexOf(")");
        if (argEndIndex < 0){
            return {"type": "error", "error": "function syntax - missing )"};
        };
        const name = line.substring(newFunc.type.length, newFunc.operator);
        const verifiedName = verifyName(name);
        if (verifiedName.error){
            return verifiedName;
        };
        const argsStr = line.substring(newFunc.operator + 1, argEndIndex);
        const args = functionArgHandler(argsStr);
        if (args.error){
            return args;
        };
        functions.push({...newFunc, "args": args, "name": name});
        return functionWriter(newFunc, argsStr, name);
    }
    else{
        return {"type": "error", "error": "syntax missing { at end of line"};
    };
};

/*
function functionCallParser(func, codeLine){
    const args = functionCallArgHandler(func, codeLine);
    if (args.error){
        return args;
    };
    return functionCallWriter(codeLine);
};
*/

/*
//Handles return statements
function returnHandler(returnStr){
    if (returnStr.length > 0){
        if (functions[functions.length - 1].functiontype !== "void"){
            const exprType = expressionHandler(returnStr, functions[functions.length - 1].functiontype);
            if(exprType.error){
                return exprType;
            }
            if (functions[functions.length - 1].functiontype === exprType.type){
                return returnWriter(returnStr);
            };
            return {"type": "error", "error": "return function type mismatch"};
        };
        return {"type": "error", "error": "return type void cannot return"};
    };
    return {"type": "error", "error": "missing statement after return"};
};
*/
/*
function functionCallArgHandler(func, callStr){
    callStr = callStr.substring(callStr.indexOf("(") + 1, callStr.indexOf(")"));
    let callList = [];
    if(callStr !== ""){
        callList = callStr.split(",");
    };
    if (func.args.length !== callList.length){
        return {"type": "error", "error": "wrong number of arguments"};
    };
        //console.log(func.args);
        //console.log(callList);
    for (call in callList){
        const exprType = expressionHandler(callList[call], func.args[call].vartype);
        if (exprType.error){
                return exprType;
        };
        if (func.args[call] === "int"){
            if (exprType.int !== "ok"){
                return {"type": "error", "error": "function argument type mismatch"};
            };
        };
        if (func.args[call] === "bool"){
            if (exprType.bool !== "ok"){
                return {"type": "error", "error": "function argument type mismatch"};
            };
        };
    };
    return {"args": "ok"};
};

function functionCallHandler(name, callStr){
    const func = functionLookup(name.name);
    if (func.error){
        return func;
    };
    const args = functionCallArgHandler(func, callStr);
    if (args.error){
        return args;
    };
    return functionCallWriter(callStr);
};
*/
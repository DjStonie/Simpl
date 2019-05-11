function functionWriter(newFunc, args, name){
    return newFunc.functiontype + " " + name + "(" + args + "){";
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
    }
    const args = functionCallArgHandler(func, callStr);
    if (args.error){
        return args;
    };
    return functionCallWriter(callStr);
};

function functionArgHandler(argStr){
    if (argStr.length > 0){
        variables.push([]);
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
                        variables[variables.length - 1].push({"vartype": varType, "name": varName});
                        arguments.push({"vartype": varType, "name": varName});
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
        //const argStartIndex = line.indexOf("(");
        const argEndIndex = line.indexOf(")");
        if (argEndIndex < 0){
            return {"type": "error", "error": "function syntax - missing )"};
        };
        const name = line.substring(newFunc.functiontype.length, newFunc.operator);
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

function functionHandler(func, line){
    if (func.functiontype === "call"){
        return functionCallHandler(func, line);
    }
    return functionDeclarationHandler(func, line);
};
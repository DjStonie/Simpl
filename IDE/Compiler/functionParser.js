//Creates a string with a function declaration
//newFunc = function-json with information on a function declaration
//args = string with the argument part of a function declaration
//name = string with name of function
//return = string with translated Simpl
function functionWriter(newFunc, args, name){
    return newFunc.type + " " + name + "(" + args + "){";
};
//Creates a string with a function call
//functionCallStr = string with function call
//return = string with translated Simpl
function functionCallWriter(functionCallStr){
    return correctBoolExprForC(functionCallStr) + ";";
};
//Creates a string with a return statemeent
//returnStr = string with return statement
//return = string with translated Simpl
function returnWriter(returnStr){
    return "return " + correctBoolExprForC(returnStr) + ";";
};
//Switches between function declarations and calls
//func = function-json with information about function declaration or call
//codeLine = current line of code where function declaration or call was found
function functionHandler(func, codeLine){
    if (func.functiontype === "call"){
        return functionCallHandler(func, codeLine);
    }
    return functionDeclarationHandler(func, codeLine);
};

//Parses return statements
//returnStr = the expression part of a Simpl return statement
//return = string from returnWriter med translated Simpl or error
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
//Parses standard function calls
//func = function-json with information the function call
//codeLine = line of code where a function call was found
function functionCallHandler(func, codeLine){
    if (codeLine.charAt(codeLine.length - 1) === ")"){
        const argStr = codeLine.substring(func.operator + 1, codeLine.length - 1);
        args = functionCallArgParser(func, argStr);
        if (args.args === "ok"){
            return functionCallWriter(codeLine);
        };
        return args;
    };
    return {"id": "error", "type": "error", "error": "missing ) in function call"};
};
//Parses argument part of function calls
//func = function-json with information the function call
//argsStr = string with argument part of function declaration
//return = {"args": "ok"} if arguments are ok or error
function functionCallArgParser(func, argsStr){
    let argsList = [];
    if(argsStr !== ""){
        argsList = argsStr.split(",");
    };
    if (func.args.length !== argsList.length){
        return {"id": "error", "type": "error", "error": "wrong number of arguments - found " + argsList.length + " need " + func.args.length + " for function " + func.name};
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
//Parses function calls found within expression
//func = function-json with information the function call
//codeLineList = List of current line of code split by type operators
//codeLineIndex = index of current line of Simpl code
//return = function-json if function call is ok or error
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
    for (let i = parseInt(codeLineIndex) + 1; i < codeLineList.length; i++){ //needed parseint?
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
//Parses argument part of function declaration
//argStr = string argument part of function declaration
//return = List of argument variabel types and names
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
                    if(variableLookup(varName).error){
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
//Parses a function declaration
//newfunc = function-json with information the function call
//line = string with Simpl code identified as a function declaration
//return = string from functionWriter with translated Simpl or error
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
        if (variableLookup(name).type !== "error"){  
            return {"id": "error", "type": "error", "error": "variable " + name + " already created"};
        };
        if (functionLookup(name).type !== "error"){
            return {"id": "error", "type": "error", "error": "function " + name + " already created"};
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
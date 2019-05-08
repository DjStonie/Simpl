function functionWriter(newFunc, args, name){
    return newFunc.functiontype + " " + name + "(" + args + "){";
};

function functionArgHandler(argStr){
    const argList = argStr.split(",");
    for (arg in argList){
        for (rule in simplType){
            if (argList[arg].startsWith(simplType[rule].id)){
                if (simplType[rule].id === "void"){
                    return {"type": "error", "error": "arg cannot be of type void"};
                };
                const varType = simplType[rule].id;
                const varName = argList[arg].substring(varType.length + 1);
                if(lookUpVar(varName).error){
                    isNameOk = verifyName(varName);
                    if(isNameOk.error){
                        return isNameOk;
                    };
                    variables[0].push({"vartype": newVar.vartype, "name": name});
                }
                else{
                    return {"type": "error", "error": "arg - variable with same name already declared"};
                };
            };
        };
    };
    return {"args": "ok"};
};

function functionHandler(newFunc, line){
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
        const args = line.substring(newFunc.operator + 1, argEndIndex);
        if(args !== ""){
            const argCheck = functionArgHandler(args);
            if (argCheck.error){
                return argCheck;
            };
        };
        return functionWriter(newFunc, args, name);
    }
    else{
        return {"type": "error", "error": "syntax missing { at end of line"};
    };
};

//hvordan kaldes funktioner?
//look for return if not void
function stringExpressionParser(expression){
    const exprList = splitOnOperator(expression, stringOperators);
    let cantBeOperator = true;
    if(testChar(exprList[exprList.length - 1], stringOperators)){
        return {"type": "error", "error": "unexpected operator - String expression ending in operator"}
    };
    for (let expr = 0; expr < exprList.length; expr++){
        const nextChar = exprList[expr].charAt(0);
        if (testChar(nextChar, stringOperators)){
            if (cantBeOperator){
                return {"type": "error", "error": "unexpected operator", "char": nextChar};
            }
            else{
                cantBeOperator = true;
            };
        }
        else{
            const exprType = expressionParser(exprList[expr]);

            if(exprType.id === "call"){
                const functionCall = functionCallParser(exprType, exprList, expr);
                if(functionCall.type === "string"){
                    cantBeOperator = false;
                    expr = functionCall.newindex;
                }
                else{
                    return functionCall;
                };     
            }
            else if (exprType.type === "string"){
                cantBeOperator = false;
            } 
            else{
                return exprType;
            };
        };
    };
    if (!cantBeOperator){
        return {"type": "string"};
    };
    return {"id": "error", "type": "error", "error": "missing string expression"};
};
/*
function verifyStringExpr(expression){
    const exprList = splitOnOperator(expression, stringOperators);
    let cantBeOperator = true;
    if(testChar(exprList[exprList.length - 1], stringOperators)){
        return {"type": "error", "error": "unexpected operator - String ending in operator"}
    };

    for (let expr = 0; expr < exprList.length; expr++){
        const nextChar = exprList[expr].charAt(0);
        if (testChar(nextChar, stringOperators)){
            if (cantBeOperator){
                return {"type": "error", "error": "unexpected operator", "char": nextChar};
            }
            else{
                cantBeOperator = true;
            };
        }
        else if (nextChar === "\"" && exprList[expr].charAt(exprList[expr].length-1) === "\""){
            cantBeOperator = false;
        }
        else if (testChar(nextChar, letters)){
            funcOperator = exprList[expr].indexOf("(");
            if (funcOperator > 0){
                const func = functionLookup(exprList[expr].substring(0, funcOperator));
                if (func.error){
                    return func;
                }
                if (func.functiontype === "string"){
                    const args = functionCallArgHandler(func, expression);
                    if (args.error){
                        return args;
                    };
                    funcEnd = expression.indexOf(")");
                    if(expression.length > funcEnd + 1){
                        return verifyStringExpr("0" + expression.substring(funcEnd + 1, expression.length));
                    }
                    return {"type": "string"};
                }
                else {
                    return {"type": "error", "error": "type mismatch "+ func.name + " does not return a string"};
                };
            }
            else {     
                const varType = lookUpVar(exprList[expr]);
                if (varType.error){
                    return varType;
                };
                if (varType !== "string"){
                    return {"type": "error", "error": "type mismatch "+ exprList[expr] + " does not return a string"};
                };
                if (varType === "string"){
                    cantBeOperator = false;
                };
            };
        }else{
            return {"type": "error", "error": "String must start and end with \""};
        };
    };
    return {"type": "string"};
};*/
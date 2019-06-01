//Parses a Simpl string expression
//expression = expression identified as being a string
//return = {"type": "string"} if type of expression is string
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
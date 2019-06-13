//parses an int expression
//expression = expression identified as having int type
//return = {"type": "int"} if tpe is int or error
function intExpressionParser(expression){
    const exprList = splitOnOperator(expression, intOperators);
    if (exprList[0] === "-"){
        exprList.shift();
    };
    let operatorSwitch = false;
    for (let expr = 0; expr < exprList.length; expr++){
        if (operatorSwitch){
            if (!(testChar(exprList[expr], intOperators))){
                return {"id": "error", "type": "error", "error": "operator expected found " + exprList[expr]};
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
    if (!operatorSwitch){
        return {"id": "error", "type": "error", "error": "int expression ending in operator"};
    };
    if (operatorSwitch){
        return {"type": "int"};
    };
    return {"id": "error", "id": "error", "type": "error", "error": "missing expression"};
};
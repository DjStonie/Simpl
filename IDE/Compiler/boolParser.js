//looks for af boolean operator on each side of an expression
//expr = index of where expression is found
//exprList = List of expressions split buy boolean operators
//return = true if there is a boolean operator on either side of expression exprList[expr]
function findBoolOperator(expr, exprList){
    const followingIndexIsAnOp = expr < exprList.length - 1 && testChar(exprList[expr + 1], boolOperators);
    const leadingIndexIsAnOp = expr - 1 > 0 && testChar(exprList[expr - 1], boolOperators);
    return followingIndexIsAnOp || leadingIndexIsAnOp;
};
//Corrects syntax from Simpl to C. Doubling up on appropriate bool operators
//expression = expression to be corrected
//return = string with corrected syntax
function correctBoolExprForC(expression){
    for(let i = 0; i < expression.length; i++){
        currentChar = expression.charAt(i); 
        if (testChar(currentChar, ["&", "|", "="])){
            expression = expression.substring(0, i) + currentChar + expression.substring(i);
            i++;
        };
    };
    return expression;
};
//Parses a boolean expression
//expression = expression to be parsed
//return = {"type": "bool"} if expression is a bool otherwise actual type of expression or error
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
            if (testStr(exprList[expr], intOperators)) {
                const intExpr = intExpressionParser(exprList[expr]);
                if (intExpr.type !== "int"){
                    return intExpr;
                };
                operatorSwitch = true;
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
    };
    if (operatorSwitch){
        return {"type": "bool"};
    }
    return {"id": "error", "type": "error", "error": "missing expression"};
};
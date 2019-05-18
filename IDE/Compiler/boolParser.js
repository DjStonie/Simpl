function findBoolOperator(expr, exprList){
    const followingIndexIsAnOp = expr < exprList.length - 1 && testChar(exprList[expr + 1], boolOperators);
    const leadingIndexIsAnOp = expr - 1 > 0 && testChar(exprList[expr - 1], boolOperators);

    return followingIndexIsAnOp || leadingIndexIsAnOp;
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
/*
function verifyBoolExpr(expression){
    const exprList = splitOnOperator(expression, boolOperators);
    let cantBeOperator = true;

    if(testChar(exprList[exprList.length - 1], boolOperators)){
        return {"type": "error", "error": "unexpected operator - bool ending in operator"}
    };

    for (let expr = 0; expr < exprList.length; expr++){
        const nextChar = exprList[expr].charAt(0);
        if (testChar(nextChar, boolOperators)){
            if (cantBeOperator){
                return {"type": "error", "error": "unexpected operator" + nextChar, "char": nextChar};
            }
            else{
                cantBeOperator = true;
            };
        }
        else if (nextChar === "-" || testChar(nextChar, numbers)){
            const intExpr = verifyIntExpr(exprList[expr]);
            if (intExpr.type !== "int"){
                return intExpr;
            };
            if (!findBoolOperator(expr, exprList)){
                return {"type": "error", "error": "missing bool operator"};
            };
            cantBeOperator = false;
        }
        else if (testChar(nextChar, letters)){
            if (exprList[expr] === "true" || exprList[expr] === "false"){
                cantBeOperator = false;
            }
            else{
                cantBeOperator = false;
                if (testStr(exprList[expr], intOperators)){
                    const intExpr = verifyIntExpr(exprList[expr]);
                    if (intExpr.type !== "int"){
                        return intExpr;
                    };
                    if (!findBoolOperator(expr, exprList)){
                        return {"type": "error", "error": "missing bool operator"};
                    };
                }
                else{
                    funcOperator = exprList[expr].indexOf("(");
                    if (funcOperator > 0){
                        const func = functionLookup(exprList[expr].substring(0, funcOperator));
                        if (func.error){
                        return func;
                        };
                        if (func.functiontype === "bool"){
                            const args = functionCallArgHandler(func, expression);
                            if (args.error){
                                return args;
                            };
                            funcEnd = expression.indexOf(")");
                            if(expression.length > funcEnd + 1){
                                console.log("bool new expression: " +  expression.substring(funcEnd + 1, expression.length));
                                return verifyBoolExpr("true" + expression.substring(funcEnd + 1, expression.length));
                            }
                            return {"type": "bool"};
                        };
                        if (func.functiontype === "int"){
                            return {"type": "error", "error": "type mismatch "+ func.name + " returns int bool required what"};
                        };
                    }
                    else{
                        const varType = lookUpVar(exprList[expr]);
                        if (varType.error){
                            return varType;
                        }
                        else if (varType === "bool"){
                        //cantBeOperator = false;
                        }
                        else if (varType === "int"){
                            if (!findBoolOperator(expr, exprList)){
                                return {"type": "error", "error": "missing bool operator"};
                            };
                        };
                    };
                };            
            };
        };
    };
    return {"type": "bool"};
};*/
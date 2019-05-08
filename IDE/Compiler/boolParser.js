function findBoolOperator(expr, exprList){
    const followingIndexIsAnOp = expr < exprList.length - 1 && testChar(exprList[expr + 1], boolOperators);
    const leadingIndexIsAnOp = expr - 1 > 0 && testChar(exprList[expr - 1], boolOperators);

    return followingIndexIsAnOp || leadingIndexIsAnOp;
};

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
                return {"type": "error", "error": "unexpected operator", "char": nextChar};
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
                    }
                };            
            };
        };
    };
    return {"type": "bool"};
};
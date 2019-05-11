//Tests if a simpl expression results in an int result
//expr = expression to be tested
//return = {"type": "int"} if expr is an int otherwise error
function verifyIntExpr(expression){
    const exprList = splitOnOperator(expression, intOperators);
    let cantBeOperator = true;

    if (exprList[0] === "-"){
        cantBeOperator = false;
    };
    if (testChar(exprList[exprList.length - 1], intOperators)){
        return {"type": "error", "error": "int expression must end with number"};
    };
    for (expr in exprList){
        const nextChar = exprList[expr].charAt(0);
        if (testChar(nextChar, intOperators)){
            if (cantBeOperator){
                return {"type": "error", "error": "unexpected operator"};
            }
            else{
                cantBeOperator = true;
            }
        }
        else if (testChar(nextChar, numbers)){
            for (let i = 1; i < exprList[expr].length; i++){
                if(!testChar(exprList[expr].charAt(i), numbers)){
                    return {"type": "error", "error": "unexpected character " + nextChar};
                };
            };
            cantBeOperator = false;
        }
        else if(testChar(nextChar, letters)){
            funcOperator = exprList[expr].indexOf("(");
            if (funcOperator > 0){
                const func = functionLookup(exprList[expr].substring(0, funcOperator));
                if (func.error){
                    return func;
                }
                if (func.functiontype === "int"){
                    const args = functionCallArgHandler(func, expression);
                    if (args.error){
                        return args;
                    };
                    funcEnd = expression.indexOf(")");
                    if(expression.length > funcEnd + 1){
                        return verifyIntExpr("0" + expression.substring(funcEnd + 1, expression.length));
                    }
                    return {"type": "int"};
                }
                else if (func.functiontype === "bool"){
                    return {"type": "error", "error": "type mismatch "+ func.name + " returns int bool required"};
                };
            }
            else {     
                const varType = lookUpVar(exprList[expr]);
                if (varType.error){
                    return varType;
                };
                if (varType === "bool"){
                    return {"type": "error", "error": "type mismatch "+ exprList[expr] + " returns bool int required"};
                };
                if (varType === "int"){
                    cantBeOperator = false;
                };
            };
        }
        else{
            return {"type": "error", "error": "unexpected character"};
        };
    };
    return {"type": "int"};
};
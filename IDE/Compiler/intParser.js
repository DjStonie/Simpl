//Tests if a simpl expression results in an int result
//expr = expression to be tested
//return = {"type": "int"} if expr is an int otherwise error
function verifyIntExpr(expr){
    const exprList = splitOnOperator(expr, intOperators);
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
                    return {"type": "error", "error": "unexpected character"};
                };
            };
            cantBeOperator = false;
        }
        else if(testChar(nextChar, letters)){
            const varType = lookUpVar(exprList[expr]);
            if (varType.error){
                return varType;
            }
            else if (varType === "int"){
                cantBeOperator = false;
            }
        }
        else{
            return {"type": "error", "error": "unexpected character"};
        };
    };
    return {"type": "int"};
};
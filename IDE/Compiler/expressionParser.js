//Chooses parser for an expression according to the expected Simpl-type of the expression
//expression = expression to be parsed
//expectedType = expected Simpl-type of expression
//return = result of chosen parser for the expression
function mainExpressionParser(expression, expectedType){
    switch (expectedType){
        case "int":
            return intExpressionParser(expression);
        case "bool":
            return boolExpressionParser(expression);
        case "string":
            return stringExpressionParser(expression);
        default:
            return {"id": "error", "type": "error", "error": "unexpected type " + expectedType};
    };
};
//finds the type of a singular expression
//expression = singular string expression - no operators
//return = Simpl-type of expression
function expressionParser(expression){
    const sampleChar = expression.charAt(0);
    if (sampleChar === "-"){
        const parsedExpr = expressionParser(expression.substring(1));
        if (parsedExpr.type === "int"){
            return parsedExpr;
        };
        return {"id": "error", "type": "error", "error": "negative value not an int but " + parsedExpr.type + ", expression: " + expression};
    }
    else if (testChar(sampleChar, numbers)){
        for (let i = 1; i < expression.length; i++){
            if(!testChar(expression.charAt(i), numbers)){
                return {"id": "error", "type": "error", "error": "unexpected character expected number got " + expression.charAt(i)};
            };
        };
        return {"type": "int"};
    }
    else if (testChar(sampleChar, letters)){
        const funcArgIndex = expression.indexOf("(");
        if (funcArgIndex > 0){
            const functionName = expression.substring(0, funcArgIndex);
            const func = functionLookup(functionName);
            if (func.error){
                return func;
            };
            return {...func, "id": "call", "operator": funcArgIndex};
        };
        if (expression === "true" || expression === "false"){
            return {"type": "bool"};
        };
        const variable = variableLookup(expression);
        if (variable.error){
            return variable;
        };
        return {"type": variable};
    }
    else if (sampleChar === "\""){
        if (expression.charAt(expression.length - 1) !== "\""){
            return {"id": "error", "type": "error", "error": "string must end in \""};
        };
        for (let i = 1; i < expression.length - 1; i++){
            const nextChar = expression.charAt(i);
            if (!(testChar(nextChar, letters) || testChar(nextChar, numbers))){
                return {"id": "error", "type": "error", "error": "unexpected char expected letter or number got " + nextChar};
            };
        };
        return {"type": "string"};
    };
    return {"id": "error", "type": "error", "error": "unexpected char unknown char " + sampleChar};
};
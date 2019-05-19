function conditionalParser(conditional, codeLine){
    const endOfCondition = codeLine.indexOf(")");
    if (endOfCondition < 0){
        return {"id": "error", "type": "error", "error": "conditional syntax - missing )"};
    };
    const condition = codeLine.substring(conditional.contype.length + 1, endOfCondition);
    if (condition === ""){
        return {"id": "error", "type": "error", "error": "conditional missing boolean condition"};
    };
    verfiedCondition = mainExpressionParser(condition, "bool");
    if (verfiedCondition.error){
        return verfiedCondition; //maybe expand error message?
    };
    if (codeLine.charAt(codeLine.length - 1) === "{"){
        return conditionalWriter(conditional, condition);
    };
    return {"id": "error", "type": "error", "error": "syntax missing { at end of line"};
};

//maybe doesnt need to test - just write
function conditionalWriter(conditional, condition){
    switch(conditional.contype){
        case "if":
            const newLine = conditional.contype + " (" + condition + "){";
            return newLine;
            break;             
        case "for":
            return {"id": "error", "type": "error", "error": "internal error conditionalWriter - no match - for"};
            break;
        case "while":
            const newLine2 = conditional.contype + " (" + condition + "){";
            return newLine2;
            break;
        };
    return {"id": "error", "type": "error", "error": "internal error conditionalWriter - no match"}
};
/*
function conditionalHandler(conditional, codeLine, codeArray){
    const endOfCondition = codeArray[codeLine].indexOf(")");
    if (endOfCondition < 0){
        return {"type": "error", "error": "conditional syntax - missing )"};
    };
    const condition = codeArray[codeLine].substring(conditional.contype.length + 1, endOfCondition);
    if (condition === ""){
        return {"type": "error", "error": "conditional missing boolean condition"};
    };
    verfiedCondition = verifyBoolExpr(condition);
    if (verfiedCondition.error){
        return verfiedCondition; //maybe expand error message?
    };
    if (codeArray[codeLine].charAt(codeArray[codeLine].length - 1) === "{"){
        return conditionalWriter(conditional, condition);
    };
    return {"type": "error", "error": "syntax missing { at end of line"};
};*/
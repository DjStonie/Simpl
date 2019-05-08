/*
function nestedHandler(codeLine, codeArray){
    while(codeArray[codeLine] !== "}"){
        if (codeArray[codeLine].indexOf("{") > 0){

        }
    }
};
*/
function conditionalWriter(conditional, condition){
    switch(conditional.contype){
        case "if":
            const newLine = conditional.contype + " (" + condition + "){\n";
            return newLine;
            break;             
        case "for":
            break;
        case "while":
            break;
        };
    return {"type": "error", "error": "internal error conditionalWriter - no match"}
};

function conditionalHandler(conditional, codeLine, codeArray){
    const endOfCondition = codeArray[codeLine].indexOf(")");
    if (endOfCondition < 0){
        return {"type": "error", "error": "conditional syntax - missing )"};
    };
    const condition = codeArray[codeLine].substring(conditional.contype.length + 1, endOfCondition);
    verfiedCondition = verifyBoolExpr(condition);
    if (verfiedCondition.error){
        return verfiedCondition; //maybe expand error message?
    };
    if (codeArray[codeLine].charAt(codeArray[codeLine].length - 1) === "{"){
        return conditionalWriter(conditional, condition);
    }
    else{
        return {"type": "error", "error": "syntax missing { at end of line"};
    };
};
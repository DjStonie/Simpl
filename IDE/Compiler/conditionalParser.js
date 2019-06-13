//Parses a conditional
//conditional = conditional-json information
//codeLine = string with the line of code where conditional was found
//return = string with translated code, produced by writer or error
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
        return verfiedCondition;
    };
    if (codeLine.charAt(codeLine.length - 1) === "{"){
        return conditionalWriter(conditional, condition);
    };
    return {"id": "error", "type": "error", "error": "syntax missing { at end of line"};
};

//Writes a conditional to string
//conditional = conditional-json information
//condition = the condition part of a conditional
//return = string with translated code according to type of conditional or error
function conditionalWriter(conditional, condition){
    condition = correctBoolExprForC(condition);
    switch(conditional.contype){
        case "if":
            const newLine = conditional.contype + " (" + condition + "){";
            return newLine;           
        case "for":
            return {"id": "error", "type": "error", "error": "internal error conditionalWriter - no match - for"};
        case "while":
            const newLine2 = conditional.contype + " (" + condition + "){";
            return newLine2;
        };
    return {"id": "error", "type": "error", "error": "internal error conditionalWriter - no match"};
};
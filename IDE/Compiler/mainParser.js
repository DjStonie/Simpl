//GLOBAL
const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const numbers = ["0","1","2","3","4","5","6","7","8","9"];
const intOperators = ["+","-","/","*"];
const boolOperators = ["=",">","<","&","|"];
const simplType = [{"id": "int"}, {"id": "void"}, {"id": "bool"}];
const simplConditional = [{"id": "while"}, {"id": "for"}, {"id": "if"}]

let variables = [[]]; //all current variables

//Chooses correct handler according to the expected type
//expr = expression to be passed to correct handler
//typeExpected = the expected type of expr
//return =  result of specific handler or error if no handler could be found
function expressionHandler(expr, typeExpected){
    switch (typeExpected){
        case "int":
            //return intExpressionHandler(expr);
            return verifyIntExpr(expr);
            break;
        case "bool":
            return verifyBoolExpr(expr);
            break;
    };
    return {"type": "error", "error": "internal - could not find handler for expression"}
};

//Identifies contents of a line of simpl code
//line = string with a simpl code line
//return = json with information about type simpl code
function lineIdentifier(line){
    if (line === "}"){
        return {"type": "end"};
    };
    for (rule in simplType){
        if (line.startsWith(simplType[rule].id)){
            if (simplType[rule].id === "void"){
                const endOfName = line.indexOf("(");
                if (endOfName > 0){
                    return {"type": "function", "functiontype": simplType[rule].id};
                };
                return {"type": "error", "error": "void but no function"};
            };
            if(line.charAt(simplType[rule].id.length) === "["){
                return {"type": "list", "listtype": simplType[rule].id, "operator": simplType[rule].id.length};
            };
            //test for function or variable declaration
            for (let i = simplType[rule].id.length; i < line.length; i++){
                if (line.charAt(i) === "("){
                    return {"type": "function", "functiontype": simplType[rule].id, "operator": i};
                };
                if (line.charAt(i) === "="){
                    return {"type": "var", "vartype": simplType[rule].id, "operator": i};                           
                };
            };
            return {"type": "error", "error": "Var or Func?"};
        };
    };
    for (rule in simplConditional){
        if (line.startsWith(simplConditional[rule].id + "(")){
            return {"type": "conditional", "contype": simplConditional[rule].id};
        };
    };
    if (line.length > 0){
        return {"type": "error", "error": "Keyword not found"};
    }
};

//controls parsing
//codeArray = array with lines of simpl code trimmed by codeReader()
//return = 
function mainParser(codeArray){
    //all current variables
    variables = [[]];
    let indentLvl = 0;

    for (codeLine in codeArray){
        const statement = lineIdentifier(codeArray[codeLine]);
        switch (statement.type){
            case "error":
                console.log(statement.error);
                break;
            case "end":
                indentLvl -= 1;
                variables[0].pop();
                console.log("}");
                break;
            case "function":
                break;
            case "conditional":
                console.log(conditionalHandler(statement, codeLine, codeArray));
                indentLvl += 1;
                break;
            case "var":
                console.log(variableHandler(statement, codeArray[codeLine]));
                break;
            case "list":
                break;
            default:
                //report error
                break;
        };
    };
    if(indentLvl < 0 || indentLvl > 0){
        return {"type": "error", "error": "indent error"};
    };
};
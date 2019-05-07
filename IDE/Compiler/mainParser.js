//GLOBAL
const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const numbers = ["0","1","2","3","4","5","6","7","8","9"];
const intOperators = ["+","-","/","*"];
const boolOperators = ["=",">","<","&","|"];
const simplType = [{"id": "int"}, {"id": "void"}, {"id": "bool"}];
const simplConditional = [{"id": "while"}, {"id": "for"}, {"id": "if"}]

let variables = [[]]; //all current variables

//Identifies contents of a line of simpl code
//line = string with a simpl code line
//return = json with information about type simpl code
function lineIdentifier(line){
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
    return {"type": "error", "error": "Keyword not found"};
};

//controls parsing
//codeArray = array with lines of simpl code trimmed by codeReader()
//return = 
function mainParser(codeArray){
    //all current variables
    variables = [[]];
    for (codeLine in codeArray){
        const statement = lineIdentifier(codeArray[codeLine]);
        switch (statement.type){
            case "error":
                console.log(statement.error);
                break;
            case "function":
                break;
            case "conditional":
                    break;
            case "var":
                console.log(variableHandler(statement, codeArray[codeLine], variables));
                break;
            case "list":
                break;
            default:
                //report error
                break;
        };
    };
};
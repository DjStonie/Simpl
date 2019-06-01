//GLOBAL
//legal charactes
const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const numbers = ["0","1","2","3","4","5","6","7","8","9"];
//Simpl-type operators
const intOperators = ["+","-","/","*"];
const boolOperators = ["=",">","<","&","|"];
const stringOperators = ["+"];
//simpl types and id
const simplType = [{"id": "int"}, {"id": "void"}, {"id": "bool"}, {"id": "string"}];
const simplConditional = [{"id": "while"}, {"id": "if"}];
//reserved words
const cReservedWords = ["auto","else","long","switch","break","enum","register","typedef","case","extern","return","union","char","float","short","unsigned",
"const","for","signed","void","continue","goto","sizeof","volatile","default","if","static","while","do","int","struct","_Packed","double"];

let variables = [[]]; //all current variables
let functions = []; //all current functions

//Parses and translates lines of Simpl code writes out result if succesful
//code = code to be parsed
//return = N/A
function mainController(code){
    //reset all current variables and functions
    variables = [[]];
    functions = [];
    let writer = "";
    for (codeLines in code){
        const parsedCode = lineController(code[codeLines]);
        if (parsedCode.error){
            reportError(parsedCode);
            break;
        }
        else{
            writer += parsedCode;
        };
    };
    if (writer !== ""){
        fileWriter("CReadyCode.C", writer);
        writeToConsole("Success! File ready.");
    }else if (codeLines == code.length) {
        reportError({"id": "error", "type": "error", "error": "No code found", "line": 0});
    };
};
//Parses and translates lines of code
//codeLines = list of lines with Simpl code
//return = string of translated Simpl
function lineController(codeLines){
    let indentLvl = 0;
    let writer = "";
    for (let codeLine = 0; codeLine < codeLines.length; codeLine++){
        if (codeLines[codeLine] !== ""){
            const lineJson = mainLineIdentifier(codeLines[codeLine]);
            let handler;
            switch (lineJson.id){
                case "end":
                    indentLvl -= 1;
                    variables.pop();
                    handler = "};";
                    break;
                case "error":
                    handler = lineJson;
                    break;
                case "var":
                    handler = varHandler(lineJson, codeLines[codeLine]);
                    break;
                case "function":
                    variables.push([]);
                    handler = functionDeclarationHandler(lineJson, codeLines[codeLine]);
                    break;
                case "conditional":
                    variables.push([]);
                    handler = conditionalParser(lineJson, codeLines[codeLine]);
                    break;
                case "call":
                    handler = functionCallParser(lineJson, codeLines[codeLine]);
                    break;
                case "return":
                    handler = returnParser(codeLines[codeLine].substring(6));
                    break;
                case "ccode":
                    const ccode = cParser(codeLines, codeLine);
                    handler = ccode[0];
                    codeLine = ccode[1];
                    break;
                case "comment":
                    handler = codeLines[codeLine];
                    break;
                default:
                    return {"id": "error", "type": "error", "error": "internal error controller not found", "line": codeLine};           
            };
            if (handler.error){
                return {...handler, "line": codeLine};
            };
            writer += createIndent(indentLvl) +  handler + "\n";
            if (lineJson.id === "function" || lineJson.id === "conditional"){
                indentLvl += 1;
            };
        };
    };
    if (indentLvl !== 0){
        return {"id": "error", "type": "error", "error": "missing }"};
    };
    return writer;
};
//Identifies a line of Simpl code
//codeLine = current line of Simpl code being parsed
//return = json-object with line identifier
function mainLineIdentifier(codeLine){
    if (codeLine === "}"){
        return {"id": "end"};
    };
    if (codeLine.startsWith("//")){
        return {"id": "comment"};
    };
    if (codeLine === "c{"){
        return {"id": "ccode"};
    };
    if (codeLine.startsWith("return")){
        return {"id": "return"};
    };
    for (simpl in simplType){
        if (codeLine.startsWith(simplType[simpl].id)){
            const exprVarIndex = codeLine.indexOf("=");
            const exprFunctionIndex = codeLine.indexOf("(");
            if (exprVarIndex > 0 && (exprVarIndex < exprFunctionIndex || exprFunctionIndex < 0)){
                return {"id": "var", "type": simplType[simpl].id, "operator": exprVarIndex};
            }else if (exprFunctionIndex > 0 && (exprFunctionIndex < exprVarIndex || exprVarIndex < 0)){
                return {"id": "function", "type": simplType[simpl].id, "operator": exprFunctionIndex};
            };
            return {"id": "error", "type": "error", "error": "variable or function?"};
        };
    };
    for (simpl in simplConditional){
        if (codeLine.startsWith(simplConditional[simpl].id + "(")){
            return {"id": "conditional", "type": "conditional", "contype": simplConditional[simpl].id};
        };
    };
    for (stack in variables){
        for (vars in variables[stack]){
            if(codeLine.startsWith(variables[stack][vars].name)){
                return {...variables[stack][vars], "id": "var"};
            };
        };
    };
    for (func in functions){
        if(codeLine.startsWith(functions[func].name)){
            return {...functions[func], "id": "call", "operator": exprIndex};
        };
    };
    return {"id": "error", "type": "error", "error": "keyword not found " + codeLine};
};
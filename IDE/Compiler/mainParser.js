//GLOBAL
const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const numbers = ["0","1","2","3","4","5","6","7","8","9"];
const intOperators = ["+","-","/","*"];
const boolOperators = ["=",">","<","&","|"];
const stringOperators = ["+"];
const simplType = [{"id": "int"}, {"id": "void"}, {"id": "bool"}, {"id": "string"}];
const simplConditional = [{"id": "while"}, {"id": "if"}];
const cReservedWords = ["auto","else","long","switch","break","enum","register","typedef","case","extern","return","union","char","float","short","unsigned",
"const","for","signed","void","continue","goto","sizeof","volatile","default","if","static","while","do","int","struct","_Packed","double"];
//ARDUINO reserved words

let variables = [[]]; //all current variables
let functions = []; //all current functions

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
        fileWriter("CompiledCode.C", writer);
        writeToConsole("Success! File ready.");
    };
};

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
                    handler = {...lineJson, "line": codeLine};
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
            return {"id": "error", "type": "error", "error": "var or func?"};
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
/*
//Chooses correct handler according to the expected type
//expr = expression to be passed to correct handler
//typeExpected = the expected type of expr
//return =  result of specific handler or error if no handler could be found
function expressionHandler(expr, typeExpected){
    //console.log("expression handler: " + expr+ " "+ typeExpected);
    switch (typeExpected){
        case "int":
            return verifyIntExpr(expr);
        case "bool":
            return verifyBoolExpr(expr);
        case "string":
            return verifyStringExpr(expr);   
    };
    return {"type": "error", "error": "internal - could not find handler for expression"};
};

//Identifies contents of a line of simpl code
//line = string with a simpl code line
//return = json with information about type simpl code
function lineIdentifier(line){
    //test for end }
    if (line === "}"){
        return {"type": "end"};
    };
    //search for all keywords in simplType
    for (rule in simplType){
        if (line.startsWith(simplType[rule].id)){
            if (simplType[rule].id === "void"){
                const endOfName = line.indexOf("(");
                if (endOfName > 0){
                    return {"type": "function", "functiontype": simplType[rule].id, "operator": endOfName};
                };
                return {"type": "error", "error": "void but no function"};
            };
            if(line.charAt(simplType[rule].id.length) === "["){
                return {"type": "list", "listtype": simplType[rule].id, "operator": simplType[rule].id.length};
            };
            //test for function or variable declaration what comes first "=" or "("?
            for (let i = simplType[rule].id.length; i < line.length; i++){
                if (line.charAt(i) === "("){
                    if (line.indexOf("{") > 0){
                        return {"type": "function", "functiontype": simplType[rule].id, "operator": i};
                    }
                    return {"type": "error", "error": "syntax missing {"};
                };
                if (line.charAt(i) === "="){
                    return {"type": "var", "vartype": simplType[rule].id, "operator": i};                           
                };
            };
            return {"type": "error", "error": "Var or Func?"};
        };
    };
    //for all keywords for condtionals
    for (rule in simplConditional){
        if (line.startsWith(simplConditional[rule].id + "(")){
            return {"type": "conditional", "contype": simplConditional[rule].id};
        };
    };
    //for all functions
    for (func in functions){
        if (line.startsWith(functions[func].name + "(")){
            return {"type": "function", "functiontype": "call", "name": functions[func].name};
        };
    };
    if (line.startsWith("return")){
        return {"type": "return"};
    };
    if (line.length > 0){
        return {"type": "error", "error": "Keyword not found"};
    };
};

//controls parsing
//codeArray = array with lines of simpl code trimmed by codeReader()
//return = 
function mainParser(imports, codeArray){
    let writer = "//Imported code\n\n";
    //reset all current variables
    variables = [[]];
    functions = [];
    let indentLvl = 0;
    for (codeLine in imports){
        if (imports[codeLine] !== ""){ //move to codereader?
            const statement = lineIdentifier(imports[codeLine]);
            switch (statement.type){
                case "error":
                    console.log({...statement, "line": parseInt(codeLine) + 1});
                    break;
                case "end":
                    indentLvl -= 1;
                    variables.pop();
                    console.log("};");
                    break;
                case "function":
                    console.log(functionHandler(statement, imports[codeLine]));
                    indentLvl += 1;
                    break;
                case "conditional":
                    console.log(conditionalHandler(statement, codeLine, imports));
                    indentLvl += 1;
                    break;
                case "var":
                    var varHandler = variableHandler(statement, imports[codeLine], indentLvl)
                    console.log(varHandler)
                    if (varHandler.type === "error"){
                        console.log("Sket en fejl")
                    }
                    break;
                case "list":
                    break;
                case "return":
                    console.log(returnHandler(imports[codeLine].substring(6)));
                    break;
                default:
                    //report error
                    break;
            };
        };
    };
    writer += "\n//Your code\n\n";
    for (codeLine in codeArray){
        if (codeArray[codeLine] !== ""){ //move to codereader?
            const statement = lineIdentifier(codeArray[codeLine]);
            switch (statement.type){
                case "error":
                    console.log({...statement, "line": parseInt(codeLine) + 1});
                    break;
                case "end":
                    indentLvl -= 1;
                    variables.pop();
                    for (var i = 0;i < indentLvl;i++){
                        writer += "    ";
                    }
                    writer += "};\n";
                    break;
                case "function":
                    var handler = functionHandler(statement, codeArray[codeLine])
                    if (handler.type == "error"){
                        var textArea2 = document.getElementById("console");
                        textArea2.value = textArea2.value+"You made a mistake on line "+(parseInt(codeLine)+1)+": "+handler.error+"\n"
                    }else{
                        for (var i = 0;i < indentLvl;i++){
                            writer += "    ";
                        }
                        writer += handler+"\n";
                    }
                    indentLvl += 1;
                    break;
                case "conditional":
                    var handler = conditionalHandler(statement, codeLine, codeArray)
                    if (handler.type == "error"){
                        var textArea2 = document.getElementById("console");
                        textArea2.value = textArea2.value+"You made a mistake on line "+(parseInt(codeLine)+1)+": "+handler.error+"\n"
                    }else{
                        for (var i = 0;i < indentLvl;i++){
                            writer += "    ";
                        }
                        writer += handler;
                    }
                    indentLvl += 1;
                    break;
                case "var":
                    var handler = variableHandler(statement, codeArray[codeLine], indentLvl)
                    if (handler.type == "error"){
                        var textArea2 = document.getElementById("console");
                        textArea2.value = textArea2.value+"You made a mistake on line "+(parseInt(codeLine)+1)+": "+handler.error+"\n"
                    }else{
                        for (var i = 0;i < indentLvl;i++){
                            writer += "    ";
                        }
                        writer += handler;
                    }
                    break;
                case "list":
                    break;
                case "return":
                    var handler = returnHandler(codeArray[codeLine].substring(6))
                    if (handler.type == "error"){
                        var textArea2 = document.getElementById("console");
                        textArea2.value = textArea2.value+"You made a mistake on line "+(parseInt(codeLine)+1)+": "+handler.error+"\n"
                    }else{
                        for (var i = 0;i < indentLvl;i++){
                            writer += "    ";
                        }
                        writer += handler+"\n";
                    }
                    break;
                default:
                    //report error
                    break;
            };
        };
    };
    if(indentLvl !== 0){
        var textArea2 = document.getElementById("console");
        textArea2.value = textArea2.value+"You made a mistake on indents\n"
    };
    var blob = new Blob([writer], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "CompiledCode.C");
};*/
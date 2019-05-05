        //Splits on newline into array
        //also removes white space and changes everything to lower case
        //code = string
        //return = array with trimmed strings split on \n
        function codeReader(code){
            let codeLines = code.split("\n");
            for (line in codeLines) {
                codeLines[line] = codeLines[line].replace(/\s/g, "").toLowerCase();
            };
            return codeLines;
        };

        
        function lookUpVar(name, variables){
            //console.log(variables);
            for (stack in variables){
                for (vars in stack){
                    //console.log("lookup: " + variables[stack][vars]);
                    if (variables[stack][vars] && name === variables[stack][vars].name){
                        return variables[stack][vars].vartype;
                    }
                }
            }
            return {"type": "error", "errortype": "could not find var"};
        }

        function varWriter(typeObj, expression){
            //console.log(typeObj.vartype);
            switch(typeObj.vartype){
                case "int":
                    const newLine = typeObj.vartype + " " + typeObj.name + " = " + expression + ";\n";
                    //console.log("newLine: " + newLine); 
                    return newLine;
                    break;             
                case "char":
                    break;
                case "string":
                    break;
                case "bool":
                    break;
                }

            return {"error": "internal", "errortype": "varWriter - no match"}
        }

        function testChar(char, set){
            //console.log(char);
            //console.log(set);
            for (chars in set){
                if (char === set[chars]){
                    return true;
                };
            };
            return false;
        };

        //maybe change to error?
        function verifyName(nameStr){
            const numbers = ["0","1","2","3","4","5","6","7","8","9"];
            const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
            if (nameStr.length > 0){
                //console.log("result of test: " + testChar(nameStr.charAt(0)), letters);
                if (testChar(nameStr.charAt(0), letters)){
                    for (let i = 1; i < nameStr.length; i++){
                        //console.log(!testChar(nameStr.charAt(i), numbers));
                        //console.log(!testChar(nameStr.charAt(i), letters));
                        if (!(testChar(nameStr.charAt(i), numbers) || testChar(nameStr.charAt(i), letters))){
                            //console.log(nameStr.charAt(i));
                            return {"type": "error", "error": "name error wrong char"};
                        };
                    };
                    return {"type": "ok"};
                };
                return {"type": "error", "error": "naming error, var cannot start with number"};
            };
            return {"type": "error", "error": "name error too short"};;
        };

        function intExpressionHandler(expr){
            const numbers = ["0","1","2","3","4","5","6","7","8","9"];
            const operators = ["+","-","/","*"];
            let mustBeNumber = false;
            if (expr.length > 0){
                if (expr.charAt(0) === "-"){
                    mustBeNumber = true;
                } else if (!testChar(expr.charAt(0), numbers)){
                    return {"type": "error", "error": "int must start with - or number"};
                }
                if (testChar(expr.charAt(expr.length - 1), numbers)){
                    for (let i = 1; i < expr.length; i++){
                        if (mustBeNumber){
                            if (!testChar(expr.charAt(i), numbers)){
                                console.log(expr.charAt(i));
                                console.log(!testChar(expr.charAt(i), numbers));
                                return {"type": "error", "error": "number expected"};
                            };
                            mustBeNumber = false;
                        }
                        else {
                            let isNumber = testChar(expr.charAt(i), numbers);
                            let isOperator = testChar(expr.charAt(i), operators);
                            if (isOperator){
                                mustBeNumber = true;
                            }else if (isNumber){
                                mustBeNumber = false;
                            }
                            if (!(isOperator || isNumber)){
                                return {"type": "error", "error": "illegal char number or operator expected"};
                            };
                        };  
                    };
                    return {"type": "int"};
                };
                return {"type": "error", "error": "int must end with number"};
            };
            return {"type": "error", "error": "int epr too short"}
        };

        //identifier??? verify type? typeChecker
        function expressionHandler(expr, typeExpected){
            //console.log("called exphandler, type expected: " + typeExpected);
            switch (typeExpected){
                case "int":
                    return intExpressionHandler(expr);
                    break;
            };
            return {"type": "error", "error": "could not find handler for expression"}
            //return "int";
        };

        //get indent?
        function variableHandler(newVar, line, variables){
            //verify name
            const name = line.substring(newVar.vartype.length, newVar.operator);

            const verifiedName = verifyName(name);
            //console.log("verify name");
            //console.log(verifiedName);
            if (verifiedName.type === "error"){
                return verifiedName;
            };

            if (lookUpVar(name, variables).type !== "error"){
                return {"type": "error", "error": "var already created"};
            };

            const expression = line.substring(newVar.operator + 1, line.length);
            const expressionType = expressionHandler(expression, newVar.vartype);

            if (expressionType.type === "error"){
                return expressionType;
            }

            if (lookUpVar(name, variables))
            //console.log("name: " + name);
            //console.log("expression: " + expression);
            //console.log("expression type: " + expressionType);
            if (newVar.vartype === expressionType.type){
                newVar = {...newVar, "name": name};
                variables[0].push(newVar);
                return varWriter(newVar, expression);
            };
            return {"type": "error", "error": "Type error"}
        };

        function lineIdentifier(line){
            //console.log(line);
            const simplType = [{"id": "int"}, {"id": "void"}];
            const simplConditional = [{"id": "while"}, {"id": "for"}, {"id": "if"}]
            for (rule in simplType){
                if (line.startsWith(simplType[rule].id)){
                    if (simplType[rule].id === "void"){
                        const endOfName = line.indexOf("(");
                        if (endOfName > 0){
                            //return endOfName
                            return {"type": "function", "functiontype": simplType[rule].id};
                        }
                        return {"type": "error", "error": "void but no function"};
                    }
                    if(line.charAt(simplType[rule].id.length) === "["){
                        console.log("list");
                        return {"type": "list", "listtype": simplType[rule].id, "operator": simplType[rule].id.length};
                    };
                    //test for function or variable declaration
                    for (let i = simplType[rule].id.length; i < line.length; i++){
                        //return i as well!!
                        if (line.charAt(i) === "("){
                            return {"type": "function", "functiontype": simplType[rule].id, "operator": i};
                        }
                        if (line.charAt(i) === "="){
                            return {"type": "var", "vartype": simplType[rule].id, "operator": i};                           
                        };
                    };
                    return {"type": "error", "error": "Var or Func?"};
                };
            };
            for (rule in simplConditional){
                if (line.startsWith(simplConditional[rule].id + "(")){
                    console.log("conditional");
                    return {"type": "conditional", "contype": simplConditional[rule].id};
                };
            };

            return {"type": "error", "error": "Keyword not found"};
        };

        function mainParser(codeArray){
            let variables = [[]];
            for (codeLine in codeArray){
                //console.log(lineIdentifier(codeArray[codeLine]));
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
                        //console.log("end of line: ");
                        console.log(variableHandler(statement, codeArray[codeLine], variables));
                        break;
                    case "list":
                        break;
                    default:
                        //report error
                        break;
                }
            };
        };
/*
        function mainParser(codeArray){
            for (codeLine in codeArray){
                console.log(lineIdentifier(codeArray[codeLine]));
                switch (lineIdentifier(codeArray[codeLine]).id){
                    case "error":
                        console.log(codeArray[codeLine].error);
                        break;
                    case "function":
                        break;
                    case "if":
                        break;
                    case "while":
                        break;
                    case "for":
                        break;
                    case "int":
                        break;
                    case "bool":
                        break;
                    case "string":
                        break;
                    case "char":
                        break;
                    case "list":
                        break;
                    default:
                        //report error
                        break;
                }
            };
        };
*/
        /*
        //Splits each string in an array into its own array
        //Return value might contain blank spaces among the elements
        //should convert to lower case
        function codeReader(code){
            let codeLines = code.split("\n");
            for (line in codeLines) {
                codeLines[line] = codeLines[line].split(" ");
            };
            return codeLines;
        };

        $( "#compile-c" ).click(() => {
            event.preventDefault();
            //use return value of codeReader to give to parser
            //system could save at this point
            //Splitting on new line to maintain line numbers
            mainParser(codeReader($("#code").val()));

        });

        function findWord(lineRef, index){
            for (word in lineRef){
                if (lineRef[word] !== ""){
                    return { "keyword": LineRef[word], "linePos": word };
                };
            };
            return {"error": "could not find word"};
        };

        function keyWordIdentifier(potentialKeyword, keyWordPos){

            const simplRules = [{"rule": "int"}];
            //const embeddedRules = {};
            for (rule in simplRules){
                if (simplRules[rule].rule === potentialKeyword){
                    if 
                };
            };
            //imported rules
        };

        function mainParser(arrayRef){
            for (lineOfCode in arrayRef){
                //console.log(lineOfCode);
                const keyword = findWord(arrayRef[lineOfCode], 0);

                if (keyword.error){
                    //handle keyword.error
                    //stop iteration
                }
                
                if (keyword.keyword === "int"){
                    console.log("INT");
                }

            

            };
        };
*/

/*
        function declarationHandler(chunk){

            
        };

        function stdDeclarationEndFinder(arrayRef, declarationLine, declarationIndex){
            
            while(declarationLine < arrayRef.length && declarationIndex < arrayRef[arrayRef.length - 1].length){
                if(arrayRef[declarationLine][declarationIndex].indexOf(";") > 0){
                    return {"endLine": declarationLine, "endIndex": declarationIndex};
                }
                startIndex++;
                if (declarationIndex === arrayRef[declarationLine].length){
                    declarationIndex = 0;
                    declarationLine++;
                };
            }

            return {"error": "missing ;"}
            
        };

        function chunkFinder(arrayRef, startLine, startIndex){

            while(startLine < arrayRef.length){
                
                if(arrayRef[startLine][startIndex] === "="){

                    return {...stdDeclarationEndFinder(arrayRef, startLine, startIndex), "typeLine": startLine, "typeIndex": startIndex };
                };

                startIndex++;
                if (startIndex === arrayRef[startLine].length){
                    startIndex = 0;
                    startLine++;
                };
            };
        };

        function chunker(startLine, startIndex, arrayRef){

            while(startLine < arrayRef.length && startIndex < arrayRef[arrayRef.length - 1].length){
                
                const newChunk = chunkFinder(arrayRef, startLine, startIndex);
                return {...newChunk, "startLine": startLine, "startIndex": startIndex};

                startIndex++;
                if (startIndex === arrayRef[startLine].length){
                    startIndex = 0;
                    startLine++;
                };
            };

        };

        function declarationHandler(arrayref, chunk){


        };


        function mainParser(arrayRef){

            let startLine = 0;
            let startIndex = 0;
            while(startLine < arrayRef.length && startIndex < arrayRef[arrayRef.length - 1].length){
                const nextChunk = chunker(startLine, startIndex, arrayRef);

                if (nextChunk.error){
                    //return the error
                }
                if (arrayRef[nextChunk.typeLine][nextChunk.typeIndex] === "="){
                    declarationHandler(arrayRef, nextChunk);
                }
                //if...

                
            };
            
            //look for keyword
            //pass to correct function
            //save strings
        };

        */
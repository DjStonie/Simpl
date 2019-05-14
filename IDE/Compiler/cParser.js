function cParser(codeLines, codeLine){
    let cCode = "//your c\n";
    for (let i = codeLine + 1; i < codeLines.length; i++){
        if (codeLines[i] === "}"){
            return [cCode, i];
        };
        cCode += codeLines[i] + "\n";
    };
    return [{"id": "error", "type": "error", "error": "missing }"}, i];
};
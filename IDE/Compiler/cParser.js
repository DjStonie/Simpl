//Parses c-code found in Simpl code
//codelines = all lines of code currently being parsed
//codeLine = index of line where start of c-tag was found
//return = string with all the lines of c found or error
function cParser(codeLines, codeLine){
    let cCode = "//Unparsed C code\n";
    for (let i = codeLine + 1; i < codeLines.length; i++){
        if (codeLines[i].replace(/\s/g, "") === "#"){
            return [cCode, i];
        };
        cCode += codeLines[i] + "\n";
    };
    return [{"id": "error", "type": "error", "error": "c-code missing #"}, i];
};
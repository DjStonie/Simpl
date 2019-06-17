//Creates whitespace according to level of indent
//indentLvl = amount of white space to be created
//return = amount of white space 
function createIndent(indentLvl){
    let indent = "";
    for (var i = 0;i < indentLvl;i++){
        indent += "    ";
    }
    return indent;
}
//Writes a file to disk with specified name
//writes a file to disk
//name = string with name of new file
//writer = string to be written to file
//return = N/A
function fileWriter(name, writer){
    var blob = new Blob([writer], {type: "text/plain;charset=utf-8"});
    saveAs(blob, name);
};
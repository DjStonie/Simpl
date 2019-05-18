function createIndent(indentLvl){
    let indent = "";
    for (var i = 0;i < indentLvl;i++){
        writer += "    ";
    }
    return indent;
}

function fileWriter(name, writer){
    var blob = new Blob([writer], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "name");
};
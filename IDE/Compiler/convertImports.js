// converts import lines to the code from the hidden textfield
function getConvertedCode() {
    //Getting value from hiden html element and spliting in lines
    var importCode = $("#importCode").val();
    var importSplit = importCode.split("\n");
    //map to save imports in
    var imports = {};

    var activeImport = "";
    for (line in importSplit) {
        // if it starts with import try to save all future lines until a line starts with importEnd
        if (importSplit[line].includes("import ")){
            importSplit[line]=importSplit[line].replace("import ","");
            imports[importSplit[line]] = "";
            activeImport = importSplit[line];
        }else if (importSplit[line].includes("importEnd ")){
            activeImport = "";
        }else{
            if (activeImport !=""){
                imports[activeImport] += "\n"+importSplit[line];
            }
        }
    };
    var code = $("#code").val();
    var toProcessImports = "";
    if (imports.length!=0){
        //replace imports with the code for the import
        for (var k in imports){
            if (code.includes("import "+k)){
                code = code.replace("import "+k,"")
                toProcessImports += imports[k];
            }
        };
    }
    return [toProcessImports,code];
};
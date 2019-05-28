// Used to save imports and hide them in html
function convertImports(s) {
    var importSplit = s.split("\n");
    //map to save imports in
    var imports = {};

    var activeImport = "";
    for (line in importSplit) {
        //find all import code and save it in map
        if (importSplit[line].includes("import ")){
            importSplit[line]=importSplit[line].replace("import ","");
            imports[importSplit[line]] = "import "+importSplit[line];
            activeImport = importSplit[line];
        }else if (importSplit[line].includes("importEnd ")){
            imports[activeImport] += "\n"+importSplit[line];
            activeImport = "";
        }else{
            if (activeImport !=""){
                imports[activeImport] += "\n"+importSplit[line];
            }
        }
    };

    if (imports.length!=0){
        var textArea = document.getElementById("importCode");
        textArea.value = "";
        //replace the code for the imports with just one line and hide the imported code
        for (var k in imports){
                s = s.replace(imports[k],"import "+k)
                if (textArea.value !=""){                 
                    textArea.value += "\n";
                }
                textArea.value += imports[k];
        };
    }
    return s;
};

function loadButton() {
    var file = document.getElementById("loadExtern").files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var textArea = document.getElementById("code");
        textArea.value = convertImports(e.target.result);
    };
    reader.readAsText(file);
};


function importButton() {
    var file = document.getElementById("importExtern").files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        //save imports in the hidden html textarea and insert import name at the top of coding area
        var textArea = document.getElementById("importCode");
        if (textArea.value != ""){
            textArea.value += "\n";
        }
        textArea.value += "import "+file.name.replace('.Simpl', '')+"\n";
        textArea.value += e.target.result;
        textArea.value += "\nimportEnd "+file.name.replace('.Simpl', '')+"\n";
        var textArea2 = document.getElementById("code");
        textArea2.value = "import "+file.name.replace('.Simpl', '')+"\n"+textArea2.value;
    };
    reader.readAsText(file);
};

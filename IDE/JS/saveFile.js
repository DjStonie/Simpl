function saveButton(s) {
    var blob = new Blob([$("#code").val()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, s+".Simpl");
};

function saveConsoleButton() {
    var blob = new Blob([$("#console").val()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "Console.log");
};
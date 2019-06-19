function newButton() {
    $("#code").val("");
    $("#console").val("");
};

function newButtonINO() {
    $("#code").val("void setup(){\n//if you wanna use our Arduino library remember to call simpl()\n}\n\nvoid loop(){\n\n}");
    $("#console").val("");
};
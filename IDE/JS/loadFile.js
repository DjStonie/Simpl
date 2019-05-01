function loadButton() {
    var file = document.getElementById("loadExtern").files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var textArea = document.getElementById("code");
        textArea.value = e.target.result;
    };
    reader.readAsText(file);
};
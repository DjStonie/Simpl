function cParser(codeLines, codeLine){
    let cCode = "//your c\n";
    for (let i = codeLine + 1; i < codeLines.length; i++){
        if (codeLines[i] === "}"){
            return [cCode, i];
        };
        cCode += codeLines[i] + "\n";
    };
    return [{"id": "error", "type": "error", "error": "c-code missing }"}, i];
};

/*
c{
//altmuligt
//sjov
}


int i = 1

int j = i + 1
j = j + j

if (true){
int k = i
int w = k
}

int w = 2
int l = true

int func(int tre, int fire){
int u = tre
int wert = fire
return u
}
bool kl = true
int kiavs = func(i, j + i) + 12

bool func1(bool hep, int hip, bool hap){
return 2 > 3
int tjep = hip
}

bool kjeld = func1(true, 0, fire > 2a
*/
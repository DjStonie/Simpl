function testCompiler(){
    testFindBoolOperator();
    testCorrectBoolExprForC();
    testBoolExpressionParser();
};

function testFindBoolOperator(){
    const testExprList = ["2+1",">","3-4"];
    const testError = findBoolOperator(1, testExprList);
    const testCorrect = findBoolOperator(0, testExprList);
    if(!testError && testCorrect){
        return "OK";
    };
    return "findBoolOperater ERROR!";
};
function testCorrectBoolExprForC(){
    const testExpr = "1&|=2";
    const testResult = "1&&||==2";
    if (correctBoolExprForC(testExpr) === testResult){
        return "OK";
    };
    return "correctBoolExprForC ERROR!";
};

function testBoolExpressionParser(){
    const testExpression = "45+345>23&&false";
    const testResult = "bool";
    const test = boolExpressionParser(testExpression);
    const testCorrect = test.type && test.type === testResult;

    const errorExpression = "345464574573&&323";
    const testError = boolExpressionParser(errorExpression).error;

    if (testCorrect && !testError){
        return "OK";
    };
    return "boolExpressionParser ERROR!";
};

function testConditionalParser(){
    
};
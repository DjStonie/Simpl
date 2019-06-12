c#
int LED1 = 7;
int LED2 = 8;
int LED3 = 9;
#
void blinkled(int lednumber){
c#
  if(lednumber < 10 && lednumber > 6){
    digitalWrite(lednumber, HIGH);
    delay(1000);
    digitalWrite(lednumber, LOW);
    delay(1000);
  }else{
    lednumber = 7;
    while (lednumber < 10){
      blinkled(lednumber);
      lednumber++;
    }
  }
#
}

void setup() {
  c#
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
#
}
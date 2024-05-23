/*******************************************************************************
 * Start of Arduino_GFX setting
 *
 * Arduino_GFX try to find the settings depends on selected board in Arduino IDE
 * Or you can define the display dev kit not in the board list
 * Defalult pin list for non display dev kit:
 * Arduino Nano, Micro and more: CS:  9, DC:  8, RST:  7, BL:  6, SCK: 13, MOSI: 11, MISO: 12
 * ESP32 various dev board     : CS:  5, DC: 27, RST: 33, BL: 22, SCK: 18, MOSI: 23, MISO: nil
 * ESP32-C3 various dev board  : CS:  7, DC:  2, RST:  1, BL:  3, SCK:  4, MOSI:  6, MISO: nil
 * ESP32-S2 various dev board  : CS: 34, DC: 38, RST: 33, BL: 21, SCK: 36, MOSI: 35, MISO: nil
 * ESP32-S3 various dev board  : CS: 40, DC: 41, RST: 42, BL: 48, SCK: 36, MOSI: 35, MISO: nil
 * ESP8266 various dev board   : CS: 15, DC:  4, RST:  2, BL:  5, SCK: 14, MOSI: 13, MISO: 12
 * Raspberry Pi Pico dev board : CS: 17, DC: 27, RST: 26, BL: 28, SCK: 18, MOSI: 19, MISO: 16
 * RTL8720 BW16 old patch core : CS: 18, DC: 17, RST:  2, BL: 23, SCK: 19, MOSI: 21, MISO: 20
 * RTL8720_BW16 Official core  : CS:  9, DC:  8, RST:  6, BL:  3, SCK: 10, MOSI: 12, MISO: 11
 * RTL8722 dev board           : CS: 18, DC: 17, RST: 22, BL: 23, SCK: 13, MOSI: 11, MISO: 12
 * RTL8722_mini dev board      : CS: 12, DC: 14, RST: 15, BL: 13, SCK: 11, MOSI:  9, MISO: 10
 * Seeeduino XIAO dev board    : CS:  3, DC:  2, RST:  1, BL:  0, SCK:  8, MOSI: 10, MISO:  9
 * Teensy 4.1 dev board        : CS: 39, DC: 41, RST: 40, BL: 22, SCK: 13, MOSI: 11, MISO: 12
 ******************************************************************************/
#include <Arduino_GFX_Library.h>
#include "graphics.c"

#define GFX_BL 15 //backlight pin
Arduino_DataBus *bus = new Arduino_ESP32SPI(4 /* DC */, 15 /* CS */, 17 /* SCK */, 16 /* MOSI */, 5 /* MISO */);
Arduino_GFX *gfx = new Arduino_ILI9488_18bit(bus, 2 /* RST /, 1 / rotation */, false /* IPS */);

const int MAX_GRAPHIC_OPTIONS = 3; 
char *graphicOptions[MAX_GRAPHIC_OPTIONS]{
	"happy",
	"neutral",
	"mad"
};

bool in_graphics;
int prev_state = 1, state = 1, num_items = 3;

//extern uint8_t happy[], neutral[], mad[];

/*******************************************************************************
 * End of Arduino_GFX setting
 ******************************************************************************/

void setup(void)
{
  Serial.begin(115200);

#ifdef GFX_EXTRA_PRE_INIT
  GFX_EXTRA_PRE_INIT();
#endif

  // Init Display
  if (!gfx->begin())
  {
    Serial.println("gfx->begin() failed!");
  }
  gfx->fillScreen(BLACK);

#ifdef GFX_BL
  pinMode(GFX_BL, OUTPUT);
  digitalWrite(GFX_BL, HIGH);
#endif

  gfx->setCursor(10, 10);
  gfx->setTextColor(RED);
  gfx->println("Setup Done");

  delay(5000); // 5 seconds
}

void loop()
{
  if(Serial.available() > 0){
    String data = Serial.readStringUntil('\n');
    if (data.charAt(data.length() - 1) <= 'a' && data.charAt(data.length() - 1) >= 'z') {                      // check if data ends with newline character
        data = data.substring(0, data.length() - 1);  // remove newline character
    }
    Serial.println(data);
    if (data.length() > 0 && data.charAt(0) >= 'a' && data.charAt(0) <= 'z') {
    for (int i = 0; i < num_items; i++) { 
      if (strstr(graphicOptions[i], data.c_str()) != NULL) {
        in_graphics = true;
      }
      if(in_graphics){
        changeState(data);
      }
    }
  }
  }
  
  if(state != prev_state){
    switch (state) {  // Screen Selection
        case (0): 
          Serial.println("im happy");
          happy_screen();
          break;
        case (1): 
          Serial.println("im ok");
          neutral_screen();
          break;
        case (2): 
          Serial.println("im mad");
          mad_screen();
          break;
    }
  }
}

void happy_screen(){
    gfx->fillScreen(gfx->color565(70, 157, 233));                                                      // blue background
    gfx->drawBitmap(100, 85, happy, 78, 135, gfx->color565(0, 0, 0));
}

void neutral_screen(){
    gfx->fillScreen(gfx->color565(70, 157, 233));                                                      // blue background
    gfx->drawBitmap(100, 85, neutral, 78, 135, gfx->color565(0, 0, 0));
}

void mad_screen(){
    gfx->fillScreen(gfx->color565(70, 157, 233));                                                      // blue background

    gfx->drawBitmap(100, 85, mad, 78, 135, gfx->color565(0, 0, 0));
}

void changeState(String data) {
  char* mydata = new char[strlen(data.c_str())+1];
  strcpy(mydata,data.c_str());
  prev_state = state;
  if (strstr(mydata, "happy")) { state = 0; }
  if (strstr(mydata, "neutral")) { state = 1; }
  if (strstr(mydata, "mad")) { state = 2; }
  delete[] mydata;
}

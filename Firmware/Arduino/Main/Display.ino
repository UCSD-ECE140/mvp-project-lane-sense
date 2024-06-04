
/*
Initialize your Display
*/
#define GFX_BL 15  //backlight pin
Arduino_DataBus *bus = new Arduino_ESP32SPI(4 /* DC */, 15 /* CS */, 17 /* SCK */, 16 /* MOSI */, 5 /* MISO */);
Arduino_GFX *gfx = new Arduino_ILI9488_18bit(bus, 2 /* RST /, 1 / rotation */, false /* IPS */);

void happy_screen() {
  gfx->fillScreen(gfx->color565(70, 157, 233));  // blue background
  gfx->drawBitmap(0, 0, happy, 320, 240, gfx->color565(0, 200, 0));
}

void neutral_screen() {
  gfx->fillScreen(gfx->color565(70, 157, 233));  // blue background
  gfx->drawBitmap(0, 0, neutral, 320, 240, gfx->color565(0, 0, 0));
}

void mad_screen() {
  gfx->fillScreen(gfx->color565(70, 157, 233));  // blue background
  gfx->drawBitmap(0, 0, mad, 320, 240, gfx->color565(255, 255, 255));
}

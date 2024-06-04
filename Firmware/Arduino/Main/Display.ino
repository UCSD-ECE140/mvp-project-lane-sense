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

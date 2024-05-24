#include <Arduino.h>
#include <Wire.h>
#include <MPU9250.h>

#include <SPI.h>

#include <Arduino_GFX_Library.h>
#include "graphics.c"

#define GFX_BL 15  //backlight pin
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

MPU9250 mpu;

void setup() {
    Serial.begin(115200);
    #ifdef GFX_EXTRA_PRE_INIT
      GFX_EXTRA_PRE_INIT();
    #endif

      // Init Display
      if (!gfx->begin()) {
        Serial.println("gfx->begin() failed!");
      }
      gfx->fillScreen(BLACK);

    #ifdef GFX_BL
      pinMode(GFX_BL, OUTPUT);
      digitalWrite(GFX_BL, HIGH);
    #endif

      gfx->setCursor(10, 10);
      gfx->setTextColor(RED);
      gfx->println("Set Done")

    Wire.begin(21, 22); // Change these pins if needed
    delay(2000);

    if (!mpu.setup(0x68)) {  // Change to your own address
        while (1) {
            sendMessage("MPU connection failed. Please check your connection with `connection_check` example.");
            delay(5000);
        }
    }
}

void loop() {
    if (mpu.update()) {
        static uint32_t prev_ms = millis();
        if (millis() > prev_ms + 25) {
            send_sensor_data();
            prev_ms = millis();
        }
    }
      if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    if (data.charAt(data.length() - 1) <= 'a' && data.charAt(data.length() - 1) >= 'z') {  // check if data ends with newline character
      data = data.substring(0, data.length() - 1);                                         // remove newline character
    }
    if (data.length() > 0 && data.charAt(0) >= 'a' && data.charAt(0) <= 'z') {
      Serial.println(data);
      for (int i = 0; i < num_items; i++) {
        if (strstr(graphicOptions[i], data.c_str()) != NULL) {
          in_graphics = true;
          changeState(data);
          if (state != prev_state) {
            switch (state) {  // Screen Selection
              case (0):
                happy_screen();
                break;
              case (1):
                neutral_screen();
                break;
              case (2):
                mad_screen();
                break;
            }
          }
        }
      }
    }
  }
}

void send_sensor_data() {
    String response = String(mpu.getAccX(), 2) + ", " +
                      String(mpu.getAccY(), 2) + ", " +
                      String(mpu.getAccZ(), 2) + ", " +
                      String(mpu.getGyroX(), 2) + ", " +
                      String(mpu.getGyroY(), 2) + ", " +
                      String(mpu.getGyroZ(), 2) + ", " +
                      String(mpu.getMagX(), 2) + ", " +
                      String(mpu.getMagY(), 2) + ", " +
                      String(mpu.getMagZ(), 2) + ", " +
                      String(mpu.getTemperature(), 2);
    sendMessage(response);
}

void print_calibration() {
    Serial.println("< Calibration Parameters >");
    Serial.println("Accel Bias [mg]: ");
    Serial.print(mpu.getAccBiasX() * 1000.f / (float)MPU9250::CALIB_ACCEL_SENSITIVITY);
    Serial.print(", ");
    Serial.print(mpu.getAccBiasY() * 1000.f / (float)MPU9250::CALIB_ACCEL_SENSITIVITY);
    Serial.print(", ");
    Serial.print(mpu.getAccBiasZ() * 1000.f / (float)MPU9250::CALIB_ACCEL_SENSITIVITY);
    Serial.println();
    Serial.println("Gyro Bias [deg/s]: ");
    Serial.print(mpu.getGyroBiasX() / (float)MPU9250::CALIB_GYRO_SENSITIVITY);
    Serial.print(", ");
    Serial.print(mpu.getGyroBiasY() / (float)MPU9250::CALIB_GYRO_SENSITIVITY);
    Serial.print(", ");
    Serial.print(mpu.getGyroBiasZ() / (float)MPU9250::CALIB_GYRO_SENSITIVITY);
    Serial.println();
    Serial.println("Mag Bias [mG]: ");
    Serial.print(mpu.getMagBiasX());
    Serial.print(", ");
    Serial.print(mpu.getMagBiasY());
    Serial.print(", ");
    Serial.print(mpu.getMagBiasZ());
    Serial.println();
    Serial.println("Mag Scale []: ");
    Serial.print(mpu.getMagScaleX());
    Serial.print(", ");
    Serial.print(mpu.getMagScaleY());
    Serial.print(", ");
    Serial.print(mpu.getMagScaleZ());
    Serial.println();
}

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

void changeState(String data) {
  char *mydata = new char[strlen(data.c_str()) + 1];
  strcpy(mydata, data.c_str());
  prev_state = state;
  if (strstr(mydata, "neutral")) { state = 1; }
  if (strstr(mydata, "Harsh braking detected!")) { state = 2; }
  if (strstr(mydata, "Harsh turning detected!")) { state = 2; }
  if (strstr(mydata, "Harsh acceleration detected!")) { state = 2; }
  if (strstr(mydata, "Car flipped detected")) { state = 2; }
  else (strstr(mydata, "happy")) { state = 0; }

  delete[] mydata;
  data = "";
}

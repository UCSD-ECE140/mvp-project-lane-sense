#include <Arduino.h>
#include <Wire.h>
#include "MPU9250.h"
#include <SPI.h>

MPU9250 mpu;

void setup() {
    Serial.begin(115200);
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

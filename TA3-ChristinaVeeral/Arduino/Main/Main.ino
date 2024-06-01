#include <Arduino.h>
#include <Wire.h>
#include "MPU9250.h"
#include <SPI.h>
#include "BluetoothSerial.h"
#include <EEPROM.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>


#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define DRIVE_DATA_CHAR_UUID "beefcafe-36e1-4688-b7f5-00000000000b"


const float accelerationThreshold = 3.0;
const float brakingThreshold = -3.0;
const float turningThreshold = 30.0;
const unsigned long durationThreshold = 500;
unsigned long accelerationStartTime = 0;
unsigned long brakingStartTime = 0;
unsigned long turningStartTime = 0;
const int redPin = 25;
const int greenPin = 26;

MPU9250 mpu;
//BLECharacteristic *pDriveDataCharacteristic;
BluetoothSerial SerialBT;


void setup() {
   Serial.begin(115200);
   Wire.begin(21, 22);
   pinMode(redPin, OUTPUT);
   pinMode(greenPin, OUTPUT);
   SerialBT.begin("Pookie");  //Bluetooth device name

   mpu.setup(0x68); 
   delay(5000);
  
   mpu.calibrateAccelGyro();
   mpu.calibrateMag();


   while(!SerialBT.connected()) {
       digitalWrite(redPin, HIGH);
       delay(500);
       digitalWrite(redPin, LOW);
       delay(500);
   }
   digitalWrite(greenPin, HIGH);
}


void loop() {
       while(!SerialBT.connected()) {
         digitalWrite(greenPin, LOW);
         digitalWrite(redPin, HIGH);
         delay(500);
         digitalWrite(redPin, LOW);
         delay(500);
     }
    
   if (mpu.update()) {
       // Update the sensor readings
       mpu.update_accel_gyro();
       mpu.update_mag();

       // Retrieve the latest quaternion values
       float qw = mpu.getQuaternionW();
       float qx = mpu.getQuaternionX();
       float qy = mpu.getQuaternionY();
       float qz = mpu.getQuaternionZ();


       // Update roll, pitch, and yaw based on the latest quaternion values
       mpu.update_rpy(qw, qx, qy, qz);


       // Get the roll, pitch, and yaw
       float roll = mpu.getRoll();
       float pitch = mpu.getPitch();
       float yaw = mpu.getYaw();


       // Get the Euler angles
       float eulerX = mpu.getEulerX();
       float eulerY = mpu.getEulerY();
       float eulerZ = mpu.getEulerZ();

         String message = "connected";
        SerialBT.println(message); 
       
       
       // Get linear acceleration values
       float linearAccX = mpu.getLinearAccX();
       float linearAccY = mpu.getLinearAccY();
       float linearAccZ = mpu.getLinearAccZ();         
       unsigned long currentTime = millis();
       float gyroZ = mpu.getGyroZ();

        // Check for harsh acceleration
       if (linearAccX > accelerationThreshold) {
           if (accelerationStartTime == 0) {
               accelerationStartTime = currentTime;
           } else if ((currentTime - accelerationStartTime) >= durationThreshold) {
                                            String message = "Acceleration: " + String(linearAccX);
                                            SerialBT.println(message); 
                                            //harshAcceleration();
                                            delay(1000); 
                                            accelerationStartTime = 0; 
           }
       } else {
           accelerationStartTime = 0;
       }


       // Check for harsh braking
       if (linearAccX < brakingThreshold) {
           if (brakingStartTime == 0) {
               brakingStartTime = currentTime;
           } else if ((currentTime - brakingStartTime) >= durationThreshold) {
                                              String message = "Break: " + String(linearAccX);
                                              SerialBT.println(message); 
                                              delay(1000); // Wait for 1 second before sending the next message
                                              brakingStartTime = 0; // Reset the timer
           }
       } else {
           brakingStartTime = 0;
       }


       // Check for harsh turning
       if (abs(gyroZ) > turningThreshold) {
           if (turningStartTime == 0) {
               turningStartTime = currentTime;
           } else if ((currentTime - turningStartTime) >= durationThreshold) {
                                              String message = "Turn: " + String(gyroZ-turningThreshold);
                                              SerialBT.println(message); 
                                              //harshTurn();
                                              delay(1000); 
                                              turningStartTime = 0; // Reset the timer
           }
       } else {
           turningStartTime = 0;
       }
   }
}

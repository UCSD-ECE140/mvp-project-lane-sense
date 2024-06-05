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

#define bleServerName "Pookie"
bool deviceConnected = false;
#define SERVICE_UUID "91bad492-b950-4226-aa2b-4ede9fa42f59"

// UUIDs for the characteristics
#define HARSH_EVENTS_CHAR_UUID "ca73b3ba-39f6-4ab3-91ae-186dc9577d99"

const float accelerationThreshold = 1.0;
const float brakingThreshold = -3.0;
const float turningThreshold = 5.0;
const unsigned long durationThreshold = 500;
unsigned long accelerationStartTime = 0;
unsigned long brakingStartTime = 0;
unsigned long turningStartTime = 0;

const int redPin = 25;
const int greenPin = 26;

unsigned int harshAccelerationCount = 0;
unsigned int harshBrakingCount = 0;
unsigned int harshTurningCount = 0;

// BLE Characteristic and Descriptor
BLECharacteristic harshEventsCharacteristic(HARSH_EVENTS_CHAR_UUID, BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor harshEventsDescriptor(BLEUUID((uint16_t)0x2902));

MPU9250 mpu;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Device connected");
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Device disconnected");
  }
};

void setup() {
   Serial.begin(115200);
   Wire.begin(21, 22);
   pinMode(redPin, OUTPUT);
   pinMode(greenPin, OUTPUT);

   // Create the BLE Device
   BLEDevice::init(bleServerName);

   // Create the BLE Server
   BLEServer *pServer = BLEDevice::createServer();
   pServer->setCallbacks(new MyServerCallbacks());

   // Create the BLE Service
   BLEService *mpuService = pServer->createService(SERVICE_UUID);

   // Create BLE Characteristic and add Descriptor
   mpuService->addCharacteristic(&harshEventsCharacteristic);
   harshEventsDescriptor.setValue("MPU9250 Harsh Events");
   harshEventsCharacteristic.addDescriptor(&harshEventsDescriptor);

   // Start the service
   mpuService->start();

   // Start advertising
   BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
   pAdvertising->addServiceUUID(SERVICE_UUID);
   pServer->getAdvertising()->start();
   Serial.println("Waiting for a client connection to notify...");

   // Initialize MPU9250
   if (!mpu.setup(0x68)) {
       Serial.println("MPU9250 setup failed!");
       while (1);
   }
   delay(5000);
   mpu.calibrateAccelGyro();
   mpu.calibrateMag();
}

void loop() {
  if (deviceConnected) {
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
          harshAccelerationCount++;
          sendHarshEventCounts();
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
          harshBrakingCount++;
          sendHarshEventCounts();
          brakingStartTime = 0;
        }
      } else {
        brakingStartTime = 0;
      }

      // Check for harsh turning
      if (abs(gyroZ) > turningThreshold) {
        if (turningStartTime == 0) {
          turningStartTime = currentTime;
        } else if ((currentTime - turningStartTime) >= durationThreshold) {
          harshTurningCount++;
          sendHarshEventCounts();
          turningStartTime = 0;
        }
      } else {
        turningStartTime = 0;
      }
    }
  } else {
    Serial.println("No device connected");
    delay(1000); // Avoid spamming the log
  }
}

void sendHarshEventCounts() {
  char harshEventCounts[150];
  snprintf(harshEventCounts, sizeof(harshEventCounts), "%d %d %d", harshTurningCount, harshBrakingCount, harshAccelerationCount);
  harshEventsCharacteristic.setValue(harshEventCounts);
  harshEventsCharacteristic.notify();
}
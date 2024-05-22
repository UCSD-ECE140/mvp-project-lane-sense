int sampleTime = 0; // Time of last sample (in Sampling tab)
// Acceleration values recorded from the readAccelSensor() function
int ax = 0; 
int ay = 0; 
int az = 0;
bool sending; // Flag indicating whether data is being sent
float timer = 0; // Timer variable for timing purposes
unsigned long previoustimer; // Previous timer value for comparison
bool setupActive; // Flag indicating whether setup is active

void setup() {
  // Initialize components and setup
  setupAccelSensor(); // Initialize accelerometer sensor
  setupCommunication(); // Initialize communication
  setupDisplay(); // Initialize display
  setupMotor(); // Initialize motor
  sending = false; // Set sending flag to false
  setupActive = true; // Set setup active flag to true
  writeDisplay("Sleep", 0, true); // Write "Sleep" message to display
}

void loop() {
  // Receive commands and respond accordingly
  String command = receiveMessage(); // Receive command from communication
  if (command == "sleep") {
    // Handle sleep command
    sending = false; // Stop sending data
    writeDisplay("Sleep", 0, true); // Write "Sleep" message to display
    deactivateMotor(); // Deactivate motor
  
  } else if (command == "wearable") {
    // Handle wearable command
    sending = true; // Start sending data
    writeDisplay("Wearable", 0, true); // Write "Wearable" message to displ           ay
    deactivateMotor(); // Deactivate motor
 
  } else if (command == "Person has been inactive for 5 or more seconds") {
    // Handle inactive command
    writeDisplay("Inactive", 0, true); // Write "Inactive" message to display
    if (setupActive) {
      // If setup is active, activate motor for 1 second
      unsigned long start = millis(); // Get current time
      activateMotor(255); // Activate motor at full power
      while (millis() - start < 1000) {
          // Wait for 1 second
      }
      deactivateMotor(); // Deactivate motor after 1 second
    }  
  } else if (command == "Person is active again.") {
    // Handle active command
    sending = true; // Start sending data
    writeDisplay("Active", 0, true); // Write "Active" message to display
    deactivateMotor(); // Deactivate motor
  }

  // If sending data and sensors are sampled successfully, send data
  if (sending && sampleSensors()) {
    // Create response string with sensor data
    String response = String(sampleTime) + "," + String(ax) + "," + String(ay) + "," + String(az) + "\n";
    sendMessage(response); // Send response message via communication
  }
}

// Define the pin constants
const int X_PIN = A0;
const int Y_PIN = A1;
const int Z_PIN = A2;

// Function to set up the accelerometer sensor
void setupAccelSensor() {
    pinMode(X_PIN, INPUT);
    pinMode(Y_PIN, INPUT);
    pinMode(Z_PIN, INPUT);
}

// Function to read the accelerometer sensor
void readAccelSensor() {
    extern int ax; // Declare the global variable
    extern int ay; // Declare the global variable
    extern int az; // Declare the global variable

    ax = analogRead(X_PIN);
    ay = analogRead(Y_PIN);
    az = analogRead(Z_PIN);
}

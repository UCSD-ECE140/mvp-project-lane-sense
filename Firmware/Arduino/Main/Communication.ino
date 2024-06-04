/*
 * Initialize the communication protocol
 */
void setupCommunication() {
  Serial.begin(115200);
}

/*
 * Receive a message one character at a time, stopping at a newline ('\n')
 */
String receiveMessage() {
  String message = "";
  while (Serial.available() > 0) {
    delay(10); // Add a small delay to allow incoming serial data to be fully received and processed
    char c = Serial.read();
    if (c == '\n') {
      break;
    }
    message += c;
  }
  return message;
}

/*
 * Send a message over the communication protocol
 */
void sendMessage(String message) {
  Serial.println(message);
}


// Audio audio;

// void setup_SD(){

//     digitalWrite(SD_CS, HIGH);
//     digitalWrite(GFX_BL, LOW);

//     // Set up SD card
//     SPI.begin(SPI_SCK, SPI_MISO, SPI_MOSI);
//     if (!SD.begin(SD_CS)) {
//         Serial.println("Error initializing SD card!");
//         return;
//     }
// }

// void setup_audio(){
//     digitalWrite(SD_CS, HIGH);
//     digitalWrite(GFX_BL, LOW);

//     // Set up audio library
//     audio.setPinout(DAC_PIN1, DAC_PIN2,25); // Configure DAC pins
//     audio.setVolume(15); // Set volume level (0 to 21)
// }

// void play_audio(const char* sample){ //insert file path such as "mp3/0001.mp3"
//     digitalWrite(SD_CS, HIGH);
//     digitalWrite(GFX_BL, LOW);

//     audio.connecttoFS(SD, sample); // Connect to MP3 file
//     audio.loop();
// }
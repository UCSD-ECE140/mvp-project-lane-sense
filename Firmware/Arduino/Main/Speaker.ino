XT_DAC_Audio_Class DacAudio(25,0);    

void playSpeaker(unsigned char* sample){
  XT_Wav_Class Sound(sample);
  DacAudio.FillBuffer();                
  if(Sound.Playing==false)       
    DacAudio.Play(&Sound);   
}
from CommLib.Communication import Communication
from CommLib.CircularList import CircularList
from CommLib.QuaternionFilter import QuaternionFilter
from matplotlib import pyplot as plt
from time import time, sleep
import numpy as np



if __name__ == "__main__":
    # Configuration
    num_samples = 250               # 2 seconds of data @ 50Hz
    refresh_time = 0.1              # update the plot every 0.1s (10 FPS)

    # Circular lists to store data
    times = CircularList([], num_samples)
    ax = CircularList([], num_samples)
    ay = CircularList([], num_samples)
    az = CircularList([], num_samples)
    gx = CircularList([], num_samples)
    gy = CircularList([], num_samples)
    gz = CircularList([], num_samples)
    mx = CircularList([], num_samples)
    my = CircularList([], num_samples)
    mz = CircularList([], num_samples)
    temperature = CircularList([], num_samples)
    ax_value = 0.0
    ay_value = 0.0
    az_value = 0.0
    gx_value = 0.0
    gy_value = 0.0
    gz_value = 0.0
    mx_value = 0.0
    my_value = 0.0
    mz_value = 0.0
    temperature_value = 0.0
    
    # Communication setup
    comms = Communication("/dev/cu.usbserial-0001", 115200)
    sleep(3)
    quat_filter = QuaternionFilter()

    try:
        previous_time = 0
        while(True):
            message = comms.receive_message()
            if message is not None:
                try:
                    parts = message.split(',')
                    if len(parts) == 10:
                        parts = [part.strip() for part in parts]
                        (ax_value, ay_value, az_value,
                        gx_value, gy_value, gz_value,
                        mx_value, my_value, mz_value,
                        temperature_value) = parts
                        ax_value = float(ax_value)
                        ay_value = float(ay_value)
                        az_value = float(az_value)
                        gx_value = float(gx_value)
                        gy_value = float(gy_value)
                        gz_value = float(gz_value)
                        mx_value = float(mx_value)
                        my_value = float(my_value)
                        mz_value = float(mz_value)
                        temperature_value = float(temperature_value)
                        
                    
                except ValueError as e:
                    print("Failed to convert to float:", e)
                    print("Received message:", message)
                    continue
                
                quat_filter.update(ax_value, ay_value, az_value, gx_value, gy_value, gz_value, mx_value, my_value, mz_value)
                ax.add(ax_value)
                ay.add(ay_value)
                az.add(az_value)
                gx.add(gx_value)
                gy.add(gy_value)
                gz.add(gz_value)
                mx.add(mx_value)
                my.add(my_value)
                mz.add(mz_value)
                temperature.add(temperature_value)

                                
                 # Harsh event detection
                if ax_value < -2.0 and ay_value < 0.5 and az_value > 9.0:
                    comms.send_message("Harsh braking detected!")
                    
                if ax_value > 2.0:
                    comms.send_message("Harsh acceleration detected!")
                    
                if abs(gy_value) > 2.0:  
                    comms.send_message("Harsh turning detected!")
                    
                
                # Check for a flipped car
                if az_value < -9.0:
                    print("flipped")
                    comms.send_message("Car flipped detected")
                

    except(Exception, KeyboardInterrupt) as e:
        print(e)                     # Exiting the program due to exception
    finally:
        comms.send_message("sleep")  # stop sending data
        comms.close()




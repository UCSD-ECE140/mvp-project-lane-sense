from CommLib.Communication import Communication
from CommLib.CircularList import CircularList
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
    
    running_avg_ax = CircularList([], num_samples)
    running_avg_ay = CircularList([], num_samples)
    running_avg_az = CircularList([], num_samples)
    sample_diff = CircularList([], num_samples)
    l2_norm = CircularList([], num_samples)
    l1_norm = CircularList([], num_samples)
    custom_transform = CircularList([], num_samples)

    # Communication setup
    comms = Communication("/dev/cu.usbserial-0001", 115200)
    sleep(3)
    #comms.clear()                   # just in case any junk is in the pipes
    
    try:
        previous_time = 0
        while(True):
            message = comms.receive_message()
            print(message)
            if message is not None:
                try:
                    parts = message.split(',')
                    (timestamp, ax_value, ay_value, az_value,
                     gx_value, gy_value, gz_value,
                     mx_value, my_value, mz_value,
                     temperature_value) = parts
                    timestamp = float(timestamp)
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
                except ValueError:        # if corrupted data, skip the sample
                    continue

                # add the new values to the circular lists
                times.add(timestamp / 1000)
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

                # if enough time has elapsed, clear the axis, and plot data
                current_time = time()
                if (current_time - previous_time > refresh_time):
                    previous_time = current_time
                    plt.cla()
                    plt.clf()
                    
                    # Original data plotting (example with az)
                    plt.plot(times.data, ax.data, label='ax')
                    plt.plot(times.data, ay.data, label='ay')
                    plt.plot(times.data, az.data, label='az')
                    
                    #Add more plots for other variables if needed
                    plt.plot(times.data, ax.data, label='ax')
                    plt.plot(times.data, ay.data, label='ay')
                    plt.plot(times.data, gx.data, label='gx')
                    plt.plot(times.data, gy.data, label='gy')
                    plt.plot(times.data, gz.data, label='gz')
                    plt.plot(times.data, mx.data, label='mx')
                    plt.plot(times.data, my.data, label='my')
                    plt.plot(times.data, mz.data, label='mz')
                    plt.plot(times.data, temperature.data, label='temperature')

                    plt.legend()
                    plt.draw()
                    plt.pause(0.001)

    except(Exception, KeyboardInterrupt) as e:
        print(e)                     # Exiting the program due to exception
    finally:
        #comms.send_message("sleep")  # stop sending data
        comms.close()

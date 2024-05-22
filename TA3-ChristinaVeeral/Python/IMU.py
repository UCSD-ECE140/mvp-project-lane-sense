from CommLib.Communication import Communication
from CommLib.CircularList import CircularList
from matplotlib import pyplot as plt
from time import time, sleep
import numpy as np
from math import sqrt

if __name__ == "__main__":
    # Configuration
    num_samples = 250               # 2 seconds of data @ 50Hz
    refresh_time = 0.1              # update the plot every 0.1s (10 FPS)

    # Circular lists to store data
    times = CircularList([], num_samples)
    ax = CircularList([], num_samples)
    ay = CircularList([], num_samples)
    az = CircularList([], num_samples)
    running_avg_ax = CircularList([], num_samples)
    running_avg_ay = CircularList([], num_samples)
    running_avg_az = CircularList([], num_samples)
    sample_diff = CircularList([], num_samples)
    l2_norm = CircularList([], num_samples)
    l1_norm = CircularList([], num_samples)
    custom_transform = CircularList([], num_samples)

    # Communication setup
    comms = Communication("/dev/cu.usbserial-1460", 115200)
    sleep(3)
    comms.clear()                   # just in case any junk is in the pipes
    comms.send_message("wearable")  # begin sending data

    try:
        previous_time = 0
        while(True):
            message = comms.receive_message()
            if(message != None):
                try:
                    (m1, m2, m3, m4) = message.split(',')
                except ValueError:        # if corrupted data, skip the sample
                    continue

                # add the new values to the circular lists
                times.add(int(m1)/1000)
                ax.add(int(m2))
                ay.add(int(m3))
                az.add(int(m4))

                running_avg_ax.add(np.mean(ax))
                running_avg_ay.add(np.mean(ay))
                running_avg_az.add(np.mean(az))

                # Calculate sample differences
                if len(ax) >= 2 and len(ay) >= 2 and len(az) >= 2:
                    sample_diff_data = np.diff(np.array([ax[-1], ay[-1], az[-1]])).tolist()
                    sample_diff.add(sample_diff_data)
                else:
                    sample_diff.add([0, 0, 0])  # Add placeholder if there are not enough samples for diff calculation

                # Calculate L2 norm
                l2_norm_data = sqrt(ax[-1]**2 + ay[-1]**2 + az[-1]**2)
                l2_norm.add(l2_norm_data)

                # Calculate L1 norm
                l1_norm_data = abs(ax[-1]) + abs(ay[-1]) + abs(az[-1])
                l1_norm.add(l1_norm_data)

                # Calculate custom transformation
                custom_transform_data = ax[-1] * ay[-1]
                custom_transform.add(custom_transform_data)

                # if enough time has elapsed, clear the axis, and plot az
                current_time = time()
                if (current_time - previous_time > refresh_time):
                    previous_time = current_time
                    plt.cla()
                    plt.clf()
                    
                    # Original data
                    plt.subplot(3, 2, 1)
                    plt.plot(times, ax, label='ax', color='blue')  # Specify blue color
                    plt.plot(times, ay, label='ay', color='red')   # Specify red color
                    plt.plot(times, az, label='az', color='green') # Specify green color
                    plt.legend()
                    plt.title('Original Data')

                    # Running averages
                    plt.subplot(3, 2, 2)
                    plt.plot(times, running_avg_ax, label='Avg ax', color='blue')  # Specify blue color
                    plt.plot(times, running_avg_ay, label='Avg ay', color='red')   # Specify red color
                    plt.plot(times, running_avg_az, label='Avg az', color='green') # Specify green color
                    plt.legend()
                    plt.title('Running Averages')

                    # Sample difference
                    plt.subplot(3, 2, 3)
                    plt.plot(times[:len(sample_diff)], sample_diff, label='Sample Difference', color='purple')
                    plt.title('Sample Difference')

                    # L2 norm
                    plt.subplot(3, 2, 4)
                    plt.plot(times, l2_norm, label='L2 Norm', color='orange')  # Specify orange color
                    plt.legend()
                    plt.title('L2 Norm')

                    # L1 norm
                    plt.subplot(3, 2, 5)
                    plt.plot(times, l1_norm, label='L1 Norm', color='cyan')  # Specify cyan color
                    plt.legend()
                    plt.title('L1 Norm')

                    # Custom transformation
                    plt.subplot(3, 2, 6)
                    plt.plot(times, custom_transform, label='Custom Transform', color='magenta')  # Specify magenta color
                    plt.legend()
                    plt.title('Custom Transformation')

                    plt.xlabel('')
                    plt.ylabel('')
                    plt.show(block=False)
                    plt.pause(0.001)

    except(Exception, KeyboardInterrupt) as e:
        print(e)                     # Exiting the program due to exception
    finally:
        comms.send_message("sleep")  # stop sending data
        comms.close()
